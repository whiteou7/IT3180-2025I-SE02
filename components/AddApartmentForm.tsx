import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"

type AddApartmentFormProps = {
  onSubmit?: () => void
}

export function AddApartmentForm({ onSubmit }: AddApartmentFormProps) {
  const [formData, setFormData] = useState({
    buildingId: 0,
    floor: 0,
    apartmentNumber: 0,
    monthlyFee: 0,
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await ofetch<APIBody<{ apartmentId: number }>>("/api/apartments", {
        method: "POST",
        body: formData,
        ignoreResponseError: true,
      })

      if (res.success) {
        toast.success(res.message ?? "Apartment created successfully")
        // Reset form
        setFormData({
          buildingId: 0,
          floor: 0,
          apartmentNumber: 0,
          monthlyFee: 0,
        })
        onSubmit?.()
      } else {
        toast.error(res.message ?? "Failed to create apartment")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while creating apartment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buildingId">Building ID *</Label>
          <Input
            id="buildingId"
            type="number"
            value={formData.buildingId || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="floor">Floor *</Label>
          <Input
            id="floor"
            type="number"
            value={formData.floor || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apartmentNumber">Apartment Number *</Label>
          <Input
            id="apartmentNumber"
            type="number"
            value={formData.apartmentNumber || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyFee">Monthly Fee *</Label>
          <Input
            id="monthlyFee"
            type="number"
            value={formData.monthlyFee || ""}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Apartment"}
        </Button>
      </form>
    </div>
  )
}

import { useEffect, useState } from "react"
import { Apartment } from "@/types/apartments"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"

type ApartmentInfoFormProps = {
  userId?: string
  apartmentId?: number
  onSubmit?: () => void
}

export function ApartmentInfoForm({ userId, apartmentId, onSubmit }: ApartmentInfoFormProps) {
  const [formData, setFormData] = useState<Apartment>({
    apartmentId: 0,
    buildingId: 0,
    floor: 0,
    apartmentNumber: 0,
    monthlyFee: 0,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchApartment() {
      if (!userId && !apartmentId) return
      setLoading(true)
      try {
        const url = userId
          ? `/api/users/${userId}/apartments`
          : `/api/apartments/${apartmentId}`

        const res = await ofetch<APIBody<Apartment>>(url, {
          ignoreResponseError: true,
        })

        if (res.success && res.data) {
          setFormData(res.data)
        } else {
          toast.error(res.message ?? "Failed to load apartment info")
        }
      } catch (err) {
        console.error(err)
        toast.error("An error occurred while fetching apartment data.")
      } finally {
        setLoading(false)
      }
    }

    fetchApartment()
  }, [userId, apartmentId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: type === "number" ? Number(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await ofetch<APIBody<Apartment>>(
        `/api/apartments/${formData.apartmentId}`,
        {
          method: "PUT",
          body: formData,
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        toast.success(res.message ?? "Apartment updated successfully")
      } else {
        toast.error(res.message ?? "Failed to update apartment")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while updating.")
    }
    onSubmit?.()
  }

  return (
    <div>
      {loading ? (
        <p>Loading apartment info...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apartmentId">Apartment ID</Label>
            <Input
              id="apartmentId"
              type="number"
              value={formData.apartmentId}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingId">Building ID</Label>
            <Input
              id="buildingId"
              type="number"
              value={formData.buildingId}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              type="number"
              value={formData.floor}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apartmentNumber">Apartment Number</Label>
            <Input
              id="apartmentNumber"
              type="number"
              value={formData.apartmentNumber}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyFee">Monthly Fee</Label>
            <Input
              id="monthlyFee"
              type="number"
              value={formData.monthlyFee}
              onChange={handleChange}
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      )}
    </div>
  )
}

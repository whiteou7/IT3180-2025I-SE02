import { useState } from "react"
import { Apartment } from "@/types/apartments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"

type ApartmentInfoFormProps = {
  apartment: Apartment
}

export function ApartmentInfoForm({ apartment }: ApartmentInfoFormProps) {
  const [formData, setFormData] = useState({
    apartmentId: apartment.apartmentId,
    buildingId: apartment.buildingId,
    floor: apartment.floor,
    apartmentNumber: apartment.apartmentNumber,
    monthlyFee: apartment.monthlyFee,
  })
  console.log(formData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target
    // parse number inputs to number
    const parsed = type === "number" ? (value === "" ? "" : Number(value)) : value
    setFormData(prev => ({ ...prev, [id]: parsed }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await ofetch<APIBody<Apartment>>(`/api/apartments/${apartment.apartmentId}`, {
      method: "PUT",
      body: formData,
      ignoreResponseError: true,
    })

    if (!res.success) {
      toast.error(res.message)
    } else {
      toast.success(res.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apartment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apartmentId">Apartment ID</Label>
            <Input id="apartmentId" value={formData.apartmentId} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingId">Building ID</Label>
            <Input id="buildingId" type="number" value={formData.buildingId} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Floor</Label>
            <Input id="floor" type="number" value={String(formData.floor)} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apartmentNumber">Apartment Number</Label>
            <Input id="apartmentNumber" type="number" value={String(formData.apartmentNumber)} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyFee">Monthly Fee</Label>
            <Input id="monthlyFee" type="number" value={String(formData.monthlyFee)} onChange={handleChange} />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}

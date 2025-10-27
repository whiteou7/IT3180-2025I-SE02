import { useEffect, useState } from "react"
import { Property } from "@/types/properties"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"
type PropertyInfoFormProps = {
  propertyId: number
  userId: string
  onSubmit?: () => void
  onDelete?: () => void
}

export function PropertyInfoForm({
  propertyId,
  userId,
  onSubmit,
  onDelete,
}: PropertyInfoFormProps) {
  const [propertyName, setPropertyName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchProperty() {
      if (!propertyId || !userId) return
      setLoading(true)
      try {
        const res = await ofetch<APIBody<Property>>(
          `/api/users/${userId}/properties/${propertyId}`,
          {
            ignoreResponseError: true,
          }
        )

        if (res.success && res.data) {
          setPropertyName(res.data.propertyName)
        } else {
          toast.error(res.message ?? "Failed to load property info")
        }
      } catch (err) {
        console.error(err)
        toast.error("An error occurred while fetching property data.")
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
     
  }, [propertyId, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await ofetch<APIBody<Property>>(
        `/api/users/${userId}/properties/${propertyId}`,
        {
          method: "PUT",
          body: {
            propertyName: propertyName,
          },
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        toast.success(res.message ?? "Property updated successfully")
      } else {
        toast.error(res.message ?? "Failed to update property")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while updating.")
    } finally {
      setLoading(false)
    }
    onSubmit?.()
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const res = await ofetch<APIBody<Property>>(
        `/api/users/${userId}/properties/${propertyId}`,
        {
          method: "DELETE",
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        toast.success(res.message ?? "Property deleted successfully")
        onDelete?.()
      } else {
        toast.error(res.message ?? "Failed to delete property")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while deleting.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {loading ? (
        <p>Loading property info...</p>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input
                id="propertyName"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete Property
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

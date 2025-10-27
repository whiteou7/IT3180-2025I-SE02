import { useEffect, useState } from "react"
import { User } from "@/types/users"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"
import { useUserStore } from "@/store/userStore"
import { Apartment } from "@/types/apartments"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UserInfoForm({ userId, onSubmit }: { userId: string, onSubmit?: () => void }) {
  const [formData, setFormData] = useState<User>({
    userId: "",
    email: "",
    fullName: "",
    yearOfBirth: 0,
    role: "tenant",
    gender: "male",
  })

  const [loading, setLoading] = useState(false)
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [currentApartmentId, setCurrentApartmentId] = useState<number | null>(null)
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null)

  const currentRole = useUserStore(s => s.role)
  const authorized = currentRole == "admin"

  // Fetch user info
  useEffect(() => {
    async function fetchUser() {
      if (!userId) return
      setLoading(true)
      try {
        const res = await ofetch<APIBody<User>>(`/api/users/${userId}`, {
          ignoreResponseError: true,
        })

        if (res.success && res.data) {
          setFormData(res.data)
        } else {
          toast.error(res.message ?? "Failed to load user info")
        }
      } catch (err) {
        console.error(err)
        toast.error("An error occurred while fetching user data.")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  // Fetch apartments
  useEffect(() => {
    async function fetchApartments() {
      const res = await ofetch<APIBody<Apartment[]>>("/api/apartments", {
        ignoreResponseError: true,
      })

      if (res.success) {
        setApartments(res.data)
      }
    }

    fetchApartments()
  }, [])

  // Fetch user's current apartment
  useEffect(() => {
    async function fetchCurrentApartment() {
      if (!userId) return
      try {
        const res = await ofetch<APIBody<Apartment | null>>(`/api/users/${userId}/apartments`, {
          ignoreResponseError: true,
        })

        if (res.success && res.data && res.data.apartmentId) {
          setCurrentApartmentId(res.data.apartmentId)
          setSelectedApartmentId(res.data.apartmentId)
        } else {
          setCurrentApartmentId(null)
          setSelectedApartmentId(null)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchCurrentApartment()
  }, [userId])

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) || 0 : value,
    }))
  }

  // Handle apartment selection change (only updates state)
  const handleApartmentChange = (value: string) => {
    setSelectedApartmentId(value === "none" ? null : Number(value))
  }

  // Submit updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Update user information
      const res = await ofetch<APIBody<User>>(`/api/users/${formData.userId}`, {
        method: "PUT",
        body: formData,
        ignoreResponseError: true,
      })

      if (res.success) {
        toast.success(res.message ?? "User updated successfully")
      } else {
        toast.error(res.message ?? "Failed to update user")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while updating.")
      return
    }

    // Update apartment assignment if it changed
    if (selectedApartmentId !== currentApartmentId) {
      try {
        if (selectedApartmentId === null) {
          // Remove user from apartment
          const res = await ofetch<APIBody<null>>(`/api/users/${userId}/apartments`, {
            method: "DELETE",
            ignoreResponseError: true,
          })

          if (res.success) {
            toast.success("User removed from apartment")
            setCurrentApartmentId(null)
          } else {
            toast.error(res.message ?? "Failed to remove user from apartment")
          }
        } else {
          // Assign user to apartment
          const res = await ofetch<APIBody<{ apartmentId: number }>>(`/api/users/${userId}/apartments`, {
            method: "PUT",
            body: { apartmentId: selectedApartmentId },
            ignoreResponseError: true,
          })

          if (res.success) {
            toast.success("User assigned to apartment")
            setCurrentApartmentId(selectedApartmentId)
          } else {
            toast.error(res.message ?? "Failed to assign user to apartment")
          }
        }
      } catch (err) {
        console.error(err)
        toast.error("An error occurred while updating apartment assignment.")
      }
    }

    onSubmit?.()
  }

  if (loading) return <p>Loading user data...</p>
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input id="userId" value={userId} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearOfBirth">Year of Birth</Label>
          <Input
            id="yearOfBirth"
            type="number"
            value={formData.yearOfBirth}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" value={formData.role} readOnly={!authorized} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input id="gender" value={formData.gender} onChange={handleChange}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="apartment">Apartment</Label>
          <Select value={selectedApartmentId?.toString() || "none"} onValueChange={handleApartmentChange}>
            <SelectTrigger id="apartment">
              <SelectValue placeholder="Select an apartment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No apartment</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={apt.apartmentId} value={apt.apartmentId.toString()}>
                  {apt.buildingId}-{apt.apartmentNumber} - {apt.members?.length ?? 0} members
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  )
}

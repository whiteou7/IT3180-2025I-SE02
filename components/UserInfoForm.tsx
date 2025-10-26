import { useEffect, useState } from "react"
import { User } from "@/types/users"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"

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

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) || 0 : value,
    }))
  }

  // Submit updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
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
          <Input id="role" value={formData.role} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input id="gender" value={formData.gender} onChange={handleChange}/>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  )
}

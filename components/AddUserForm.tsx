import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"

type AddUserFormProps = {
  onSubmit?: () => void
}

export function AddUserForm({ onSubmit }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "yearOfBirth" ? Number(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await ofetch<APIBody<{ userId: string }>>("/api/users", {
        method: "POST",
        body: formData,
        ignoreResponseError: true,
      })

      if (res.success) {
        toast.success(res.message ?? "User created successfully")
        // Reset form
        setFormData({
          email: "",
          fullName: "",
          password: ""
        })
        onSubmit?.()
      } else {
        toast.error(res.message ?? "Failed to create user")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while creating user.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </div>
  )
}

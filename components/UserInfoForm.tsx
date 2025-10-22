import { useState } from "react"
import { User } from "@/types/users"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { APIBody } from "@/types/api"

type UserInfoFormProps = {
  user: User
}

export function UserInfoForm({ user }: UserInfoFormProps) {
  const [formData, setFormData] = useState({
    email: user.email,
    fullName: user.fullName,
    yearOfBirth: user.yearOfBirth,
    role: user.role,
    gender: user.gender
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await ofetch<APIBody<User>>(`/api/users/${user.userId}`, {
      method: "PUT",
      body: formData,
      ignoreResponseError: true
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
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input id="userId" value={user.userId} readOnly />
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
            <Label htmlFor="year_of_birth">Year of Birth</Label>
            <Input
              id="year_of_birth"
              type="number"
              value={formData.yearOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" value={user.gender} onChange={handleChange}/>
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}

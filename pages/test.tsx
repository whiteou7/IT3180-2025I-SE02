import { UserInfoForm } from "@/components/UserInfoForm"

const mockUser = {
  userId: "123",
  email: "test@example.com",
  fullName: "Jane Doe",
  year_of_birth: 1995,
  role: "admin",
}

export default function Home() {
  return (
    <div>
      <UserInfoForm user={mockUser}></UserInfoForm>
    </div>
  )
}
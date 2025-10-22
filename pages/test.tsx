import { Button } from "@/components/ui/button"
import { UserInfoForm } from "@/components/UserInfoForm"
import { toast } from "sonner"

const mockUser = {
  userId: "123",
  email: "test@example.com",
  fullName: "Jane Doe",
  yearOfBirth: 1995,
  role: "admin",
  gender: "male"
}

export default function Home() {
  return (
    <div>
      <UserInfoForm user={mockUser}></UserInfoForm>
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Be at the area 10 minutes before the event time")
        }
      >
        Info
      </Button>
    </div>
  )
}
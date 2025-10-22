import { ApartmentInfoForm } from "@/components/ApartmentInfoForm"
import { Button } from "@/components/ui/button"
import { UserInfoForm } from "@/components/UserInfoForm"
import { ofetch } from "ofetch"
import { useEffect, useState } from "react"
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
  const [apartment, setApartment] = useState<any>({
    apartmentId: null,
    buildingId: null,
    floor: null,
    monthlyFee: null,
    apartmentNumber: null,

  })

  useEffect(() => {
    (async () => {
      try {
        const res = await ofetch("/api/apartments/3")
        setApartment(res.data)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  return (
    <div>
      <UserInfoForm user={mockUser}></UserInfoForm>
      <ApartmentInfoForm apartment={apartment}></ApartmentInfoForm>
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
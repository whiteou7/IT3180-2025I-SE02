import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "./ui/button"
import { useUserStore } from "@/store/userStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { UserInfoForm } from "./UserInfoForm"

export default function Header() {
  const router = useRouter()
  const userId = useUserStore(s => s.userId)
  const clearUser = useUserStore(s => s.clearUser)

  const handleSignout = () => {
    clearUser()
    router.push("/")
  }

  return (
    <header className="fixed flex items-center justify-between p-4 border-b w-full bg-background z-10">
      <Link href="/feed">
        <h1 className="text-lg font-bold mx-4 hover:text-primary">Apartment Management System</h1>
      </Link>
      {router.pathname !== "/login" && !userId ? (
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      ) : router.pathname !== "/login" && (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Profile</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
              </DialogHeader>

              <UserInfoForm userId={userId} />
            </DialogContent>
          </Dialog>
          <Button onClick={handleSignout} variant="outline">
            Sign Out
          </Button>
        </div>
      )}
    </header>
  )
}

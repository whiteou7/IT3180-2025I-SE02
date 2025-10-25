import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

export default function Header() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    const uid = localStorage.getItem("userId")
    setUserId(uid)
  }, [router])

  const handleSignout = () => {
    localStorage.removeItem("userId")
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
          <Button>
            <Link href="/profile">Profile</Link>
          </Button>
          <Button onClick={handleSignout} variant="outline">
            Sign Out
          </Button>
        </div>
      )}
    </header>
  )
}

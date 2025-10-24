import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "./ui/button"

export default function Header() {
  const router = useRouter()

  return (
    <header className="fixed flex items-center justify-between p-4 border-b w-full bg-background z-10">
      <Link href="/">
        <h1 className="text-lg font-bold mx-4 hover:text-primary">Apartment Management System</h1>
      </Link>
      {router.pathname !== "/login" && (
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      )}
    </header>
  )
}

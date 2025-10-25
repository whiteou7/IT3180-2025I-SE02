
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const handleLogin = () => {
    localStorage.setItem("userId", "7ade6518-e951-417d-ab39-72868530ab44")
    localStorage.setItem("role", "admin")
  }
  return (
    <div className="flex items-center justify-center bg-background pt-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value="admin@gmail.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value="ngoctung2601" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            <Link href="/">Sign In as Demo Admin Account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

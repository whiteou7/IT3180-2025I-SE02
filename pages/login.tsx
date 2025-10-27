
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
import { useUserStore } from "@/store/userStore"

export default function LoginPage() {
  const setUser = useUserStore(s => s.setUser)
  const handleDemoAdminLogin = () => {
    setUser("7ade6518-e951-417d-ab39-72868530ab44", "admin")
  }
  const handleDemoTenant1Login = () => {
    setUser("f87566fa-d527-43aa-9bdc-4bf83b64d3c8", "tenant")
  }
  const handleDemoTenant2Login = () => {
    setUser("fae21f36-1490-40e5-b919-32a2a8edc350", "tenant")
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
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleDemoAdminLogin} className="w-full">
            <Link href="/">Sign In as Demo Admin Account</Link>
          </Button>
          <Button variant="outline" onClick={handleDemoTenant1Login} className="w-full">
            <Link href="/">Sign In as Demo Tenant 1 Account</Link>
          </Button>
          <Button variant="outline" onClick={handleDemoTenant2Login} className="w-full">
            <Link href="/">Sign In as Demo Tenant 2 Account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

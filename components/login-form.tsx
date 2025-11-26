import * as React from "react"
import { useRouter } from "next/router"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUserStore } from "@/store/userStore"
import { ofetch } from "ofetch"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const setUser = useUserStore((state) => state.setUser)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = React.useState(false)
  const [forgotEmail, setForgotEmail] = React.useState("")
  const [forgotPhoneNumber, setForgotPhoneNumber] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [isResetting, setIsResetting] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !password) {
      toast.error("Please provide both email and password.")
      return
    }

    try {
      setIsLoading(true)
      const response = await ofetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
        ignoreResponseError: true,
      })

      if (!response.success) {
        toast.error(response.message ?? "Login failed.")
        return
      }

      const { userId, role, fullName } = response.data

      setUser(userId, role, fullName)
      toast.success(response.message ?? "Login successful.")
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Unable to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotPhoneNumber || !newPassword) {
      toast.error("Please provide email, phone number, and new password.")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }

    try {
      setIsResetting(true)
      const response = await ofetch("/api/auth/reset-password", {
        method: "POST",
        body: {
          email: forgotEmail,
          phoneNumber: forgotPhoneNumber,
          newPassword,
        },
        ignoreResponseError: true,
      })

      if (!response.success) {
        toast.error(response.message ?? "Failed to reset password.")
        return
      }

      toast.success(response.message ?? "Password reset successfully.")
      setIsForgotPasswordOpen(false)
      setForgotEmail("")
      setForgotPhoneNumber("")
      setNewPassword("")
    } catch (error) {
      console.error(error)
      toast.error("Unable to reset password. Please try again.")
    } finally {
      setIsResetting(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    
    try {
      setIsLoading(true)
      const response = await ofetch("/api/auth/login", {
        method: "POST",
        body: { email: demoEmail, password: demoPassword },
        ignoreResponseError: true,
      })

      if (!response.success) {
        toast.error(response.message ?? "Login failed.")
        return
      }

      const { userId, role, fullName } = response.data

      setUser(userId, role, fullName)
      toast.success(response.message ?? "Login successful.")
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Unable to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const demoAccounts = [
    { role: "Admin", email: "admin@gmail.com", password: "admin" },
    { role: "Tenant", email: "tenant@gmail.com", password: "tenant" },
    { role: "Police", email: "police@gmail.com", password: "police" },
    { role: "Accountant", email: "accountant@gmail.com", password: "accountant" },
  ]

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Accounts</CardTitle>
          <CardDescription>
            Click a button below to login as a demo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map((account) => (
              <Button
                key={account.role}
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin(account.email, account.password)}
                disabled={isLoading}
                className="w-full"
              >
                Login as {account.role}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email and phone number to reset your password. Both must match your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                placeholder="m@example.com"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                disabled={isResetting}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="forgot-phone">Phone Number</FieldLabel>
              <Input
                id="forgot-phone"
                type="tel"
                placeholder="+1234567890"
                value={forgotPhoneNumber}
                onChange={(event) => setForgotPhoneNumber(event.target.value)}
                disabled={isResetting}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isResetting}
                required
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsForgotPasswordOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

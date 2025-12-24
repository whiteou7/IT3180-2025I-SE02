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
      toast.error("Vui lòng cung cấp cả email và mật khẩu.")
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
        toast.error(response.message ?? "Đăng nhập thất bại.")
        return
      }

      const { userId, role, fullName } = response.data

      setUser(userId, role, fullName)
      toast.success(response.message ?? "Đăng nhập thành công.")
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Không thể đăng nhập. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotPhoneNumber || !newPassword) {
      toast.error("Vui lòng cung cấp email, số điện thoại và mật khẩu mới.")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.")
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
        toast.error(response.message ?? "Đặt lại mật khẩu thất bại.")
        return
      }

      toast.success(response.message ?? "Đặt lại mật khẩu thành công.")
      setIsForgotPasswordOpen(false)
      setForgotEmail("")
      setForgotPhoneNumber("")
      setNewPassword("")
    } catch (error) {
      console.error(error)
      toast.error("Không thể đặt lại mật khẩu. Vui lòng thử lại.")
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
        toast.error(response.message ?? "Đăng nhập thất bại.")
        return
      }

      const { userId, role, fullName } = response.data

      setUser(userId, role, fullName)
      toast.success(response.message ?? "Đăng nhập thành công.")
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Không thể đăng nhập. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const demoAccounts = [
    { role: "Quản trị viên", email: "admin@gmail.com", password: "admin" },
    { role: "Cư dân", email: "tenant@gmail.com", password: "tenant" },
    { role: "An ninh", email: "police@gmail.com", password: "police" },
    { role: "Kế toán", email: "accountant@gmail.com", password: "accountant" },
  ]

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Đăng nhập tài khoản</CardTitle>
          <CardDescription>
            Nhập email của bạn để đăng nhập vào tài khoản
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
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
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
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
                <FieldDescription className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tài khoản demo</CardTitle>
          <CardDescription>
            Nhấp vào nút bên dưới để đăng nhập với tài khoản demo
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
                Đăng nhập với {account.role}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập email và số điện thoại của bạn để đặt lại mật khẩu. Cả hai phải khớp với tài khoản của bạn.
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
              <FieldLabel htmlFor="forgot-phone">Số điện thoại</FieldLabel>
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
              <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
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
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
            >
              {isResetting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

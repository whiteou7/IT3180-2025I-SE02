import { useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { Home, DollarSign, RotateCcw, Loader2 } from "lucide-react"

import { AuthGate } from "@/components/auth/auth-gate"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserStore } from "@/store/userStore"

export default function FeeManagementPage() {
  const { role } = useUserStore()
  const hasAllowedRole = role === "admin" || role === "accountant"
  const [isCollectingRent, setIsCollectingRent] = useState(false)
  const [isCollectingOther, setIsCollectingOther] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)
  const [isOtherFeeDialogOpen, setIsOtherFeeDialogOpen] = useState(false)
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false)
  const [otherFeeName, setOtherFeeName] = useState("")
  const [otherFeePrice, setOtherFeePrice] = useState("")

  const handleCollectRent = async () => {
    setIsCollectingRent(true)
    try {
      const response = await ofetch<{ success: boolean; message: string; data: { billingCount: number } }>(
        "/api/billings/bulk-collect",
        {
          method: "POST",
          body: { type: "rent" },
          ignoreResponseError: true,
        }
      )

      if (response.success) {
        toast.success(response.message || "Đã thu tiền nhà thành công")
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi thu tiền nhà")
      }
    } catch (error) {
      console.error("Error collecting rent:", error)
      toast.error("Có lỗi xảy ra khi thu tiền nhà")
    } finally {
      setIsCollectingRent(false)
    }
  }

  const handleCollectOtherFee = async () => {
    const price = parseFloat(otherFeePrice)
    if (!otherFeeName.trim()) {
      toast.error("Vui lòng nhập tên khoản phí")
      return
    }
    if (isNaN(price) || price < 0) {
      toast.error("Vui lòng nhập giá hợp lệ (số không âm)")
      return
    }

    setIsCollectingOther(true)
    try {
      const response = await ofetch<{ success: boolean; message: string; data: { billingCount: number } }>(
        "/api/billings/bulk-collect",
        {
          method: "POST",
          body: {
            type: "other",
            name: otherFeeName.trim(),
            price: price,
          },
          ignoreResponseError: true,
        }
      )

      if (response.success) {
        toast.success(response.message || "Đã thu khoản phí thành công")
        setIsOtherFeeDialogOpen(false)
        setOtherFeeName("")
        setOtherFeePrice("")
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi thu khoản phí")
      }
    } catch (error) {
      console.error("Error collecting other fee:", error)
      toast.error("Có lỗi xảy ra khi thu khoản phí")
    } finally {
      setIsCollectingOther(false)
    }
  }

  const handleRollback = async () => {
    setIsRollingBack(true)
    try {
      const response = await ofetch<{ success: boolean; message: string; data: { deletedCount: number } }>(
        "/api/billings/rollback",
        {
          method: "POST",
          ignoreResponseError: true,
        }
      )

      if (response.success) {
        toast.success(response.message || "Đã hoàn tác thành công")
        setIsRollbackDialogOpen(false)
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi hoàn tác")
      }
    } catch (error) {
      console.error("Error rolling back:", error)
      toast.error("Có lỗi xảy ra khi hoàn tác")
    } finally {
      setIsRollingBack(false)
    }
  }

  if (!hasAllowedRole) {
    return (
      <>
        <Head>
          <title>Quản lý Thu phí - Apartment Management System</title>
        </Head>
        <AuthGate
          isAuthenticated={Boolean(role)}
          title="Không có quyền truy cập"
          description="Trang này chỉ dành cho quản trị viên và kế toán."
        >
          <div>Bạn không có quyền truy cập trang này.</div>
        </AuthGate>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Quản lý Thu phí • Thu phí</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/billing">Thu Phí</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quản lý Thu phí</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Quản lý Thu phí</h1>
            <p className="text-muted-foreground text-sm">
              Thu tiền nhà và các khoản phí khác từ tất cả cư dân có căn hộ
            </p>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(role)}>
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Thu tiền nhà
                </CardTitle>
                <CardDescription>
                  Tạo hóa đơn tiền nhà hàng tháng cho tất cả cư dân có căn hộ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCollectRent}
                  disabled={isCollectingRent}
                  className="max-w-xs"
                  size="lg"
                >
                  {isCollectingRent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Thu tiền nhà
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Thu khoản phí khác
                </CardTitle>
                <CardDescription>
                  Tạo hóa đơn cho một khoản phí tùy chỉnh cho tất cả cư dân có căn hộ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsOtherFeeDialogOpen(true)}
                  disabled={isCollectingOther}
                  className="max-w-xs"
                  size="lg"
                  variant="outline"
                >
                  {isCollectingOther ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Thu khoản phí khác
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Button
              onClick={() => setIsRollbackDialogOpen(true)}
              disabled={isRollingBack}
              className="max-w-xs justify-self-end col-span-2"
              size="lg"
              variant="destructive"
            >
              {isRollingBack ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Hoàn tác
                </>
              )}
            </Button>
          </div>
        </AuthGate>

        {/* Other Fee Dialog */}
        <Dialog open={isOtherFeeDialogOpen} onOpenChange={setIsOtherFeeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thu khoản phí khác</DialogTitle>
              <DialogDescription>
                Nhập tên và giá của khoản phí. Hóa đơn sẽ được tạo cho tất cả cư dân có căn hộ.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fee-name">Tên khoản phí</Label>
                <Input
                  id="fee-name"
                  placeholder="Ví dụ: Phí bảo trì, Phí dịch vụ..."
                  value={otherFeeName}
                  onChange={(e) => setOtherFeeName(e.target.value)}
                  disabled={isCollectingOther}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee-price">Giá ($)</Label>
                <Input
                  id="fee-price"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={otherFeePrice}
                  onChange={(e) => setOtherFeePrice(e.target.value)}
                  disabled={isCollectingOther}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOtherFeeDialogOpen(false)
                  setOtherFeeName("")
                  setOtherFeePrice("")
                }}
                disabled={isCollectingOther}
              >
                Hủy
              </Button>
              <Button onClick={handleCollectOtherFee} disabled={isCollectingOther}>
                {isCollectingOther ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rollback Confirmation Dialog */}
        <AlertDialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận hoàn tác</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa hóa đơn mới nhất của mỗi cư dân? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRollingBack}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRollback}
                disabled={isRollingBack}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isRollingBack ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
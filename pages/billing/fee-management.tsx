import { useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { Home, DollarSign, RotateCcw, Loader2, Mail } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUserStore } from "@/store/userStore"

export default function FeeManagementPage() {
  const { role } = useUserStore()
  const hasAllowedRole = role === "admin" || role === "accountant"
  const [isCollectingRent, setIsCollectingRent] = useState(false)
  const [isCollectingOther, setIsCollectingOther] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)
  const [isOtherFeeDialogOpen, setIsOtherFeeDialogOpen] = useState(false)
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  const [otherFeeName, setOtherFeeName] = useState("")
  const [otherFeePrice, setOtherFeePrice] = useState("")
  const [reminderType, setReminderType] = useState<"3days" | "7days" | "overdue">("7days")
  const [isSendingReminders, setIsSendingReminders] = useState(false)
  const [isFetchingUsers, setIsFetchingUsers] = useState(false)
  const [eligibleUsers, setEligibleUsers] = useState<
    Array<{
      userId: string
      email: string
      fullName: string
      bills: Array<{
        billingId: string
        totalAmount: number
        dueDate: string
        daysUntilDue: number
        isOverdue: boolean
      }>
    }>
  >([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")

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
      toast.error((error as Error).message || "Có lỗi xảy ra khi thu tiền nhà")
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
      toast.error((error as Error).message || "Có lỗi xảy ra khi thu khoản phí")
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
      toast.error((error as Error).message || "Có lỗi xảy ra khi hoàn tác")
    } finally {
      setIsRollingBack(false)
    }
  }

  const handleFetchEligibleUsers = async () => {
    setIsFetchingUsers(true)
    setEligibleUsers([])
    setSelectedUserId("")
    try {
      const response = await ofetch<{
        success: boolean
        message: string
        data: Array<{
          userId: string
          email: string
          fullName: string
          bills: Array<{
            billingId: string
            totalAmount: number
            dueDate: string
            daysUntilDue: number
            isOverdue: boolean
          }>
        }>
      }>("/api/billings/send-reminders", {
        method: "GET",
        query: { reminderType },
        ignoreResponseError: true,
      })

      if (response.success) {
        setEligibleUsers(response.data || [])
        if (response.data && response.data.length > 0) {
          toast.success(`Tìm thấy ${response.data.length} người dùng có hóa đơn cần nhắc nhở`)
        } else {
          toast.info("Không có người dùng nào có hóa đơn cần nhắc nhở")
        }
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi tìm người dùng")
      }
    } catch (error) {
      console.error("Error fetching eligible users:", error)
      toast.error((error as Error).message || "Có lỗi xảy ra khi tìm người dùng")
    } finally {
      setIsFetchingUsers(false)
    }
  }

  const handleSendReminder = async () => {
    if (!selectedUserId) {
      toast.error("Vui lòng chọn người dùng để gửi email")
      return
    }

    setIsSendingReminders(true)
    try {
      const response = await ofetch<{
        success: boolean
        message: string
        data: { success: boolean }
      }>("/api/billings/send-reminders", {
        method: "POST",
        body: { userId: selectedUserId, reminderType },
        ignoreResponseError: true,
      })

      if (response.success) {
        toast.success(response.message || "Đã gửi email nhắc nhở thành công")
        // Remove the sent user from the list
        setEligibleUsers((prev) => prev.filter((user) => user.userId !== selectedUserId))
        setSelectedUserId("")
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi gửi email nhắc nhở")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast.error((error as Error).message || "Có lỗi xảy ra khi gửi email nhắc nhở")
    } finally {
      setIsSendingReminders(false)
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Gửi email nhắc nhở
                </CardTitle>
                <CardDescription>
                  Gửi email nhắc nhở thanh toán cho cư dân dựa trên ngày đến hạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsReminderDialogOpen(true)}
                  disabled={isSendingReminders}
                  className="max-w-xs"
                  size="lg"
                  variant="outline"
                >
                  {isSendingReminders ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Gửi email nhắc nhở
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Hoàn tác
                </CardTitle>
                <CardDescription>
                  Xóa hóa đơn mới nhất của mỗi cư dân
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsRollbackDialogOpen(true)}
                  disabled={isRollingBack}
                  className="max-w-xs"
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
              </CardContent>
            </Card>
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

        {/* Reminder Dialog */}
        <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gửi email nhắc nhở</DialogTitle>
              <DialogDescription>
                Chọn loại nhắc nhở và người dùng để gửi email nhắc nhở thanh toán.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-type">Loại nhắc nhở</Label>
                <Select
                  value={reminderType}
                  onValueChange={(value: "3days" | "7days" | "overdue") => {
                    setReminderType(value)
                    setEligibleUsers([])
                    setSelectedUserId("")
                  }}
                  disabled={isSendingReminders || isFetchingUsers}
                >
                  <SelectTrigger id="reminder-type">
                    <SelectValue placeholder="Chọn loại nhắc nhở" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3days">3 ngày trước khi đến hạn</SelectItem>
                    <SelectItem value="7days">7 ngày trước khi đến hạn</SelectItem>
                    <SelectItem value="overdue">Đã quá hạn</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">
                  {reminderType === "3days" &&
                    "Gửi email cho các hóa đơn sẽ đến hạn trong 3 ngày tới."}
                  {reminderType === "7days" &&
                    "Gửi email cho các hóa đơn sẽ đến hạn trong 7 ngày tới."}
                  {reminderType === "overdue" && "Gửi email cho các hóa đơn đã quá hạn thanh toán."}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFetchEligibleUsers}
                    disabled={isFetchingUsers || isSendingReminders}
                  >
                    {isFetchingUsers ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tìm...
                      </>
                    ) : (
                      "Tìm người dùng"
                    )}
                  </Button>
                  {eligibleUsers.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      Tìm thấy {eligibleUsers.length} người dùng
                    </span>
                  )}
                </div>
              </div>

              {eligibleUsers.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="user-select">Chọn người dùng</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                    disabled={isSendingReminders}
                  >
                    <SelectTrigger id="user-select">
                      <SelectValue placeholder="Chọn người dùng để gửi email" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleUsers.map((user) => {
                        const totalAmount = user.bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
                        const overdueCount = user.bills.filter((bill) => bill.isOverdue).length
                        return (
                          <SelectItem key={user.userId} value={user.userId}>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {user.email} • {user.bills.length} hóa đơn •{" "}
                                {totalAmount.toLocaleString("vi-VN")} $
                                {overdueCount > 0 && ` • ${overdueCount} quá hạn`}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {selectedUserId && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">Chi tiết hóa đơn:</p>
                      <div className="space-y-2">
                        {eligibleUsers
                          .find((u) => u.userId === selectedUserId)
                          ?.bills.map((bill) => (
                            <div key={bill.billingId} className="text-sm">
                              <span className="font-medium">Mã: {bill.billingId}</span>
                              <span className="text-muted-foreground">
                                {" "}
                                • {bill.totalAmount.toLocaleString("vi-VN")} $
                                {bill.isOverdue
                                  ? ` • Quá hạn ${Math.abs(bill.daysUntilDue)} ngày`
                                  : ` • Còn ${bill.daysUntilDue} ngày`}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReminderDialogOpen(false)
                  setEligibleUsers([])
                  setSelectedUserId("")
                }}
                disabled={isSendingReminders || isFetchingUsers}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSendReminder}
                disabled={isSendingReminders || isFetchingUsers || !selectedUserId}
              >
                {isSendingReminders ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Gửi email nhắc nhở
                  </>
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
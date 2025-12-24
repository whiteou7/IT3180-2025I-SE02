import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import {
  BadgeCheck,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useUserStore } from "@/store/userStore"
import type { BillingDetail, BillingSummary } from "@/types/billings"
import type { BillingStatus } from "@/types/enum"
import type { User } from "@/types/users"

const statusBadges: Record<BillingStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  unpaid: { label: "Chưa thanh toán", variant: "secondary" },
  paid: { label: "Đã thanh toán", variant: "default" },
  deleted: { label: "Đã hủy", variant: "outline" },
}

export default function BillingCenterPage() {
  const { userId, role } = useUserStore()
  const hasAllowedRole = role === "admin" || role === "accountant"
  const [billings, setBillings] = useState<BillingSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<BillingStatus | "all">("all")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [users, setUsers] = useState<User[]>([])
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BillingDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    if (hasAllowedRole) {
      ofetch("/api/users", { ignoreResponseError: true })
        .then((response) => {
          if (response?.success) {
            setUsers(response.data as User[])
          }
        })
        .catch((error) => console.error(error))
    }
  }, [hasAllowedRole])

  const fetchBillings = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const query: Record<string, string> = {}
      if (!hasAllowedRole) {
        query.userId = userId
      } else if (selectedUser && selectedUser !== "all") {
        query.userId = selectedUser
      }
      if (statusFilter !== "all") {
        query.status = statusFilter
      }
      const response = await ofetch("/api/billings", {
        query,
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tải danh sách thanh toán")
      }
      const normalized = (response.data as BillingSummary[]).map((billing) => ({
        ...billing,
        totalAmount: Number(billing.totalAmount),
      }))
      setBillings(normalized)
    } catch (error) {
      console.error(error)
      toast.error("Tải danh sách thanh toán thất bại")
    } finally {
      setIsLoading(false)
    }
  }, [userId, hasAllowedRole, selectedUser, statusFilter])

  useEffect(() => {
    fetchBillings()
  }, [fetchBillings])

  useEffect(() => {
    if (!detailId) {
      setDetail(null)
      return
    }
    let mounted = true
    setIsDetailLoading(true)
    ofetch(`/api/billings/${detailId}`, { ignoreResponseError: true })
      .then((response) => {
        if (!response?.success) {
          throw new Error(response?.message ?? "Không thể tải chi tiết thanh toán")
        }
        if (mounted) {
          const payload = response.data as BillingDetail
          payload.totalPrice = Number(payload.totalPrice)
          setDetail(payload)
        }
      })
      .catch((error) => {
        console.error(error)
        toast.error("Tải chi tiết thanh toán thất bại")
      })
      .finally(() => {
        if (mounted) setIsDetailLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [detailId])

  const totals = useMemo(() => {
    const unpaidTotal = billings
      .filter((billing) => billing.billingStatus === "unpaid")
      .reduce((sum, billing) => sum + billing.totalAmount, 0)

    const earliestDue = billings
      .filter((billing) => billing.billingStatus === "unpaid")
      .reduce<Date | null>((soonest, billing) => {
        const dueDate = new Date(billing.dueDate)
        if (!soonest || dueDate < soonest) return dueDate
        return soonest
      }, null)

    const paidThisMonth = billings
      .filter((billing) => {
        if (billing.billingStatus !== "paid" || !billing.paidAt) return false
        const paidDate = new Date(billing.paidAt)
        const now = new Date()
        return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, billing) => sum + billing.totalAmount, 0)

    return {
      unpaidTotal,
      earliestDue,
      paidThisMonth,
    }
  }, [billings])

  const invoiceHistory = useMemo(
    () => billings.filter((billing) => billing.billingStatus === "paid").slice(0, 5),
    [billings]
  )

  const handleExport = () => {
    if (!billings.length) {
      toast.error("Không có dữ liệu để xuất")
      return
    }
    const header = ["Mã thanh toán", "Cư dân", "Dịch vụ", "Số tiền", "Ngày đến hạn", "Trạng thái"]
    const rows = billings.map((billing) => [
      billing.billingId,
      billing.fullName,
      billing.serviceCount.toString(),
      billing.totalAmount.toFixed(2),
      new Date(billing.dueDate).toLocaleDateString(),
      billing.billingStatus,
    ])
    const csv = [header, ...rows].map((line) => line.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.download = "billing-export.csv"
    link.click()
    window.URL.revokeObjectURL(link.href)
  }

  const handleMarkPaid = async (billingId: string) => {
    try {
      setIsPaying(true)
      const response = await ofetch(`/api/billings/${billingId}`, {
        method: "PUT",
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể cập nhật thanh toán")
      }
      toast.success("Đánh dấu thanh toán đã được trả")
      await fetchBillings()
      setDetail((prev) =>
        prev && prev.billingId === billingId
          ? {
            ...prev,
            billingStatus: "paid",
            paidAt: new Date().toISOString(),
          }
          : prev
      )
    } catch (error) {
      console.error(error)
      toast.error("Đánh dấu thanh toán thất bại")
    } finally {
      setIsPaying(false)
    }
  }

  const handleDownloadInvoice = async (billingId: string) => {
    try {
      const response = await ofetch(`/api/billings/${billingId}/file`, {
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tạo hóa đơn")
      }
      const payload = response.data
      const link = document.createElement("a")
      link.href = `data:application/pdf;base64,${payload.file}`
      link.download = `invoice-${billingId}.pdf`
      link.click()
    } catch (error) {
      console.error(error)
      toast.error("Tải hóa đơn thất bại")
    }
  }

  return (
    <>
      <Head>
        <title>Trung tâm Thanh toán • Thu phí</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Trung tâm Thanh toán</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Thanh toán & Hóa đơn</h1>
            <p className="text-muted-foreground text-sm">
              Giữ mọi phí dịch vụ được tổ chức với các hành động thanh toán nhanh chóng.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!billings.length || !userId}>
              <Download className="mr-2 size-4" />
              Xuất CSV
            </Button>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tổng chưa thanh toán</CardTitle>
                <Wallet className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.unpaidTotal.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Ngày đến hạn tiếp theo</CardTitle>
                <CalendarDays className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {totals.earliestDue ? totals.earliestDue.toLocaleDateString() : "Không có"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Đã thanh toán tháng này</CardTitle>
                <BadgeCheck className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.paidThisMonth.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách Hóa đơn</CardTitle>
              <CardDescription>Chọn nhiều, xem xét và thanh toán các khoản chưa thanh toán.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="deleted">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>

                  {hasAllowedRole && (
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Tất cả cư dân" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả cư dân</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.userId} value={user.userId}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={fetchBillings}>
                  Làm mới danh sách
                </Button>
              </div>

              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thanh toán</TableHead>
                      <TableHead>Cư dân</TableHead>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Ngày đến hạn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          <Loader2 className="mx-auto size-4 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : billings.length ? (
                      billings.map((billing) => (
                        <TableRow key={billing.billingId}>
                          <TableCell className="font-medium">{billing.billingId.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell>{billing.fullName}</TableCell>
                          <TableCell>{billing.serviceCount}</TableCell>
                          <TableCell>${billing.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(billing.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadges[billing.billingStatus].variant}>
                              {statusBadges[billing.billingStatus].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDetailId(billing.billingId)}
                            >
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                          Không tìm thấy hóa đơn.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử Hóa đơn</CardTitle>
              <CardDescription>Hóa đơn đã thanh toán sẵn sàng để tải xuống.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {invoiceHistory.length ? (
                invoiceHistory.map((billing) => (
                  <div key={billing.billingId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{billing.billingId.slice(0, 8).toUpperCase()}</p>
                      <p className="text-muted-foreground text-xs">
                        Đã thanh toán {billing.paidAt ? new Date(billing.paidAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => handleDownloadInvoice(billing.billingId)}
                    >
                      <FileText className="size-4" />
                      PDF
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Không có lịch sử hóa đơn để hiển thị.</p>
              )}
            </CardContent>
          </Card>
        </AuthGate>
      </div>

      <Sheet open={Boolean(detailId)} onOpenChange={(open) => setDetailId(open ? detailId : null)}>
        <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Chi tiết Thanh toán</SheetTitle>
            <SheetDescription>Phân tích chi phí, hành động thanh toán và điều khiển hóa đơn.</SheetDescription>
          </SheetHeader>

          {isDetailLoading || !detail ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : (
            <>
              <div className="rounded-xl border mx-4 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Mã thanh toán</p>
                    <p className="font-semibold">{detail.billingId}</p>
                  </div>
                  <Badge variant={statusBadges[detail.billingStatus].variant}>
                    {statusBadges[detail.billingStatus].label}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <p>
                    <span className="text-muted-foreground">Cư dân:</span> {detail.fullName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Kỳ:</span>{" "}
                    {new Date(detail.periodStart).toLocaleDateString()} –{" "}
                    {new Date(detail.periodEnd).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Ngày đến hạn:</span>{" "}
                    {new Date(detail.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-semibold">${detail.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3 mx-4">
                <h3 className="text-sm font-semibold">Dịch vụ</h3>
                {detail.services.map((service) => (
                  <div key={service.serviceId} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.serviceName}</p>
                        <p className="text-muted-foreground text-xs">
                          ${service.price.toFixed(2)} • Thuế {service.tax}%
                        </p>
                      </div>
                      <span className="font-semibold">
                        ${(service.price + (service.price * service.tax) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleDownloadInvoice(detail.billingId)}
                  variant="outline"
                  className="gap-2 mx-4"
                >
                  <FileText className="size-4" />
                  Tạo hóa đơn
                </Button>
                {detail.billingStatus === "unpaid" && (
                  <Button onClick={() => handleMarkPaid(detail.billingId)} disabled={isPaying} className="gap-2 mx-4">
                    {isPaying ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Đang xử lý…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        Thanh toán hóa đơn
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

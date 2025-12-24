import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { CalendarRange, PieChart, TrendingUp, Download } from "lucide-react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useUserStore } from "@/store/userStore"
import type { BillingSummary } from "@/types/billings"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TrendPoint = {
  month: string
  revenue: number
  outstanding: number
  order: number
}

type ReportType = "revenue" | "collection" | "outstanding" | "tax" | "custom"

export default function FinancialReportsPage() {
  const { userId, role } = useUserStore()
  const isAuthorized = role === "admin" || role === "accountant"
  const [billings, setBillings] = useState<BillingSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [monthsBack, setMonthsBack] = useState("6")
  const [reportType, setReportType] = useState<ReportType>("revenue")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const loadBillings = useCallback(async () => {
    if (!isAuthorized) return
    setIsLoading(true)
    try {
      const response = await ofetch("/api/billings", {
        query: { limit: "200" },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tải dữ liệu báo cáo")
      }
      setBillings(response.data as BillingSummary[])
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải dữ liệu báo cáo")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthorized])

  useEffect(() => {
    loadBillings()
  }, [loadBillings])

  const filteredBillings = useMemo(() => {
    let filtered = billings
    const months = Number(monthsBack)
    if (months > 0) {
      const start = new Date()
      start.setMonth(start.getMonth() - (months - 1))
      start.setDate(1)
      filtered = filtered.filter((billing) => new Date(billing.periodStart) >= start)
    }
    if (startDate) {
      filtered = filtered.filter((billing) => new Date(billing.periodStart) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter((billing) => new Date(billing.periodStart) <= new Date(endDate))
    }
    return filtered
  }, [billings, monthsBack, startDate, endDate])

  const revenueData = useMemo(() => {
    const map = new Map<string, TrendPoint>()
    filteredBillings.forEach((billing) => {
      const date = new Date(billing.periodStart)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!map.has(key)) {
        const label = date.toLocaleString("default", { month: "short" })
        const order = date.getFullYear() * 100 + date.getMonth()
        map.set(key, { month: label, revenue: 0, outstanding: 0, order })
      }
      const entry = map.get(key)!
      if (billing.billingStatus === "paid") {
        entry.revenue += billing.totalAmount
      } else if (billing.billingStatus === "unpaid") {
        entry.outstanding += billing.totalAmount
      }
    })
    return Array.from(map.values()).sort((a, b) => a.order - b.order)
  }, [filteredBillings])

  const totals = useMemo(() => {
    const paid = filteredBillings
      .filter((billing) => billing.billingStatus === "paid")
      .reduce((sum, billing) => sum + billing.totalAmount, 0)
    const outstanding = filteredBillings
      .filter((billing) => billing.billingStatus === "unpaid")
      .reduce((sum, billing) => sum + billing.totalAmount, 0)
    const rate = paid + outstanding === 0 ? 0 : (paid / (paid + outstanding)) * 100
    return { paid, outstanding, rate: Math.round(rate) }
  }, [filteredBillings])

  const convertToCSV = (data: Array<Record<string, string | number>>, headers: string[]): string => {
    const csvRows = [headers.join(",")]
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header] ?? ""
        if (typeof value === "string" && (value.includes(",") || value.includes("\"") || value.includes("\n"))) {
          return `"${value.replace(/"/g, "\"\"")}"`
        }
        return value
      })
      csvRows.push(values.join(","))
    }
    return csvRows.join("\n")
  }

  const handleExportCSV = async () => {
    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const headers = ["Mã hóa đơn", "Dịch vụ", "Cư dân", "Từ kỳ", "Đến kỳ", "Số tiền", "Trạng thái", "Hạn thanh toán", "Ngày đã thanh toán"]
        
      const rows = filteredBillings.map((billing) => ({
        "Mã hóa đơn": billing.billingId,
        "Dịch vụ": billing.services?.[0]?.serviceName || `Dịch vụ (${billing.serviceCount})` || "Không có",
        "Cư dân": billing.fullName || "Không có",
        "Từ kỳ": new Date(billing.periodStart).toLocaleDateString(),
        "Đến kỳ": new Date(billing.periodEnd).toLocaleDateString(),
        "Số tiền": billing.totalAmount.toFixed(2),
        "Trạng thái": billing.billingStatus,
        "Hạn thanh toán": new Date(billing.dueDate).toLocaleDateString(),
        "Ngày đã thanh toán": billing.paidAt ? new Date(billing.paidAt).toLocaleDateString() : "—",
      }))

      let csvContent = "Báo cáo tài chính\n"
      csvContent += `Tạo lúc: ${new Date().toLocaleString()}\n`
      csvContent += `Đã thu: $${totals.paid.toFixed(2)}\n`
      csvContent += `Còn phải thu: $${totals.outstanding.toFixed(2)}\n`
      csvContent += `Tỷ lệ thu: ${totals.rate}%\n\n`
      csvContent += convertToCSV(rows, headers)

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bao-cao-tai-chinh-${timestamp}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Xuất file CSV thành công")
    } catch (error) {
      console.error(error)
      toast.error("Không thể xuất file CSV")
    }
  }

  if (!isAuthorized) {
    return (
      <>
        <Head>
          <title>Báo cáo tài chính • Không có quyền truy cập</title>
        </Head>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
          <AuthGate
            isAuthenticated={Boolean(userId)}
            title="Không có quyền truy cập"
            description="Báo cáo tài chính chỉ dành cho quản trị viên và kế toán."
          >
            <div />
          </AuthGate>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Báo cáo tài chính • Báo cáo & Phân tích</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/reports">Báo cáo</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Báo cáo tài chính</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Báo cáo tài chính</h1>
            <p className="text-muted-foreground text-sm">
              Xem tổng quan thu/chi và tình hình thanh toán theo tháng.
            </p>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình báo cáo</CardTitle>
              <CardDescription>
                Chọn loại báo cáo và khoảng thời gian
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Loại báo cáo</Label>
                  <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Doanh thu</SelectItem>
                      <SelectItem value="collection">Tình hình thu</SelectItem>
                      <SelectItem value="outstanding">Công nợ</SelectItem>
                      <SelectItem value="tax">Thuế</SelectItem>
                      <SelectItem value="custom">Tùy chọn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Khoảng thời gian</Label>
                  <Select value={monthsBack} onValueChange={setMonthsBack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khoảng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 tháng gần đây</SelectItem>
                      <SelectItem value="6">6 tháng gần đây</SelectItem>
                      <SelectItem value="12">12 tháng gần đây</SelectItem>
                      <SelectItem value="0">Tùy chọn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {monthsBack === "0" && (
                  <>
                    <div className="space-y-2">
                      <Label>Từ ngày</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Đến ngày</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={isLoading} onClick={loadBillings}>
                  <CalendarRange className="mr-2 size-4" />
                  {isLoading ? "Đang tải..." : "Làm mới"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Doanh thu đã thu</CardTitle>
                <TrendingUp className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.paid.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Còn phải thu</CardTitle>
                <PieChart className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.outstanding.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tỷ lệ thu</CardTitle>
                <Badge className="w-fit">{totals.rate}%</Badge>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${totals.rate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng doanh thu</CardTitle>
                <CardDescription>So sánh đã thu và còn phải thu theo tháng.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  id="revenue-trend"
                  config={{
                    revenue: { label: "Đã thu", color: "hsl(var(--primary))" },
                    outstanding: { label: "Còn phải thu", color: "hsl(var(--destructive))" },
                  }}
                >
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="outstanding"
                      stroke="var(--destructive)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Còn phải thu theo tháng</CardTitle>
                <CardDescription>Theo dõi công nợ để nhắc thanh toán kịp thời.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  id="outstanding-bar"
                  config={{
                    outstanding: { label: "Còn phải thu", color: "hsl(var(--primary))" },
                  }}
                >
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="outstanding" fill="var(--color-outstanding)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Xuất báo cáo</CardTitle>
              <CardDescription>
                Tải báo cáo dưới dạng CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 size-4" />
                Xuất CSV
              </Button>
            </CardContent>
          </Card>
        </AuthGate>
      </div>
    </>
  )
}

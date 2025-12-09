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
        throw new Error(response?.message ?? "Unable to load reports data")
      }
      setBillings(response.data as BillingSummary[])
    } catch (error) {
      console.error(error)
      toast.error("Failed to load reports data")
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
      const headers = ["Billing ID", "Service", "User", "Period Start", "Period End", "Amount", "Status", "Due Date", "Paid At"]
        
      const rows = filteredBillings.map((billing) => ({
        "Billing ID": billing.billingId,
        Service: billing.services?.[0]?.serviceName || `Service (${billing.serviceCount})` || "N/A",
        User: billing.fullName || "N/A",
        "Period Start": new Date(billing.periodStart).toLocaleDateString(),
        "Period End": new Date(billing.periodEnd).toLocaleDateString(),
        Amount: billing.totalAmount.toFixed(2),
        Status: billing.billingStatus,
        "Due Date": new Date(billing.dueDate).toLocaleDateString(),
        "Paid At": billing.paidAt ? new Date(billing.paidAt).toLocaleDateString() : "—",
      }))

      let csvContent = "Financial Report\n"
      csvContent += `Generated: ${new Date().toLocaleString()}\n`
      csvContent += `Total Paid: $${totals.paid.toFixed(2)}\n`
      csvContent += `Total Outstanding: $${totals.outstanding.toFixed(2)}\n`
      csvContent += `Collection Rate: ${totals.rate}%\n\n`
      csvContent += convertToCSV(rows, headers)

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `financial-report-${timestamp}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("CSV exported successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to export CSV")
    }
  }

  if (!isAuthorized) {
    return (
      <>
        <Head>
          <title>Financial Reports • Access Denied</title>
        </Head>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
          <AuthGate
            isAuthenticated={Boolean(userId)}
            title="Access Denied"
            description="Financial reports are only accessible to administrators and accountants."
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
        <title>Financial Reports • Reports & Analytics</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/reports">Reports</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Financial Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground text-sm">
              Generate comprehensive financial reports and analytics. Visualize fee collection performance across services and months.
            </p>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Select report type and date range
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue Report</SelectItem>
                      <SelectItem value="collection">Collection Report</SelectItem>
                      <SelectItem value="outstanding">Outstanding Report</SelectItem>
                      <SelectItem value="tax">Tax Report</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Range</Label>
                  <Select value={monthsBack} onValueChange={setMonthsBack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Last 3 months</SelectItem>
                      <SelectItem value="6">Last 6 months</SelectItem>
                      <SelectItem value="12">Last 12 months</SelectItem>
                      <SelectItem value="0">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {monthsBack === "0" && (
                  <>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
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
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Paid revenue</CardTitle>
                <TrendingUp className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.paid.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <PieChart className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.outstanding.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Collection rate</CardTitle>
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
                <CardTitle>Revenue trend</CardTitle>
                <CardDescription>Paid revenue vs outstanding dues per month.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  id="revenue-trend"
                  config={{
                    revenue: { label: "Paid revenue", color: "hsl(var(--primary))" },
                    outstanding: { label: "Outstanding", color: "hsl(var(--destructive))" },
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
                <CardTitle>Outstanding by month</CardTitle>
                <CardDescription>Focus collection efforts on the highest open balances.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  id="outstanding-bar"
                  config={{
                    outstanding: { label: "Outstanding", color: "hsl(var(--primary))" },
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
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                    Download report as CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 size-4" />
                    Export CSV
              </Button>
            </CardContent>
          </Card>
        </AuthGate>
      </div>
    </>
  )
}

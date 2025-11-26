import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { CalendarRange, PieChart, TrendingUp } from "lucide-react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

type TrendPoint = {
  month: string
  revenue: number
  outstanding: number
  order: number
}

export default function FinancialReportsPage() {
  const { userId } = useUserStore()
  const [billings, setBillings] = useState<BillingSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [monthsBack, setMonthsBack] = useState("6")

  const loadBillings = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadBillings()
  }, [loadBillings])

  const filteredBillings = useMemo(() => {
    const months = Number(monthsBack)
    const start = new Date()
    start.setMonth(start.getMonth() - (months - 1))
    start.setDate(1)
    return billings.filter((billing) => new Date(billing.periodStart) >= start)
  }, [billings, monthsBack])

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

  return (
    <>
      <Head>
        <title>Financial reports • Fee collection</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/billing">Billing</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Financial reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Revenue intelligence</h1>
            <p className="text-muted-foreground text-sm">
              Visualize fee collection performance across services and months.
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={monthsBack} onValueChange={setMonthsBack}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" disabled={isLoading} onClick={loadBillings}>
              <CalendarRange className="mr-2 size-4" />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
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
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="outstanding"
                      stroke="var(--color-outstanding)"
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
        </AuthGate>
      </div>
    </>
  )
}


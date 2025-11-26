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
  unpaid: { label: "Unpaid", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  deleted: { label: "Voided", variant: "outline" },
}

export default function BillingCenterPage() {
  const { userId, role } = useUserStore()
  const isManager = role === "admin" || role === "accountant"
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
    if (isManager) {
      ofetch("/api/users", { ignoreResponseError: true })
        .then((response) => {
          if (response?.success) {
            setUsers(response.data as User[])
          }
        })
        .catch((error) => console.error(error))
    }
  }, [isManager])

  const fetchBillings = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const query: Record<string, string> = {}
      if (!isManager) {
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
        throw new Error(response?.message ?? "Unable to fetch billings")
      }
      const normalized = (response.data as BillingSummary[]).map((billing) => ({
        ...billing,
        totalAmount: Number(billing.totalAmount),
      }))
      setBillings(normalized)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load billings")
    } finally {
      setIsLoading(false)
    }
  }, [userId, isManager, selectedUser, statusFilter])

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
          throw new Error(response?.message ?? "Unable to fetch billing detail")
        }
        if (mounted) {
          const payload = response.data as BillingDetail
          payload.totalPrice = Number(payload.totalPrice)
          setDetail(payload)
        }
      })
      .catch((error) => {
        console.error(error)
        toast.error("Failed to load billing detail")
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
      toast.error("No data to export")
      return
    }
    const header = ["Billing ID", "Resident", "Services", "Amount", "Due Date", "Status"]
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
        throw new Error(response?.message ?? "Unable to update billing")
      }
      toast.success("Billing marked as paid")
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
      toast.error("Failed to mark billing as paid")
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
        throw new Error(response?.message ?? "Unable to generate invoice")
      }
      const payload = response.data
      const link = document.createElement("a")
      link.href = `data:application/pdf;base64,${payload.file}`
      link.download = `invoice-${billingId}.pdf`
      link.click()
    } catch (error) {
      console.error(error)
      toast.error("Failed to download invoice")
    }
  }

  return (
    <>
      <Head>
        <title>Billing center • Fee collection</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Billing center</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing & invoices</h1>
            <p className="text-muted-foreground text-sm">
              Keep every service charge organized with quick payment actions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!billings.length || !userId}>
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total outstanding</CardTitle>
                <Wallet className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.unpaidTotal.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Next due date</CardTitle>
                <CalendarDays className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {totals.earliestDue ? totals.earliestDue.toLocaleDateString() : "No pending"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Paid this month</CardTitle>
                <BadgeCheck className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">${totals.paidThisMonth.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bill list</CardTitle>
              <CardDescription>Bulk select, review, and settle outstanding balances.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="deleted">Voided</SelectItem>
                    </SelectContent>
                  </Select>

                  {isManager && (
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="All residents" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All residents</SelectItem>
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
                  Refresh list
                </Button>
              </div>

              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Billing</TableHead>
                      <TableHead>Resident</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
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
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                          No bills found.
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
              <CardTitle>Invoice history</CardTitle>
              <CardDescription>Paid invoices ready for download.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {invoiceHistory.length ? (
                invoiceHistory.map((billing) => (
                  <div key={billing.billingId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{billing.billingId.slice(0, 8).toUpperCase()}</p>
                      <p className="text-muted-foreground text-xs">
                        Paid {billing.paidAt ? new Date(billing.paidAt).toLocaleDateString() : "—"}
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
                <p className="text-muted-foreground text-sm">No invoice history to display.</p>
              )}
            </CardContent>
          </Card>
        </AuthGate>
      </div>

      <Sheet open={Boolean(detailId)} onOpenChange={(open) => setDetailId(open ? detailId : null)}>
        <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Billing detail</SheetTitle>
            <SheetDescription>Charge breakdown, payment actions, and invoice controls.</SheetDescription>
          </SheetHeader>

          {isDetailLoading || !detail ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : (
            <>
              <div className="rounded-xl border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Billing ID</p>
                    <p className="font-semibold">{detail.billingId}</p>
                  </div>
                  <Badge variant={statusBadges[detail.billingStatus].variant}>
                    {statusBadges[detail.billingStatus].label}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3">
                  <p>
                    <span className="text-muted-foreground">Resident:</span> {detail.fullName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Period:</span>{" "}
                    {new Date(detail.periodStart).toLocaleDateString()} –{" "}
                    {new Date(detail.periodEnd).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Due date:</span>{" "}
                    {new Date(detail.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-semibold">${detail.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Services</h3>
                {detail.services.map((service) => (
                  <div key={service.serviceId} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.serviceName}</p>
                        <p className="text-muted-foreground text-xs">
                          ${service.price.toFixed(2)} • Tax {service.tax}%
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
                  className="gap-2"
                >
                  <FileText className="size-4" />
                  Generate invoice
                </Button>
                {detail.billingStatus === "unpaid" && (
                  <Button onClick={() => handleMarkPaid(detail.billingId)} disabled={isPaying} className="gap-2">
                    {isPaying ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        Pay bill
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

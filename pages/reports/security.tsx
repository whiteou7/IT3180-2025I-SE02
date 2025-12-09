import { useState, useCallback, useEffect } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import {
  Shield,
  Calendar,
  Download,
  FileText,
  BarChart3,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUserStore } from "@/store/userStore"
import type { PropertyReport } from "@/types/reports"
import type { PropertyStatus } from "@/types/properties"
import { ScrollArea } from "@/components/ui/scroll-area"

type ReportType = "daily" | "weekly" | "monthly" | "incident" | "access"

type SecurityReportData = {
  summary: {
    totalIncidents: number
    openIncidents: number
    resolvedIncidents: number
    totalAccessEvents: number
  }
  incidents: PropertyReport[]
  accessLogs: Array<{
    vehicleLogId: string
    fullName: string | null
    licensePlate: string | null
    entranceTime: string
    exitTime: string | null
    apartmentNumber: number | null
  }>
}

export default function SecurityReportsPage() {
  const { userId, role } = useUserStore()
  const isAuthorized = role === "admin" || role === "police"
  const [reportType, setReportType] = useState<ReportType>("daily")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus | "all">("all")
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<SecurityReportData | null>(null)

  // Set default date range based on report type
  useEffect(() => {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split("T")[0]

    switch (reportType) {
      case "daily":
        setStartDate(formatDate(today))
        setEndDate(formatDate(today))
        break
      case "weekly":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        setStartDate(formatDate(weekStart))
        setEndDate(formatDate(today))
        break
      case "monthly":
        const monthStart = new Date(today)
        monthStart.setMonth(today.getMonth() - 1)
        setStartDate(formatDate(monthStart))
        setEndDate(formatDate(today))
        break
      default:
        break
    }
  }, [reportType])

  const generateReport = useCallback(async () => {
    if (!isAuthorized) {
      toast.error("Unauthorized access")
      return
    }

    setIsLoading(true)
    try {
      // Fetch property reports (incidents)
      const reportsParams: Record<string, string> = {}
      if (startDate) reportsParams.startDate = startDate
      if (endDate) reportsParams.endDate = endDate
      if (selectedStatus !== "all") reportsParams.status = selectedStatus

      const [reportsResponse, accessLogsResponse] = await Promise.all([
        ofetch<{ success: boolean; data: PropertyReport[]; message?: string }>("/api/property-reports", {
          query: reportsParams,
          ignoreResponseError: true,
        }),
        ofetch<{ success: boolean; data: { logs: Array<{
          vehicleLogId: string
          fullName: string | null
          licensePlate: string | null
          entranceTime: string
          exitTime: string | null
          apartmentNumber: number | null
        }> }; message?: string }>("/api/vehicles/checkin", {
          query: {
            filter: reportType === "daily" ? "daily" : reportType === "weekly" ? "week" : "month",
          },
          ignoreResponseError: true,
        }),
      ])

      if (!reportsResponse?.success) {
        throw new Error(reportsResponse?.message ?? "Unable to load incidents")
      }

      const incidents = reportsResponse.data || []
      const accessLogs = accessLogsResponse?.data?.logs || []

      const summary = {
        totalIncidents: incidents.length,
        openIncidents: incidents.filter((i) => i.status === "not found").length,
        resolvedIncidents: incidents.filter((i) => i.status === "found").length,
        totalAccessEvents: accessLogs.length,
      }

      setReportData({
        summary,
        incidents,
        accessLogs: accessLogs.map((log) => ({
          vehicleLogId: log.vehicleLogId,
          fullName: log.fullName,
          licensePlate: log.licensePlate,
          entranceTime: log.entranceTime,
          exitTime: log.exitTime,
          apartmentNumber: log.apartmentNumber,
        })),
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate report")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthorized, startDate, endDate, selectedStatus, reportType])

  const convertToCSV = (data: Array<Record<string, string | number | null>>, headers: string[]): string => {
    const csvRows = [headers.join(",")]
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header] ?? ""
        // Escape commas and quotes in CSV
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
    if (!reportData) {
      toast.error("Please generate a report first")
      return
    }
    try {
      let csvContent = ""
      const timestamp = new Date().toISOString().split("T")[0]

      if (reportType !== "access" && reportData.incidents.length > 0) {
        // Export incidents
        const incidentHeaders = ["Property", "Owner", "Status", "Reported", "Content"]
        const incidentRows = reportData.incidents.map((incident) => ({
          Property: incident.propertyName,
          Owner: incident.ownerFullName,
          Status: incident.status,
          Reported: new Date(incident.createdAt).toLocaleString(),
          Content: incident.content || "",
        }))
        csvContent += "Security Incidents Report\n"
        csvContent += `Generated: ${new Date().toLocaleString()}\n\n`
        csvContent += convertToCSV(incidentRows, incidentHeaders)
      }

      if (reportType !== "incident" && reportData.accessLogs.length > 0) {
        if (csvContent) csvContent += "\n\n"
        // Export access logs
        const accessHeaders = ["Resident", "Apartment", "License Plate", "Entry Time", "Exit Time", "Status"]
        const accessRows = reportData.accessLogs.map((log) => ({
          Resident: log.fullName || "Unknown",
          Apartment: log.apartmentNumber ? `#${log.apartmentNumber}` : "—",
          "License Plate": log.licensePlate || "—",
          "Entry Time": new Date(log.entranceTime).toLocaleString(),
          "Exit Time": log.exitTime ? new Date(log.exitTime).toLocaleString() : "—",
          Status: log.exitTime ? "Exited" : "Inside",
        }))
        csvContent += "Access Control Log\n"
        csvContent += `Generated: ${new Date().toLocaleString()}\n\n`
        csvContent += convertToCSV(accessRows, accessHeaders)
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `security-report-${timestamp}.csv`
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

  const statusColors: Record<PropertyStatus, string> = {
    "found": "bg-green-500",
    "not found": "bg-yellow-500",
    "deleted": "bg-gray-500",
  }

  if (!isAuthorized) {
    return (
      <>
        <Head>
          <title>Security Reports • Access Denied</title>
        </Head>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
          <AuthGate
            isAuthenticated={Boolean(userId)}
            title="Access Denied"
            description="Security reports are only accessible to administrators and law enforcement."
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
        <title>Security Reports • Reports & Analytics</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Security Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Security Reports</h1>
            <p className="text-muted-foreground text-sm">
              Generate security reports for incidents and access control.
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
                      <SelectItem value="daily">Daily Security Report</SelectItem>
                      <SelectItem value="weekly">Weekly Security Report</SelectItem>
                      <SelectItem value="monthly">Monthly Security Report</SelectItem>
                      <SelectItem value="incident">Incident Summary</SelectItem>
                      <SelectItem value="access">Access Control Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="space-y-2">
                  <Label>Incident Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as PropertyStatus | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="not found">Not Found</SelectItem>
                      <SelectItem value="found">Found</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={generateReport} disabled={isLoading} className="w-full sm:w-auto">
                <BarChart3 className="mr-2 size-4" />
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>

          {/* Report Summary */}
          {reportData && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                    <Shield className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.totalIncidents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
                    <FileText className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.openIncidents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    <Shield className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.resolvedIncidents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Access Events</CardTitle>
                    <Calendar className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.totalAccessEvents}</div>
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

              {/* Incidents List */}
              {reportType !== "access" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Incident Summary</CardTitle>
                    <CardDescription>
                      List of security incidents in the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reported</TableHead>
                            <TableHead>Content</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.incidents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No incidents found
                              </TableCell>
                            </TableRow>
                          ) : (
                            reportData.incidents.map((incident) => (
                              <TableRow key={incident.propertyReportId}>
                                <TableCell className="font-medium">{incident.propertyName}</TableCell>
                                <TableCell>{incident.ownerFullName}</TableCell>
                                <TableCell>
                                  <Badge className={statusColors[incident.status]}>
                                    {incident.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(incident.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {incident.content || "—"}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Access Logs */}
              {reportType !== "incident" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Access Control Log</CardTitle>
                    <CardDescription>
                      Vehicle and access events in the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resident</TableHead>
                          <TableHead>Apartment</TableHead>
                          <TableHead>License Plate</TableHead>
                          <TableHead>Entry Time</TableHead>
                          <TableHead>Exit Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.accessLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No access events found
                            </TableCell>
                          </TableRow>
                        ) : (
                          reportData.accessLogs.map((log) => (
                            <TableRow key={log.vehicleLogId}>
                              <TableCell>{log.fullName || "Unknown"}</TableCell>
                              <TableCell>{log.apartmentNumber ? `#${log.apartmentNumber}` : "—"}</TableCell>
                              <TableCell className="font-mono text-xs">{log.licensePlate || "—"}</TableCell>
                              <TableCell>
                                {new Date(log.entranceTime).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {log.exitTime ? new Date(log.exitTime).toLocaleString() : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={log.exitTime ? "secondary" : "default"}>
                                  {log.exitTime ? "Exited" : "Inside"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </AuthGate>
      </div>
    </>
  )
}

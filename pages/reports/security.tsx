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
      toast.error("Bạn không có quyền truy cập")
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
        throw new Error(reportsResponse?.message ?? "Không thể tải danh sách sự cố")
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
      toast.error((error as Error).message || "Không thể tạo báo cáo")
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
      toast.error("Vui lòng tạo báo cáo trước")
      return
    }
    try {
      let csvContent = ""
      const timestamp = new Date().toISOString().split("T")[0]

      if (reportType !== "access" && reportData.incidents.length > 0) {
        // Export incidents
        const incidentHeaders = ["Tài sản", "Chủ sở hữu", "Trạng thái", "Thời gian báo", "Nội dung"]
        const incidentRows = reportData.incidents.map((incident) => ({
          "Tài sản": incident.propertyName,
          "Chủ sở hữu": incident.ownerFullName,
          "Trạng thái": incident.status,
          "Thời gian báo": new Date(incident.createdAt).toLocaleString(),
          "Nội dung": incident.content || "",
        }))
        csvContent += "Báo cáo sự cố an ninh\n"
        csvContent += `Tạo lúc: ${new Date().toLocaleString()}\n\n`
        csvContent += convertToCSV(incidentRows, incidentHeaders)
      }

      if (reportType !== "incident" && reportData.accessLogs.length > 0) {
        if (csvContent) csvContent += "\n\n"
        // Export access logs
        const accessHeaders = ["Cư dân", "Căn hộ", "Biển số", "Giờ vào", "Giờ ra", "Trạng thái"]
        const accessRows = reportData.accessLogs.map((log) => ({
          "Cư dân": log.fullName || "Chưa rõ",
          "Căn hộ": log.apartmentNumber ? `#${log.apartmentNumber}` : "—",
          "Biển số": log.licensePlate || "—",
          "Giờ vào": new Date(log.entranceTime).toLocaleString(),
          "Giờ ra": log.exitTime ? new Date(log.exitTime).toLocaleString() : "—",
          "Trạng thái": log.exitTime ? "Đã ra" : "Đang ở trong",
        }))
        csvContent += "Nhật ký ra/vào\n"
        csvContent += `Tạo lúc: ${new Date().toLocaleString()}\n\n`
        csvContent += convertToCSV(accessRows, accessHeaders)
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bao-cao-an-ninh-${timestamp}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Xuất file CSV thành công")
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message || "Không thể xuất file CSV")
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
          <title>Báo cáo an ninh • Không có quyền truy cập</title>
        </Head>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
          <AuthGate
            isAuthenticated={Boolean(userId)}
            title="Không có quyền truy cập"
            description="Báo cáo an ninh chỉ dành cho quản trị viên và bộ phận an ninh."
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
        <title>Báo cáo an ninh • Báo cáo & Phân tích</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Báo cáo an ninh</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Báo cáo an ninh</h1>
            <p className="text-muted-foreground text-sm">
              Tạo báo cáo về sự cố và nhật ký ra/vào.
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
                      <SelectItem value="daily">Báo cáo an ninh theo ngày</SelectItem>
                      <SelectItem value="weekly">Báo cáo an ninh theo tuần</SelectItem>
                      <SelectItem value="monthly">Báo cáo an ninh theo tháng</SelectItem>
                      <SelectItem value="incident">Tổng hợp sự cố</SelectItem>
                      <SelectItem value="access">Báo cáo ra/vào</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="space-y-2">
                  <Label>Trạng thái sự cố</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as PropertyStatus | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="not found">Chưa tìm thấy</SelectItem>
                      <SelectItem value="found">Đã tìm thấy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={generateReport} disabled={isLoading} className="w-full sm:w-auto">
                <BarChart3 className="mr-2 size-4" />
                {isLoading ? "Đang tạo..." : "Tạo báo cáo"}
              </Button>
            </CardContent>
          </Card>

          {/* Report Summary */}
          {reportData && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng số sự cố</CardTitle>
                    <Shield className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.totalIncidents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sự cố đang mở</CardTitle>
                    <FileText className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.openIncidents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đã xử lý</CardTitle>
                    <Shield className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.resolvedIncidents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lượt ra/vào</CardTitle>
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

              {/* Incidents List */}
              {reportType !== "access" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tổng hợp sự cố</CardTitle>
                    <CardDescription>
                      Danh sách sự cố trong khoảng thời gian đã chọn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tài sản</TableHead>
                          <TableHead>Chủ sở hữu</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thời gian báo</TableHead>
                          <TableHead>Nội dung</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.incidents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Không có sự cố nào
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
                  </CardContent>
                </Card>
              )}

              {/* Access Logs */}
              {reportType !== "incident" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nhật ký ra/vào</CardTitle>
                    <CardDescription>
                      Thông tin ra/vào trong khoảng thời gian đã chọn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cư dân</TableHead>
                          <TableHead>Căn hộ</TableHead>
                          <TableHead>Biển số</TableHead>
                          <TableHead>Giờ vào</TableHead>
                          <TableHead>Giờ ra</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.accessLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              Không có dữ liệu ra/vào
                            </TableCell>
                          </TableRow>
                        ) : (
                          reportData.accessLogs.map((log) => (
                            <TableRow key={log.vehicleLogId}>
                              <TableCell>{log.fullName || "Chưa rõ"}</TableCell>
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
                                  {log.exitTime ? "Đã ra" : "Đang ở trong"}
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

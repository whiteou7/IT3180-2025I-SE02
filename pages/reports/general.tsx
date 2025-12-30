import { useState, useCallback } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import {
  Download,
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useUserStore } from "@/store/userStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type DataSource = "residents" | "apartments" | "services" | "documents" | "billings"

type ReportTemplate = {
  id: string
  name: string
  dataSource: DataSource
  description: string
}

const prebuiltTemplates: ReportTemplate[] = [
  {
    id: "resident-report",
    name: "Báo cáo cư dân",
    dataSource: "residents",
    description: "Danh sách cư dân và thông tin cơ bản",
  },
  {
    id: "apartment-occupancy",
    name: "Tình trạng căn hộ",
    dataSource: "apartments",
    description: "Tình trạng sử dụng và gán cư dân",
  },
  {
    id: "service-usage",
    name: "Sử dụng dịch vụ",
    dataSource: "services",
    description: "Thống kê và xu hướng sử dụng dịch vụ",
  },
  {
    id: "document-inventory",
    name: "Danh sách tài liệu",
    dataSource: "documents",
    description: "Tổng hợp tài liệu trong hệ thống",
  },
]

export default function GeneralReportsPage() {
  const { userId, role } = useUserStore()
  const isAdmin = role === "admin"
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [dataSource, setDataSource] = useState<DataSource>("residents")
  const [reportData, setReportData] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [savedTemplates] = useState<ReportTemplate[]>([])

  const generateReport = useCallback(async () => {
    if (!isAdmin) {
      toast.error("Chỉ quản trị viên mới có quyền truy cập")
      return
    }

    setIsLoading(true)
    try {
      let endpoint = ""
      switch (dataSource) {
        case "residents":
          endpoint = "/api/users"
          break
        case "apartments":
          endpoint = "/api/apartments"
          break
        case "services":
          endpoint = "/api/services"
          break
        case "billings":
          endpoint = "/api/billings"
          break
        default:
          toast.error("Nguồn dữ liệu không hợp lệ")
          return
      }

      const response = await ofetch(endpoint, {
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tạo báo cáo")
      }

      setReportData(response.data || [])
      toast.success("Tạo báo cáo thành công")
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message || "Không thể tạo báo cáo")
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, dataSource])

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return ""
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(",")]
    
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header] ?? ""
        const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
        if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, "\"\"")}"`
        }
        return stringValue
      })
      csvRows.push(values.join(","))
    }
    return csvRows.join("\n")
  }

  const handleExportCSV = async () => {
    if (reportData.length === 0) {
      toast.error("Vui lòng tạo báo cáo trước")
      return
    }
    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const csvContent = convertToCSV(reportData)

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bao-cao-${dataSource}-${timestamp}.csv`
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

  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>Báo cáo tổng hợp • Không có quyền truy cập</title>
        </Head>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
          <AuthGate
            isAuthenticated={Boolean(userId)}
            title="Không có quyền truy cập"
            description="Báo cáo tổng hợp chỉ dành cho quản trị viên."
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
        <title>Báo cáo tổng hợp • Báo cáo & Phân tích</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Báo cáo tổng hợp</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Báo cáo tổng hợp</h1>
            <p className="text-muted-foreground text-sm">
              Tạo báo cáo từ nhiều nguồn dữ liệu khác nhau.
            </p>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          {/* Report Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Tạo báo cáo</CardTitle>
              <CardDescription>
                Cấu hình báo cáo theo nhu cầu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nguồn dữ liệu</Label>
                  <Select
                    value={dataSource}
                    onValueChange={(value) => setDataSource(value as DataSource)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residents">Cư dân</SelectItem>
                      <SelectItem value="apartments">Căn hộ</SelectItem>
                      <SelectItem value="services">Dịch vụ</SelectItem>
                      <SelectItem value="billings">Hóa đơn</SelectItem>
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

          {/* Report Preview */}
          {reportData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Xem trước báo cáo</CardTitle>
                    <CardDescription>
                      Tìm thấy {reportData.length} dòng dữ liệu
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 size-4" />
                    Xuất CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(reportData[0] || {}).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.slice(0, 100).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {reportData.length > 100 && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Đang hiển thị 100 dòng đầu trong tổng số {reportData.length} dòng
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </AuthGate>
      </div>
    </>
  )
}

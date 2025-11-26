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
    name: "Resident Report",
    dataSource: "residents",
    description: "Complete list of all residents with their details",
  },
  {
    id: "apartment-occupancy",
    name: "Apartment Occupancy",
    dataSource: "apartments",
    description: "Occupancy status and resident assignments",
  },
  {
    id: "service-usage",
    name: "Service Usage",
    dataSource: "services",
    description: "Service usage statistics and trends",
  },
  {
    id: "document-inventory",
    name: "Document Inventory",
    dataSource: "documents",
    description: "All documents in the system",
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
      toast.error("Admin access required")
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
          toast.error("Invalid data source")
          return
      }

      const response = await ofetch(endpoint, {
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to generate report")
      }

      setReportData(response.data || [])
      toast.success("Report generated successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate report")
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
      toast.error("Please generate a report first")
      return
    }
    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const csvContent = convertToCSV(reportData)

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${dataSource}-report-${timestamp}.csv`
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

  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>General Reports • Access Denied</title>
        </Head>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
          <AuthGate
            isAuthenticated={Boolean(userId)}
            title="Access Denied"
            description="General reports are only accessible to administrators."
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
        <title>General Reports • Reports & Analytics</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>General Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">General Reports</h1>
            <p className="text-muted-foreground text-sm">
              Build custom reports from various data sources.
            </p>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          <Tabs defaultValue="builder" className="w-full">
            <TabsList>
              <TabsTrigger value="builder">Report Builder</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              {/* Report Builder */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Builder</CardTitle>
                  <CardDescription>
                    Configure your custom report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Data Source</Label>
                      <Select
                        value={dataSource}
                        onValueChange={(value) => setDataSource(value as DataSource)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residents">Residents</SelectItem>
                          <SelectItem value="apartments">Apartments</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="billings">Billings</SelectItem>
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

              {/* Report Preview */}
              {reportData.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Report Preview</CardTitle>
                        <CardDescription>
                          {reportData.length} records found
                        </CardDescription>
                      </div>
                      <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 size-4" />
                        Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[500px]">
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
                          Showing first 100 of {reportData.length} records
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              {/* Pre-built Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Pre-built Templates</CardTitle>
                  <CardDescription>
                    Quick report generation from templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {prebuiltTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <div className="rounded-md border p-4">
                      {(() => {
                        const template = prebuiltTemplates.find((t) => t.id === selectedTemplate)
                        return (
                          <>
                            <h4 className="font-medium">{template?.name}</h4>
                            <p className="text-muted-foreground text-sm mt-1">
                              {template?.description}
                            </p>
                            <Button
                              className="mt-4"
                              onClick={() => {
                                if (template) {
                                  setDataSource(template.dataSource)
                                  generateReport()
                                }
                              }}
                            >
                              Generate Report
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Saved Templates */}
              {savedTemplates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Templates</CardTitle>
                    <CardDescription>
                      Your custom report templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {savedTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-muted-foreground text-sm">{template.description}</p>
                          </div>
                          <Badge>{template.dataSource}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </AuthGate>
      </div>
    </>
  )
}

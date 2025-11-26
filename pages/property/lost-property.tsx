import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { AuthGate } from "@/components/auth/auth-gate"
import {
  LostPropertyFilters,
  LostPropertyFiltersState,
  LostPropertyTable,
  PropertyReportSheet,
  ReportLostPropertyDialog,
  ReportFormValues,
} from "@/components/property/lost-property"
import type { Property, PropertyStatus } from "@/types/properties"
import type { PropertyReport } from "@/types/reports"
import { useUserStore } from "@/store/userStore"
import { propertyStatuses } from "@/components/property/properties"

export default function LostPropertyPage() {
  const { userId, role } = useUserStore()
  const isAdmin = role === "admin"
  const isLawEnforcement = role === "police"

  const [reports, setReports] = useState<PropertyReport[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [filters, setFilters] = useState<LostPropertyFiltersState>({
    search: "",
    status: "all",
    approval: "all",
    startDate: null,
    endDate: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedReport, setSelectedReport] = useState<PropertyReport | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const loadReports = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const response = await ofetch("/api/property-reports", { ignoreResponseError: true })
      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to load reports")
      }
      setReports(response.data as PropertyReport[])
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch property reports")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const loadAvailableProperties = useCallback(async () => {
    if (!userId) return
    try {
      const response = await ofetch(`/api/properties/available?userId=${userId}`, {
        ignoreResponseError: true,
      })
      if (response?.success) {
        setProperties(response.data as Property[])
      }
    } catch (error) {
      console.error(error)
    }
  }, [userId])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    if (isDialogOpen) {
      loadAvailableProperties()
    }
  }, [isDialogOpen, loadAvailableProperties])

  const visibleReports = useMemo(() => {
    if (!userId) return []
    return reports
  }, [reports, userId])

  const filteredReports = useMemo(() => {
    return visibleReports.filter((report) => {
      if (filters.status !== "all" && report.status !== filters.status) {
        return false
      }
      if (filters.approval === "approved" && !report.approved) return false
      if (filters.approval === "pending" && report.approved) return false
      if (filters.search.trim().length) {
        const query = filters.search.toLowerCase()
        const matchesProperty = report.propertyName.toLowerCase().includes(query)
        const matchesReporter = report.ownerFullName.toLowerCase().includes(query)
        if (!matchesProperty && !matchesReporter) return false
      }
      const createdAt = new Date(report.createdAt)
      if (filters.startDate && createdAt < new Date(filters.startDate)) return false
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (createdAt > endDate) return false
      }
      return true
    })
  }, [visibleReports, filters])

  const statusMetrics = useMemo(
    () =>
      propertyStatuses.map((status) => ({
        status,
        value: visibleReports.filter((report) => report.status === status).length,
      })),
    [visibleReports]
  )

  const handleReportSubmit = async (values: ReportFormValues) => {
    if (!userId) return
    setIsSubmitting(true)
    try {
      const response = await ofetch("/api/property-reports", {
        method: "POST",
        body: {
          userId,
          propertyId: Number(values.propertyId),
          content: values.description,
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to submit report")
      }
      toast.success("Report submitted for review")
      setIsDialogOpen(false)
      await loadReports()
    } catch (error) {
      console.error(error)
      toast.error("Failed to report property")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (report: PropertyReport, status: PropertyStatus) => {
    if (!userId) return
    if (report.issuerId) {
      toast.error("Status can no longer be changed for this report.")
      return
    }
    if (status === "deleted") {
      toast.error("Use the delete action to remove reports.")
      return
    }

    try {
      await ofetch(`/api/property-reports/${report.propertyReportId}`, {
        method: "PATCH",
        body: { status, issuerId: userId },
        ignoreResponseError: true,
      })
      toast.success("Report status updated")
      await loadReports()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update report status")
    }
  }

  const handleApprove = async (report: PropertyReport, approved: boolean) => {
    if (!userId) return
    if (!report.issuerId) {
      toast.error("Assign an issuer before updating approval.")
      return
    }

    try {
      await ofetch(`/api/property-reports/${report.propertyReportId}`, {
        method: "PATCH",
        body: { approved, issuerId: userId },
        ignoreResponseError: true,
      })

      if (!approved) {
        await ofetch(`/api/property-reports/${report.propertyReportId}`, {
          method: "PATCH",
          body: { issuerId: null },
          ignoreResponseError: true,
        })
      }

      toast.success(approved ? "Report approved" : "Approval revoked")
      await loadReports()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update approval")
    }
  }

  const handleDelete = async (report: PropertyReport) => {
    try {
      await ofetch(`/api/property-reports/${report.propertyReportId}`, {
        method: "PATCH",
        body: { status: "deleted", issuerId: null },
        ignoreResponseError: true,
      })
      toast.success("Report marked as deleted")
      await loadReports()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete report")
    }
  }

  const handleViewReport = (report: PropertyReport) => {
    setSelectedReport(report)
    setIsSheetOpen(true)
  }

  const canSubmitReport = role === "tenant"
  const canChangeStatus = useCallback(
    (report: PropertyReport) => {
      if (!userId) return false
      if (report.status === "deleted") return false
      if (report.issuerId) return false
      return true
    },
    [userId]
  )
  const canApproveReport = useCallback(
    (report: PropertyReport) => {
      if (!userId) return false
      if (!report.issuerId) return false
      if (report.status === "deleted") return false
      const isOwner = report.ownerId === userId
      return isAdmin || isOwner
    },
    [isAdmin, userId]
  )
  const canDeleteReport = useCallback(
    (report: PropertyReport) => {
      if (!userId) return false
      if (report.status === "deleted") return false
      const isOwner = report.ownerId === userId
      return isAdmin || isOwner
    },
    [isAdmin, userId]
  )

  return (
    <>
      <Head>
        <title>Lost Property • Property Management</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/property">Property Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Lost Property</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Lost property reports</h1>
            <p className="text-muted-foreground text-sm">
              Centralized view of every missing item, approval status, and resolution.
            </p>
          </div>
          {canSubmitReport && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Report lost property
            </Button>
          )}
        </div>

        <AuthGate
          isAuthenticated={Boolean(userId)}
          description="Sign in to view the lost property registry."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statusMetrics.map((metric) => (
              <div
                key={metric.status}
                className="rounded-2xl border border-dashed bg-muted/20 p-4 text-center"
              >
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  {metric.status}
                </p>
                <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <LostPropertyFilters filters={filters} onChange={setFilters} isLoading={isLoading} />
            <LostPropertyTable
              reports={filteredReports}
              isLoading={isLoading}
              onView={handleViewReport}
              canChangeStatus={canChangeStatus}
              canApprove={canApproveReport}
              canDelete={canDeleteReport}
              onStatusChange={handleStatusChange}
              onApprove={handleApprove}
              onDelete={handleDelete}
            />
          </div>
        </AuthGate>
      </div>

      <PropertyReportSheet
        report={selectedReport}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
      <ReportLostPropertyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        properties={properties}
        onSubmit={handleReportSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PropertyStatusBadge, propertyStatuses, formatStatusLabel } from "@/components/property/properties"
import type { Property, PropertyStatus } from "@/types/properties"
import type { PropertyReport } from "@/types/reports"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClipboardList, MessageSquare } from "lucide-react"

export type LostPropertyFiltersState = {
  search: string
  status: "all" | PropertyStatus
  approval: "all" | "approved" | "pending"
  startDate: string | null
  endDate: string | null
}

type LostPropertyFiltersProps = {
  filters: LostPropertyFiltersState
  onChange: (filters: LostPropertyFiltersState) => void
  isLoading?: boolean
}

export function LostPropertyFilters({ filters, onChange, isLoading }: LostPropertyFiltersProps) {
  const update = (patch: Partial<LostPropertyFiltersState>) => onChange({ ...filters, ...patch })

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Filter reports</CardTitle>
        <CardDescription>Review incident logs by status, approval, or timeline.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Search property or reporter..."
          value={filters.search}
          disabled={isLoading}
          onChange={(event) => update({ search: event.target.value })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            value={filters.status}
            disabled={isLoading}
            onValueChange={(value) => update({ status: value as LostPropertyFiltersState["status"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {propertyStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.approval}
            disabled={isLoading}
            onValueChange={(value) =>
              update({ approval: value as LostPropertyFiltersState["approval"] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Approval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All approvals</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="date"
            value={filters.startDate ?? ""}
            disabled={isLoading}
            onChange={(event) => update({ startDate: event.target.value || null })}
          />
          <Input
            type="date"
            value={filters.endDate ?? ""}
            disabled={isLoading}
            onChange={(event) => update({ endDate: event.target.value || null })}
          />
        </div>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() =>
            onChange({
              search: "",
              status: "all",
              approval: "all",
              startDate: null,
              endDate: null,
            })
          }
        >
          Reset filters
        </Button>
      </CardContent>
    </Card>
  )
}

type LostPropertyTableProps = {
  reports: PropertyReport[]
  isLoading?: boolean
  onView: (report: PropertyReport) => void
  canChangeStatus?: (report: PropertyReport) => boolean
  canApprove?: (report: PropertyReport) => boolean
  canDelete?: (report: PropertyReport) => boolean
  onStatusChange?: (report: PropertyReport, status: PropertyStatus) => void
  onApprove?: (report: PropertyReport, approved: boolean) => void
  onDelete?: (report: PropertyReport) => void
}

export function LostPropertyTable({
  reports,
  isLoading,
  onView,
  canChangeStatus,
  canApprove,
  canDelete,
  onStatusChange,
  onApprove,
  onDelete,
}: LostPropertyTableProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="h-64 animate-pulse rounded-xl bg-muted/40" />
      </Card>
    )
  }

  if (!reports.length) {
    return (
      <Empty className="rounded-3xl border border-dashed">
        <EmptyHeader>
          <EmptyTitle>No reports yet</EmptyTitle>
          <EmptyDescription>Lost property submissions will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Lost property registry</CardTitle>
        <CardDescription>Real-time updates from residents and building security.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[540px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const isDeleted = report.status === "deleted"
                const allowStatusChanges = Boolean(
                  !isDeleted && canChangeStatus?.(report) && onStatusChange
                )
                const canToggleApproval = Boolean(
                  !isDeleted && report.issuerId && canApprove?.(report) && onApprove
                )
                const allowDelete = Boolean(!isDeleted && canDelete?.(report) && onDelete)
                const statusOptions = propertyStatuses.filter((status) => status !== "deleted")

                return (
                  <TableRow key={report.propertyReportId}>
                    <TableCell className="font-medium">{report.propertyName}</TableCell>
                    <TableCell>{report.ownerFullName}</TableCell>
                    <TableCell>
                      <PropertyStatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.approved ? "secondary" : "outline"}>
                        {report.status === "deleted" ? "Deleted" : report.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(report.createdAt), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => onView(report)}>
                            View details
                          </DropdownMenuItem>
                          {allowStatusChanges &&
                            statusOptions.map((statusOption) => (
                              <DropdownMenuItem
                                key={`${report.propertyReportId}-${statusOption}`}
                                onSelect={() => onStatusChange?.(report, statusOption)}
                              >
                                Mark {formatStatusLabel(statusOption)}
                              </DropdownMenuItem>
                            ))}
                          {canToggleApproval && (
                            <DropdownMenuItem onSelect={() => onApprove?.(report, !report.approved)}>
                              {report.approved ? "Revoke status" : "Approve status"}
                            </DropdownMenuItem>
                          )}
                          {allowDelete && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => onDelete?.(report)}
                            >
                              Delete report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

const reportFormSchema = z.object({
  propertyId: z.string().min(1, "Select a property to report"),
  description: z.string().min(10, "Please describe the incident (min 10 chars)"),
})

export type ReportFormValues = z.infer<typeof reportFormSchema>

type ReportLostPropertyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  properties: Property[]
  isSubmitting?: boolean
  onSubmit: (values: ReportFormValues) => Promise<void> | void
}

export function ReportLostPropertyDialog({
  open,
  onOpenChange,
  properties,
  isSubmitting,
  onSubmit,
}: ReportLostPropertyDialogProps) {
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      propertyId: "",
      description: "",
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  const handleSubmit = React.useCallback(
    async (values: ReportFormValues) => {
      await onSubmit(values)
      form.reset()
    },
    [form, onSubmit]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report lost property</DialogTitle>
          <DialogDescription>
            Notify building security about a missing item so the team can start an investigation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.propertyId} value={String(property.propertyId)}>
                          {property.propertyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Where was it last seen? Describe identifying marks." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

type PropertyReportSheetProps = {
  report: PropertyReport | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyReportSheet({ report, open, onOpenChange }: PropertyReportSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-xl flex-col gap-6">
        <SheetHeader className="text-left">
          <SheetTitle>{report?.propertyName ?? "Report details"}</SheetTitle>
          <SheetDescription>Complete audit trail for the selected property.</SheetDescription>
        </SheetHeader>
        {report ? (
          <div className="space-y-6">
            <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </h4>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <InfoLine label="Current status">
                  <PropertyStatusBadge status={report.status} />
                </InfoLine>
                <InfoLine label="Approval">
                  <Badge variant={report.approved ? "secondary" : "outline"}>
                    {report.approved ? "Approved" : "Pending"}
                  </Badge>
                </InfoLine>
                <InfoLine label="Issued status">
                  {report.issuedStatus ? formatStatusLabel(report.issuedStatus) : "Not issued"}
                </InfoLine>
                <InfoLine label="Last updated">{format(new Date(report.updatedAt), "dd MMM yyyy")}</InfoLine>
              </div>
            </section>
            <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Reporter
              </h4>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <InfoLine label="Resident">{report.ownerFullName}</InfoLine>
                <InfoLine label="Issuer">{report.issuerFullName ?? "Not assigned"}</InfoLine>
                <InfoLine label="Report ID">{report.propertyReportId.slice(0, 8)}</InfoLine>
                <InfoLine label="Created">{format(new Date(report.createdAt), "dd MMM yyyy HH:mm")}</InfoLine>
              </div>
            </section>
            <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h4>
              <p className="flex items-start gap-2 text-sm">
                <MessageSquare className="mt-0.5 size-4 text-muted-foreground" />
                {report.content ?? "No description provided."}
              </p>
            </section>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <ClipboardList className="mb-4 size-8" />
            <p className="text-sm">Select a report to see its audit trail.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function InfoLine({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

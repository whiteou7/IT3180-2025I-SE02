import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Badge,
} from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PropertySummary, PropertyStatus, PropertyType } from "@/types/properties"
import {
  CalendarClock,
  CircleEllipsis,
  ShieldCheck,
  User,
} from "lucide-react"

export const propertyStatuses: PropertyStatus[] = ["found", "not found", "deleted"]

export const propertyTypes: PropertyType[] = ["general", "vehicle", "document", "electronics", "other"]

export type PropertyFiltersState = {
  search: string
  status: "all" | PropertyStatus
  propertyType: "all" | PropertyType
  startDate: string | null
  endDate: string | null
}

type PropertyFiltersProps = {
  filters: PropertyFiltersState
  onChange: (next: PropertyFiltersState) => void
  isLoading?: boolean
}

export function PropertyFilters({ filters, onChange, isLoading }: PropertyFiltersProps) {
  const update = (patch: Partial<PropertyFiltersState>) =>
    onChange({ ...filters, ...patch })

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Lọc tài sản</CardTitle>
        <CardDescription>Tìm theo tên, trạng thái hoặc ngày đăng ký.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Tìm theo tên tài sản..."
          value={filters.search}
          disabled={isLoading}
          onChange={(event) => update({ search: event.target.value })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            value={filters.status}
            disabled={isLoading}
            onValueChange={(value) => update({ status: value as PropertyFiltersState["status"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {propertyStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.propertyType}
            disabled={isLoading}
            onValueChange={(value) =>
              update({ propertyType: value as PropertyFiltersState["propertyType"] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại tài sản" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {formatTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Từ</label>
            <Input
              type="date"
              value={filters.startDate ?? ""}
              disabled={isLoading}
              onChange={(event) => update({ startDate: event.target.value || null })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Đến</label>
            <Input
              type="date"
              value={filters.endDate ?? ""}
              disabled={isLoading}
              onChange={(event) => update({ endDate: event.target.value || null })}
            />
          </div>
        </div>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() =>
            onChange({
              search: "",
              status: "all",
              propertyType: "all",
              startDate: null,
              endDate: null,
            })
          }
        >
          Xóa bộ lọc
        </Button>
      </CardContent>
    </Card>
  )
}

type PropertyStatsProps = {
  data: {
    label: string
    value: number
    status: PropertyStatus
  }[]
}

export function PropertyStats({ data }: PropertyStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => (
        <Card key={item.status} className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-3xl">{item.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyStatusBadge status={item.status} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type PropertyGridProps = {
  properties: PropertySummary[]
  isLoading?: boolean
  onSelect: (property: PropertySummary) => void
  onEdit?: (property: PropertySummary) => void
  onDelete?: (property: PropertySummary) => void
  onStatusChange?: (property: PropertySummary, status: PropertyStatus) => void
  canManage?: boolean
}

export function PropertyGrid({
  properties,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  canManage,
}: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`property-skeleton-${index}`} className="h-40 animate-pulse rounded-2xl border" />
        ))}
      </div>
    )
  }

  if (!properties.length) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Không có tài sản nào phù hợp với bộ lọc hiện tại.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {properties.map((property) => (
        <Card key={property.propertyId} className="flex flex-col justify-between rounded-2xl border border-border/70">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">{property.propertyName}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                #{property.propertyId} • {formatTypeLabel(property.propertyType)}
              </CardDescription>
            </div>
            <PropertyStatusBadge status={property.status} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" />
              <span>{property.isPublic ? "Công khai" : "Riêng tư"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-4" />
              <span>{formatDate(property.createdAt)}</span>
            </div>
            {property.ownerName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4" />
                <span>{property.ownerName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleEllipsis className="size-4" />
              <span>{property.totalReports ?? 0} báo cáo</span>
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => onSelect(property)}>
                Xem chi tiết
              </Button>
              {canManage && (onStatusChange || onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Quản lý
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {onStatusChange &&
                      propertyStatuses.map((statusOption) => (
                        <DropdownMenuItem
                          key={statusOption}
                          onSelect={() => onStatusChange(property, statusOption)}
                        >
                          Đặt {formatStatusLabel(statusOption)}
                        </DropdownMenuItem>
                      ))}
                    {onEdit && (
                      <DropdownMenuItem onSelect={() => onEdit(property)}>
                        Sửa thông tin
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(property)}>
                        Xóa tài sản
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type PropertyDetailSheetProps = {
  property: PropertySummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyDetailSheet({ property, open, onOpenChange }: PropertyDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-xl flex-col gap-6">
        <SheetHeader className="text-left">
          <SheetTitle>{property?.propertyName ?? "Chi tiết tài sản"}</SheetTitle>
          <SheetDescription>
            Xem thông tin đăng ký, mức chia sẻ và các báo cáo gần đây.
          </SheetDescription>
        </SheetHeader>
        {property ? (
          <ScrollArea className="pr-4 mx-4">
            <div className="space-y-6">
              <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Đăng ký
                </h4>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <InfoRow label="Mã tài sản" value={`#${property.propertyId}`} />
                  <InfoRow label="Loại" value={formatTypeLabel(property.propertyType)} />
                  <InfoRow label="Chia sẻ" value={property.isPublic ? "Công khai" : "Riêng tư"} />
                  <InfoRow label="Ngày tạo" value={formatDate(property.createdAt)} />
                  {property.propertyType === "vehicle" && (
                    <InfoRow label="Biển số xe" value={property.licensePlate ?? "Chưa đăng ký"} />
                  )}
                </div>
              </section>
              {(property.ownerName || property.userId) && (
                <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Chủ sở hữu
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <InfoRow label="Tên cư dân" value={property.ownerName ?? "Chưa gán"} />
                    <InfoRow label="Mã cư dân" value={property.userId ?? "Chưa liên kết"} />
                  </div>
                </section>
              )}
              <section className="space-y-3 rounded-2xl border bg-muted/30 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Lịch sử báo cáo
                </h4>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Tổng số báo cáo" value={`${property.totalReports ?? 0}`} />
                  <InfoRow
                    label="Báo cáo gần nhất"
                    value={property.lastReportedAt ? formatDate(property.lastReportedAt) : "Chưa có báo cáo"}
                  />
                  <InfoRow
                    label="Trạng thái hiện tại"
                    value={<PropertyStatusBadge status={property.status} />}
                  />
                </div>
              </section>
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground">Chọn một tài sản để xem chi tiết.</p>
        )}
      </SheetContent>
    </Sheet>
  )
}

const propertyFormSchema = z
  .object({
    propertyName: z.string().min(2, "Vui lòng nhập tên tài sản"),
    propertyType: z.string().min(1, "Vui lòng chọn loại tài sản"),
    isPublic: z.boolean(),
    status: z.enum(["found", "not found", "deleted"]).optional(),
    licensePlate: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.propertyType !== "vehicle") return

    const licensePlate = data.licensePlate?.trim() ?? ""
    if (!licensePlate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["licensePlate"],
        message: "Vui lòng nhập biển số xe",
      })
      return
    }

    if (licensePlate.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["licensePlate"],
        message: "Biển số xe phải có ít nhất 4 ký tự",
      })
    }
  })

export type PropertyFormValues = z.infer<typeof propertyFormSchema>

type PropertyFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: PropertyFormValues) => Promise<void> | void
  isSubmitting?: boolean
  mode: "create" | "edit"
  defaultValues?: Partial<PropertyFormValues>
  allowStatusField?: boolean
  canSetPublic?: boolean
}

export function PropertyFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  mode,
  defaultValues,
  allowStatusField,
  canSetPublic = false,
}: PropertyFormDialogProps) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      propertyName: "",
      propertyType: "general",
      isPublic: false,
      status: "found",
      licensePlate: "",
      ...defaultValues,
    },
  })

  const propertyTypeValue = form.watch("propertyType")

  React.useEffect(() => {
    if (!canSetPublic) {
      form.setValue("isPublic", false, { shouldDirty: false, shouldValidate: false })
    }
  }, [canSetPublic, form])

  React.useEffect(() => {
    if (open) {
      form.reset({
        propertyName: defaultValues?.propertyName ?? "",
        propertyType: defaultValues?.propertyType ?? "general",
        isPublic: defaultValues?.isPublic ?? false,
        status: defaultValues?.status ?? "found",
        licensePlate: defaultValues?.licensePlate ?? "",
      })
    }
  }, [open, defaultValues, form])

  const handleSubmit = React.useCallback(
    async (values: PropertyFormValues) => {
      const preparedValues: PropertyFormValues = {
        ...values,
        isPublic: canSetPublic ? values.isPublic : false,
      }

      await onSubmit(preparedValues)

      if (mode === "create") {
        form.reset({
          propertyName: "",
          propertyType: "general",
          isPublic: false,
          status: "found",
          licensePlate: "",
        })
      }
    },
    [mode, onSubmit, form, canSetPublic]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Đăng ký tài sản" : "Chỉnh sửa tài sản"}</DialogTitle>
          <DialogDescription>
            Quản lý tài sản cư dân đã đăng ký để tiện theo dõi khi thất lạc.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="propertyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên tài sản</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Laptop, xe máy, thẻ từ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {formatTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {allowStatusField && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {formatStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {propertyTypeValue === "vehicle" && (
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biển số xe</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 51A-123.45" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border p-4">
                  <div className="space-y-1">
                    <FormLabel>Chia sẻ với bộ phận an ninh</FormLabel>
                    <p className="text-muted-foreground text-xs">
                      {canSetPublic
                        ? "Giúp nhân viên dễ nhận diện tài sản khi có sự cố."
                        : "Chỉ quản trị viên mới có thể thay đổi mục này."}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canSetPublic}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo tài sản" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const variant =
    status === "found" ? "secondary" : status === "not found" ? "destructive" : "outline"
  return <Badge variant={variant}>{formatStatusLabel(status)}</Badge>
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="border-t" />
}

export function formatStatusLabel(status: PropertyStatus) {
  switch (status) {
    case "found":
      return "Đã tìm thấy"
    case "not found":
      return "Chưa tìm thấy"
    case "deleted":
      return "Đã xóa"
    default:
      return status
  }
}

export function formatTypeLabel(type: PropertyType) {
  switch (type) {
    case "general":
      return "Chung"
    case "vehicle":
      return "Xe"
    case "document":
      return "Giấy tờ"
    case "electronics":
      return "Điện tử"
    case "other":
      return "Khác"
    default:
      return type
  }
}

export function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return format(date, "dd MMM yyyy")
}

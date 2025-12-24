import * as React from "react"
import type { Apartment } from "@/types/apartments"
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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Home, Users, Pencil } from "lucide-react"
import type { OccupancyStatus } from "@/types/enum"

export type ApartmentFiltersState = {
  search: string
  buildingId: "all" | string
  occupancy: OccupancyStatus
}

type ApartmentFiltersProps = {
  filters: ApartmentFiltersState
  onChange: (next: ApartmentFiltersState) => void
  buildingOptions: number[]
  isLoading?: boolean
}

export function ApartmentDirectoryFilters({
  filters,
  onChange,
  buildingOptions,
  isLoading,
}: ApartmentFiltersProps) {
  const setFilter = (patch: Partial<ApartmentFiltersState>) =>
    onChange({ ...filters, ...patch })

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Lọc căn hộ</CardTitle>
        <CardDescription>
          Tìm nhanh căn hộ theo tòa, trạng thái hoặc số căn.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Tìm theo số căn hộ..."
          value={filters.search}
          disabled={isLoading}
          onChange={(event) => setFilter({ search: event.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            value={filters.buildingId}
            disabled={isLoading}
            onValueChange={(value) =>
              setFilter({ buildingId: value as ApartmentFiltersState["buildingId"] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tòa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tòa</SelectItem>
              {buildingOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  Tòa {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.occupancy}
            disabled={isLoading}
            onValueChange={(value) =>
              setFilter({ occupancy: value as ApartmentFiltersState["occupancy"] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tình trạng ở" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả căn</SelectItem>
              <SelectItem value="occupied">Đang có người ở</SelectItem>
              <SelectItem value="vacant">Đang trống</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() =>
            onChange({
              search: "",
              buildingId: "all",
              occupancy: "all",
            })
          }
        >
          Xóa bộ lọc
        </Button>
      </CardContent>
    </Card>
  )
}

type ApartmentGridProps = {
  apartments: Apartment[]
  onSelectApartment: (apartment: Apartment) => void
  isLoading?: boolean
}

export function ApartmentDirectoryGrid({
  apartments,
  onSelectApartment,
  isLoading,
}: ApartmentGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-36 animate-pulse rounded-xl border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  if (!apartments.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        Không có căn hộ nào phù hợp với bộ lọc hiện tại.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {apartments.map((apartment) => {
        const isOccupied = Boolean(apartment.members?.length)
        return (
          <Card
            key={apartment.apartmentId}
            className="cursor-pointer border border-border/60 transition hover:border-primary"
            onClick={() => onSelectApartment(apartment)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">
                  #{apartment.apartmentNumber}
                </CardTitle>
                <CardDescription>
                  Tòa {apartment.buildingId} • {apartment.floor}F
                </CardDescription>
              </div>
              <Badge variant={isOccupied ? "secondary" : "outline"}>
                {isOccupied ? "Đã Thuê" : "Trống"}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Home className="size-4" />
                <span>{apartment.monthlyFee.toLocaleString()} $/month</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span>{apartment.members?.length ?? 0} residents</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

type ApartmentDetailsDialogProps = {
  apartment: Apartment | null
  open: boolean
  onOpenChange: (next: boolean) => void
  onEdit?: (apartment: Apartment) => void
  isAdmin?: boolean
}

export function ApartmentDetailsDialog({
  apartment,
  open,
  onOpenChange,
  onEdit,
  isAdmin,
}: ApartmentDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                Căn hộ #{apartment?.apartmentNumber ?? "—"}
              </DialogTitle>
              <DialogDescription>
                Tòa {apartment?.buildingId} • Tầng {apartment?.floor}
              </DialogDescription>
            </div>
            {isAdmin && apartment && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(apartment)}>
                <Pencil className="mr-2 size-4" />
                Sửa
              </Button>
            )}
          </div>
        </DialogHeader>
        {apartment ? (
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-muted-foreground" />
                Phí hàng tháng:{" "}
                <span className="font-semibold">
                  {apartment.monthlyFee.toLocaleString()} $
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted-foreground" />
                Số cư dân:{" "}
                <span className="font-semibold">
                  {apartment.members?.length ?? 0}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Current residents
                </h4>
                <Badge variant="outline">
                  {apartment.members?.length ?? 0} people
                </Badge>
              </div>
              <Separator className="my-3" />
              {apartment.members?.length ? (
                <div className="space-y-3">
                  {apartment.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback>
                            {member.fullName
                              .split(" ")
                              .slice(0, 2)
                              .map((word) => word[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.fullName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Cư dân đại diện</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                  Chưa có cư dân được gán.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Chọn một căn hộ để xem chi tiết.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

const apartmentFormSchema = z.object({
  buildingId: z.string().min(1, "Vui lòng chọn tòa"),
  floor: z.string().min(1, "Vui lòng nhập tầng"),
  apartmentNumber: z.string().min(1, "Vui lòng nhập số căn hộ"),
  monthlyFee: z.string().min(1, "Vui lòng nhập phí hàng tháng"),
})

export type ApartmentFormValues = z.infer<typeof apartmentFormSchema>

type CreateApartmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ApartmentFormValues) => Promise<void> | void
  isCreating?: boolean
  buildingOptions: number[]
}

export function CreateApartmentDialog({
  open,
  onOpenChange,
  onSubmit,
  isCreating,
  buildingOptions,
}: CreateApartmentDialogProps) {
  const form = useForm<ApartmentFormValues>({
    resolver: zodResolver(apartmentFormSchema),
    defaultValues: {
      buildingId: "",
      floor: "",
      apartmentNumber: "",
      monthlyFee: "",
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  const handleSubmit = React.useCallback(
    async (values: ApartmentFormValues) => {
      await onSubmit(values)
      form.reset()
    },
    [onSubmit, form]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo căn hộ mới</DialogTitle>
          <DialogDescription>
            Thêm căn hộ mới vào danh sách căn hộ.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="buildingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tòa</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tòa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buildingOptions.map((id) => (
                        <SelectItem key={id} value={String(id)}>
                          Tòa {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tầng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apartmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số căn hộ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="101"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phí hàng tháng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000000"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Đang tạo..." : "Tạo căn hộ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

type EditApartmentDialogProps = {
  apartment: Apartment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ApartmentFormValues) => Promise<void> | void
  isSaving?: boolean
  buildingOptions: number[]
}

export function EditApartmentDialog({
  apartment,
  open,
  onOpenChange,
  onSubmit,
  isSaving,
  buildingOptions,
}: EditApartmentDialogProps) {
  const form = useForm<ApartmentFormValues>({
    resolver: zodResolver(apartmentFormSchema),
    values: apartment
      ? {
        buildingId: String(apartment.buildingId),
        floor: String(apartment.floor),
        apartmentNumber: String(apartment.apartmentNumber),
        monthlyFee: String(apartment.monthlyFee),
      }
      : {
        buildingId: "",
        floor: "",
        apartmentNumber: "",
        monthlyFee: "",
      },
  })

  React.useEffect(() => {
    if (apartment) {
      form.reset({
        buildingId: String(apartment.buildingId),
        floor: String(apartment.floor),
        apartmentNumber: String(apartment.apartmentNumber),
        monthlyFee: String(apartment.monthlyFee),
      })
    }
  }, [apartment, form])

  const handleSubmit = React.useCallback(
    async (values: ApartmentFormValues) => {
      await onSubmit(values)
    },
    [onSubmit]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa căn hộ #{apartment?.apartmentNumber ?? "—"}</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin căn hộ và phí hàng tháng.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="buildingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tòa</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tòa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buildingOptions.map((id) => (
                        <SelectItem key={id} value={String(id)}>
                          Tòa {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tầng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apartmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số căn hộ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="101"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phí hàng tháng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000000"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

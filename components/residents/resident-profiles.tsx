import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
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
import { cn } from "@/lib/utils"
import type { User } from "@/types/users"
import type { ResidentStatus } from "@/types/enum"

export type ResidentProfile = Pick<
  User,
  "userId" | "fullName" | "email" | "role" | "yearOfBirth" | "gender" | "phoneNumber" | "apartmentId"
> & {
  apartmentNumber?: number | null
  buildingId?: number | null
  floor?: number | null
  status: ResidentStatus
}

import type { UserRole } from "@/types/enum"

export type ResidentFiltersState = {
  search: string
  status: "all" | ResidentStatus
  role: "all" | UserRole
}

type ResidentFiltersProps = {
  filters: ResidentFiltersState
  onChange: (next: ResidentFiltersState) => void
  isLoading?: boolean
}

export function ResidentFilters({
  filters,
  onChange,
  isLoading,
}: ResidentFiltersProps) {
  const setFilter = React.useCallback(
    (patch: Partial<ResidentFiltersState>) => {
      onChange({ ...filters, ...patch })
    },
    [filters, onChange]
  )

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/40 p-4 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Bộ lọc danh sách cư dân
          </p>
          <p className="text-muted-foreground text-xs">
            Kết hợp tìm kiếm, tình trạng gán và vai trò để lọc nhanh danh sách.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() =>
            onChange({
              search: "",
              status: "all",
              role: "all",
            })
          }
        >
          Đặt lại
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Tìm theo tên, email hoặc căn hộ..."
          value={filters.search}
          disabled={isLoading}
          onChange={(event) => setFilter({ search: event.target.value })}
        />
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilter({ status: value as ResidentFiltersState["status"] })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tình trạng gán căn hộ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả cư dân</SelectItem>
            <SelectItem value="assigned">Đã gán</SelectItem>
            <SelectItem value="unassigned">Chưa gán</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.role}
          onValueChange={(value) =>
            setFilter({ role: value as ResidentFiltersState["role"] })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="tenant">Cư dân</SelectItem>
            <SelectItem value="admin">Quản trị</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

type ResidentProfilesTableProps = {
  residents: ResidentProfile[]
  isLoading?: boolean
  onSelectResident: (resident: ResidentProfile) => void
}

export function ResidentProfilesTable({
  residents,
  isLoading,
  onSelectResident,
}: ResidentProfilesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card/40 p-6">
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-full animate-pulse rounded bg-muted/60"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cư dân</TableHead>
          <TableHead>Căn hộ</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Năm sinh</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {residents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              Không tìm thấy cư dân phù hợp với bộ lọc hiện tại.
            </TableCell>
          </TableRow>
        ) : (
          residents.map((resident) => {
            const apartmentLabel =
                  resident.apartmentNumber && resident.buildingId
                    ? `B${resident.buildingId} • #${resident.apartmentNumber}`
                    : resident.apartmentNumber
                      ? `#${resident.apartmentNumber}`
                      : "Chưa gán"
            return (
              <TableRow
                key={resident.userId}
                className="cursor-pointer"
                onClick={() => onSelectResident(resident)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{resident.fullName}</span>
                    <span className="text-muted-foreground text-xs">
                      {resident.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {apartmentLabel}
                </TableCell>
                <TableCell>
                  <StatusBadge status={resident.status} />
                </TableCell>
                <TableCell className="capitalize">
                  {resident.role === "tenant"
                    ? "Cư dân"
                    : resident.role === "admin"
                      ? "Quản trị"
                      : resident.role === "police"
                        ? "Công An"
                        : "Kế toán"}
                </TableCell>
                <TableCell>
                  {resident.yearOfBirth ?? "—"}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

const statusLabel: Record<ResidentStatus, string> = {
  assigned: "Đã gán",
  unassigned: "Chưa gán",
}

const statusVariant: Record<ResidentStatus, "default" | "outline"> = {
  assigned: "default",
  unassigned: "outline",
}

function StatusBadge({ status }: { status: ResidentStatus }) {
  return (
    <Badge variant={statusVariant[status]} className="capitalize">
      {statusLabel[status]}
    </Badge>
  )
}

const residentFormSchema = z.object({
  fullName: z.string().min(3),
  email: z.email(),
  role: z.enum(["tenant", "admin", "police", "accountant"] as const),
  yearOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"] as const).optional(),
  phoneNumber: z.string().optional(),
})

export type ResidentFormValues = z.infer<typeof residentFormSchema>

type ResidentProfileDrawerProps = {
  resident: ResidentProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ResidentFormValues) => Promise<void> | void
  isSaving?: boolean
  isAdmin?: boolean
  isSpecialAccount?: boolean
}

export function ResidentProfileDrawer({
  resident,
  open,
  onOpenChange,
  onSubmit,
  isSaving,
  isAdmin = false,
  isSpecialAccount = false,
}: ResidentProfileDrawerProps) {
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    values: resident
      ? {
        fullName: resident.fullName,
        email: resident.email,
        role: resident.role,
        yearOfBirth: resident.yearOfBirth?.toString() ?? "",
        gender: resident.gender ?? undefined,
        phoneNumber: resident.phoneNumber ?? "",
      }
      : {
        fullName: "",
        email: "",
        role: "tenant",
        yearOfBirth: "",
        gender: undefined,
        phoneNumber: "",
      },
  })

  React.useEffect(() => {
    if (resident) {
      form.reset({
        fullName: resident.fullName,
        email: resident.email,
        role: resident.role,
        yearOfBirth: resident.yearOfBirth?.toString() ?? "",
        gender: resident.gender ?? undefined,
        phoneNumber: resident.phoneNumber ?? "",
      })
    }
  }, [resident, form])

  const handleSubmit = React.useCallback(
    async (values: ResidentFormValues) => {
      await onSubmit(values)
    },
    [onSubmit]
  )

  const apartmentLabel =
    resident?.apartmentNumber && resident?.buildingId
      ? `B${resident.buildingId} • #${resident.apartmentNumber}`
      : resident?.apartmentNumber
        ? `#${resident.apartmentNumber}`
        : "Chưa gán"

  return (
    <div>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col gap-6 overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {resident?.fullName ??
                (isSpecialAccount ? "Chi tiết tài khoản đặc biệt" : "Chi tiết cư dân")}
            </SheetTitle>
            <SheetDescription>
              {isSpecialAccount 
                ? "Xem và cập nhật thông tin tài khoản đặc biệt."
                : "Xem và cập nhật thông tin cư dân."}
            </SheetDescription>
          </SheetHeader>

          {resident ? (
            <div className="space-y-2 rounded-xl border bg-muted/20 p-4 mx-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isSpecialAccount ? "Mã tài khoản" : "Mã cư dân"}
                </span>
                <span className="font-mono text-xs">{resident.userId}</span>
              </div>
              {!isSpecialAccount && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Căn hộ</span>
                  <span className="font-medium">{apartmentLabel}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vai trò</span>
                <span className="capitalize">
                  {resident.role === "tenant"
                    ? "Cư dân"
                    : resident.role === "admin"
                      ? "Quản trị"
                      : resident.role === "police"
                        ? "Công An"
                        : "Kế toán"}
                </span>
              </div>
            </div>
          ) : null}

          <Separator />

          <Form {...form}>
            <form
              className="space-y-6 mx-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyen Van A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="resident@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="yearOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of birth</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1995"
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
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(value)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tenant">Cư dân</SelectItem>
                            <SelectItem value="admin">Quản trị</SelectItem>
                            <SelectItem value="police">Công An</SelectItem>
                            <SelectItem value="accountant">Kế toán</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
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
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function useResidentFilters(
  initialState: ResidentFiltersState = {
    search: "",
    status: "all",
    role: "all",
  }
) {
  const [filters, setFilters] =
    React.useState<ResidentFiltersState>(initialState)
  return { filters, setFilters }
}

export function useResidentSearch(residents: ResidentProfile[], filters: ResidentFiltersState) {
  return React.useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return residents.filter((resident) => {
      if (filters.status !== "all" && resident.status !== filters.status) {
        return false
      }
      if (filters.role !== "all" && resident.role !== filters.role) {
        return false
      }
      if (!query.length) {
        return true
      }
      return (
        resident.fullName.toLowerCase().includes(query) ||
        resident.email.toLowerCase().includes(query) ||
        (resident.apartmentNumber ?? "").toString().toLowerCase().includes(query)
      )
    })
  }, [residents, filters])
}

export function ResidentEmptyState({
  className,
  message = "Không tìm thấy cư dân.",
}: { className?: string; message?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground",
        className
      )}
    >
      <span>{message}</span>
    </div>
  )
}

export type SpecialAccountProfile = Pick<
  User,
  "userId" | "fullName" | "email" | "role" | "yearOfBirth" | "gender" | "phoneNumber"
>

type SpecialAccountsTableProps = {
  accounts: SpecialAccountProfile[]
  isLoading?: boolean
  onSelectAccount: (account: SpecialAccountProfile) => void
}

export function SpecialAccountsTable({
  accounts,
  isLoading,
  onSelectAccount,
}: SpecialAccountsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card/40 p-6">
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-full animate-pulse rounded bg-muted/60"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Họ tên</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Số điện thoại</TableHead>
          <TableHead>Năm sinh</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              Không tìm thấy tài khoản đặc biệt.
            </TableCell>
          </TableRow>
        ) : (
          accounts.map((account) => (
            <TableRow
              key={account.userId}
              className="cursor-pointer"
              onClick={() => onSelectAccount(account)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{account.fullName}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {account.email}
                </span>
              </TableCell>
              <TableCell className="capitalize">
                {account.role === "police" ? "Công An" : "Kế Toán"}
              </TableCell>
              <TableCell>
                {account.phoneNumber ?? "—"}
              </TableCell>
              <TableCell>
                {account.yearOfBirth ?? "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export function useSpecialAccountSearch(
  accounts: SpecialAccountProfile[],
  searchQuery: string
) {
  return React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query.length) {
      return accounts
    }
    return accounts.filter(
      (account) =>
        account.fullName.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query) ||
        (account.phoneNumber ?? "").toLowerCase().includes(query)
    )
  }, [accounts, searchQuery])
}

const createUserSchema = z.object({
  fullName: z.string().min(3, "Họ và tên phải có ít nhất 3 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["tenant", "admin", "police", "accountant"] as const),
  yearOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"] as const).optional(),
  phoneNumber: z.string().optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

type CreateUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateUserFormValues) => Promise<void> | void
  isCreating?: boolean
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isCreating,
}: CreateUserDialogProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "tenant",
      yearOfBirth: "",
      gender: undefined,
      phoneNumber: "",
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  const handleSubmit = React.useCallback(
    async (values: CreateUserFormValues) => {
      await onSubmit(values)
      form.reset()
    },
    [onSubmit, form]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo người dùng mới</DialogTitle>
          <DialogDescription>
            Thêm cư dân hoặc tài khoản quản trị vào hệ thống.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyen Van A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tenant">Cư dân</SelectItem>
                        <SelectItem value="admin">Quản trị</SelectItem>
                        <SelectItem value="police">Công An</SelectItem>
                        <SelectItem value="accountant">Kế toán</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm sinh</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1995"
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới tính</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
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
                {isCreating ? "Đang tạo..." : "Tạo người dùng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

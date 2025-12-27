import * as React from "react"
import { Badge } from "@/components/ui/badge"
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
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { UserCheck, UserMinus } from "lucide-react"
import type { User } from "@/types/users"
import type { ResidentStatus } from "@/types/enum"

export type StatusRecord = Pick<User, "userId" | "fullName" | "role" | "apartmentId"> & {
  status: ResidentStatus
  apartmentNumber?: number | null
  buildingId?: number | null
}

function formatResidentStatus(status: ResidentStatus) {
  return status === "assigned" ? "Đã gán" : "Chưa gán"
}

function formatRole(role: StatusRecord["role"]) {
  switch (role) {
    case "tenant":
      return "Cư dân"
    case "admin":
      return "Quản trị"
    case "police":
      return "Công An"
    case "accountant":
      return "Kế toán"
    default:
      return role
  }
}

type StatusDashboardProps = {
  total: number
  assigned: number
  unassigned: number
}

export function ResidenceStatusCards({
  total,
  assigned,
  unassigned,
}: StatusDashboardProps) {
  const cards = [
    {
      label: "Cư dân đã gán",
      value: assigned,
      icon: UserCheck,
      description: "Cư dân đã được liên kết với căn hộ.",
    },
    {
      label: "Cư dân chưa gán",
      value: unassigned,
      icon: UserMinus,
      description: "Cư dân chưa được liên kết với căn hộ.",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-border/60 bg-muted/20">
        <CardHeader className="pb-2">
          <CardDescription>Tổng số cư dân</CardDescription>
          <CardTitle className="text-4xl font-semibold">{total}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Dữ liệu được lấy từ hệ thống.
        </CardContent>
      </Card>
      {cards.map((card) => (
        <Card key={card.label} className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{card.label}</CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{card.value}</div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type ResidenceStatusTableProps = {
  records: StatusRecord[]
  onSelect: (record: StatusRecord) => void
  isLoading?: boolean
}

export function ResidenceStatusTable({
  records,
  onSelect,
  isLoading,
}: ResidenceStatusTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`status-skeleton-${index}`}
            className="h-10 animate-pulse rounded bg-muted/40"
          />
        ))}
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
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => {
          const apartmentLabel =
            record.apartmentNumber && record.buildingId
              ? `B${record.buildingId} • #${record.apartmentNumber}`
              : record.apartmentNumber
                ? `#${record.apartmentNumber}`
                : "Chưa gán"
          return (
            <TableRow key={record.userId}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{record.fullName}</span>
                  <span className="text-muted-foreground text-xs">
                    {record.userId}
                  </span>
                </div>
              </TableCell>
              <TableCell>{apartmentLabel}</TableCell>
              <TableCell>
                <Badge variant={record.status === "assigned" ? "default" : "outline"} className="capitalize">
                  {formatResidentStatus(record.status)}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{formatRole(record.role)}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onSelect(record)}>
                  Cập nhật gán căn hộ
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

type StatusChangeDialogProps = {
  open: boolean
  record: StatusRecord | null
  onOpenChange: (open: boolean) => void
  onSave: (payload: StatusChangePayload) => Promise<void> | void
  isSaving?: boolean
}

export type StatusChangePayload = {
  status: ResidentStatus
  apartmentId?: number
}

import { ofetch } from "ofetch"

export function StatusChangeDialog({
  open,
  record,
  onOpenChange,
  onSave,
  isSaving,
}: StatusChangeDialogProps) {
  const [formState, setFormState] = React.useState<StatusChangePayload>({
    status: record?.status ?? "unassigned",
    apartmentId: record?.apartmentId ?? undefined,
  })

  const [apartments, setApartments] = React.useState<
    { apartmentId: number; buildingId: number; apartmentNumber: number }[]
  >([])

  React.useEffect(() => {
    if (open) {
      ofetch("/api/apartments")
        .then((res) => {
          if (res?.data) setApartments(res.data)
        })
        .catch(() => {})
    }
  }, [open])

  React.useEffect(() => {
    if (record) {
      setFormState({
        status: record.status,
        apartmentId: record.apartmentId ?? undefined,
      })
    }
  }, [record])

  const handleChange = (patch: Partial<StatusChangePayload>) =>
    setFormState((prev) => ({ ...prev, ...patch }))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSave(formState)
  }

  const apartmentLabel =
    record?.apartmentNumber && record?.buildingId
      ? `B${record.buildingId} • #${record.apartmentNumber}`
      : record?.apartmentNumber
        ? `#${record.apartmentNumber}`
        : "Chưa gán"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật gán căn hộ</DialogTitle>
          <DialogDescription>
            Chọn trạng thái và căn hộ để liên kết cho cư dân.
          </DialogDescription>
        </DialogHeader>

        {record ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* resident info */}
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{record.fullName}</p>
              <p className="text-muted-foreground text-xs">{apartmentLabel}</p>
            </div>

            {/* status */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={formState.status}
                onValueChange={(value) =>
                  handleChange({ status: value as ResidentStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Đã gán</SelectItem>
                  <SelectItem value="unassigned">Chưa gán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* apartment select */}
            {formState.status === "assigned" ? (
              <div className="space-y-1">
                <label className="text-sm font-medium">Căn hộ</label>
                <Select
                  value={
                    formState.apartmentId
                      ? String(formState.apartmentId)
                      : undefined
                  }
                  onValueChange={(value) =>
                    handleChange({
                      apartmentId: value ? Number(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn căn hộ" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartments.map((apt) => (
                      <SelectItem
                        key={apt.apartmentId}
                        value={String(apt.apartmentId)}
                      >
                        B{apt.buildingId} • #{apt.apartmentNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Áp dụng"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Vui lòng chọn một cư dân để cập nhật gán căn hộ.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { CalendarDays, Car, Clock, ShieldAlert } from "lucide-react"
import type { VehicleLog } from "@/types/vehicles"
import type { Timeframe, AccessStatus } from "@/types/enum"

export type AccessLog = Omit<VehicleLog, "entranceTime" | "exitTime"> & {
  entranceTime: string
  exitTime: string | null
}

export type AccessFiltersState = {
  timeframe: Timeframe
  status: AccessStatus
  search: string
}

type AccessControlTableProps = {
  logs: AccessLog[]
  filters: AccessFiltersState
  onFiltersChange: (next: AccessFiltersState) => void
  isLoading?: boolean
}

export function AccessControlTable({
  logs,
  filters,
  onFiltersChange,
  isLoading,
}: AccessControlTableProps) {
  const setFilter = (patch: Partial<AccessFiltersState>) =>
    onFiltersChange({ ...filters, ...patch })

  return (
    <div className="space-y-6">
      <AccessControlFilters
        filters={filters}
        isLoading={isLoading}
        onReset={() =>
          onFiltersChange({ timeframe: "all", status: "all", search: "" })
        }
        onFiltersChange={setFilter}
      />

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Access log</CardTitle>
          <CardDescription>
            All gate events including people and vehicle access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MergedAccessLogTable logs={logs} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}

type AccessControlFiltersProps = {
  filters: AccessFiltersState
  onFiltersChange: (patch: Partial<AccessFiltersState>) => void
  onReset: () => void
  isLoading?: boolean
}

function AccessControlFilters({
  filters,
  onFiltersChange,
  onReset,
  isLoading,
}: AccessControlFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card/40 p-4 lg:flex-row lg:items-center">
      <Input
        placeholder="Tìm theo cư dân, biển số xe..."
        value={filters.search}
        disabled={isLoading}
        onChange={(event) => onFiltersChange({ search: event.target.value })}
      />
      <Select
        value={filters.timeframe}
        disabled={isLoading}
        onValueChange={(value) =>
          onFiltersChange({ timeframe: value as AccessFiltersState["timeframe"] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Khoảng thời gian" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">7 ngày gần đây</SelectItem>
          <SelectItem value="month">30 ngày gần đây</SelectItem>
          <SelectItem value="year">12 tháng gần đây</SelectItem>
          <SelectItem value="all">Tất cả thời gian</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        disabled={isLoading}
        onValueChange={(value) =>
          onFiltersChange({ status: value as AccessFiltersState["status"] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="inside">Đang ở trong</SelectItem>
          <SelectItem value="exited">Đã ra</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" disabled={isLoading} onClick={onReset}>
      Đặt lại
      </Button>
    </div>
  )
}

const statusBadgeVariant: Record<
  AccessFiltersState["status"],
  "default" | "secondary"
> = {
  all: "default",
  inside: "default",
  exited: "secondary",
}

const statusLabel: Record<AccessFiltersState["status"], string> = {
  all: "Tất cả",
  inside: "Đang ở trong",
  exited: "Đã ra",
}

function MergedAccessLogTable({
  logs,
  isLoading,
}: {
  logs: AccessLog[]
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-10 animate-pulse rounded bg-muted/50"
          />
        ))}
      </div>
    )
  }

  if (!logs.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
        No access events for the selected filters.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cư dân</TableHead>
          <TableHead>Căn hộ</TableHead>
          <TableHead>Biển số</TableHead>
          <TableHead>Vào</TableHead>
          <TableHead>Ra</TableHead>
          <TableHead>Thời lượng</TableHead>
          <TableHead>Trạng thái</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const entryDate = log.entranceTime
            ? new Date(log.entranceTime)
            : null
          const exitDate = log.exitTime ? new Date(log.exitTime) : null
          const status: AccessFiltersState["status"] = log.exitTime
            ? "exited"
            : "inside"
          const apartmentLabel =
              log.apartmentNumber && log.buildingId
                ? `B${log.buildingId} • #${log.apartmentNumber}`
                : log.apartmentNumber
                  ? `#${log.apartmentNumber}`
                  : "Chưa gán"
          const duration =
              entryDate && exitDate
                ? `${Math.round(
                  (exitDate.getTime() - entryDate.getTime()) / (1000 * 60)
                )} phút`
                : "Đang diễn ra"
          return (
            <TableRow key={log.vehicleLogId}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {log.fullName ?? "Chưa rõ cư dân"}
                  </span>
                  {log.userId ? (
                    <span className="text-muted-foreground text-xs">
                      {log.userId}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>{apartmentLabel}</TableCell>
              <TableCell className="font-mono text-xs">
                {log.licensePlate ?? "—"}
              </TableCell>
              <TableCell>{entryDate ? entryDate.toLocaleString() : "—"}</TableCell>
              <TableCell>{exitDate ? exitDate.toLocaleString() : "—"}</TableCell>
              <TableCell>{duration}</TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant[status]}>
                  {statusLabel[status]}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

type AccessSummaryCardsProps = {
  totalEntries: number
  exitedCount: number
  insideCount: number
}

export function AccessSummaryCards({
  totalEntries,
  exitedCount,
  insideCount,
}: AccessSummaryCardsProps) {
  const cards = [
    {
      title: "Lượt ra/vào",
      value: totalEntries,
      icon: CalendarDays,
      description: "Số lượt ra/vào trong khoảng thời gian đã chọn",
    },
    {
      title: "Đang ở trong",
      value: insideCount,
      icon: Car,
      description: "Xe chưa ghi nhận thời gian ra",
    },
    {
      title: "Đã ra",
      value: exitedCount,
      icon: ShieldAlert,
      description: "Xe đã ghi nhận rời khỏi khu vực",
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AccessLiveClock() {
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">
          Gate time
        </CardTitle>
        <Clock className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{now.toLocaleTimeString()}</div>
        <p className="text-muted-foreground text-xs">{now.toDateString()}</p>
      </CardContent>
    </Card>
  )
}

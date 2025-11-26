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
      label: "Assigned residents",
      value: assigned,
      icon: UserCheck,
      description: "Residents linked to an apartment record.",
    },
    {
      label: "Unassigned residents",
      value: unassigned,
      icon: UserMinus,
      description: "Users without an apartment_id.",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-border/60 bg-muted/20">
        <CardHeader className="pb-2">
          <CardDescription>Total residents</CardDescription>
          <CardTitle className="text-4xl font-semibold">{total}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Fetched from `/api/users`.
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
          <TableHead>Resident</TableHead>
          <TableHead>Apartment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => {
          const apartmentLabel =
            record.apartmentNumber && record.buildingId
              ? `B${record.buildingId} • #${record.apartmentNumber}`
              : record.apartmentNumber
                ? `#${record.apartmentNumber}`
                : "Unassigned"
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
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{record.role}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onSelect(record)}>
                  Update assignment
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
        : "Unassigned"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update assignment</DialogTitle>
          <DialogDescription>
            Toggle whether the resident is linked to an apartment. Assignments call the apartment API.
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{record.fullName}</p>
              <p className="text-muted-foreground text-xs">{apartmentLabel}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formState.status}
                onValueChange={(value) =>
                  handleChange({ status: value as ResidentStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formState.status === "assigned" ? (
              <div className="space-y-1">
                <label className="text-sm font-medium">Apartment ID</label>
                <Input
                  type="number"
                  min={1}
                  value={formState.apartmentId?.toString() ?? ""}
                  onChange={(event) =>
                    handleChange({
                      apartmentId: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Enter apartment ID"
                />
                <p className="text-muted-foreground text-xs">
                  Provide the numeric `apartment_id` defined in the schema.
                </p>
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Apply"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a resident first to manage their assignment.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import type { User } from "@/types/users"
import type { Apartment } from "@/types/apartments"
import type { ResidentStatus } from "@/types/enum"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ResidenceStatusCards,
  ResidenceStatusTable,
  StatusChangeDialog,
  StatusRecord,
  StatusChangePayload,
} from "@/components/residents/residence-status"

const buildStatusRecord = (
  user: User,
  apartmentLookup: Map<number, Apartment>
): StatusRecord => {
  const assignedApartment =
    user.apartmentId != null
      ? apartmentLookup.get(user.apartmentId)
      : undefined
  return {
    userId: user.userId,
    fullName: user.fullName,
    role: user.role,
    status: user.apartmentId ? ("assigned" as ResidentStatus) : ("unassigned" as ResidentStatus),
    apartmentId: assignedApartment?.apartmentId ?? user.apartmentId,
    apartmentNumber: assignedApartment?.apartmentNumber ?? null,
    buildingId: assignedApartment?.buildingId ?? null,
  }
}

export default function ResidenceStatusPage() {
  const [records, setRecords] = useState<StatusRecord[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedRecord, setSelectedRecord] = useState<StatusRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const apartmentMap = useMemo(
    () => new Map(apartments.map((apartment) => [apartment.apartmentId, apartment])),
    [apartments]
  )

  useEffect(() => {
    let active = true
    const fetchResidents = async () => {
      setIsLoading(true)
      try {
        const [usersResponse, apartmentsResponse] = await Promise.all([
          ofetch("/api/users", { ignoreResponseError: true }),
          ofetch("/api/apartments", { ignoreResponseError: true }),
        ])
        if (!usersResponse?.success) throw new Error(usersResponse?.message ?? "Unable to fetch residents")
        if (!apartmentsResponse?.success) throw new Error(apartmentsResponse?.message ?? "Unable to fetch apartments")

        const apartmentsPayload = (apartmentsResponse.data as Apartment[]) ?? []
        const apartmentLookup = new Map(
          apartmentsPayload.map((apartment) => [apartment.apartmentId, apartment])
        )
        const dataset = (usersResponse.data as User[]).map((user) =>
          buildStatusRecord(user, apartmentLookup)
        )
        if (active) {
          setApartments(apartmentsPayload)
          setRecords(dataset)
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load residence status data")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    fetchResidents()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const assigned = records.filter((record) => record.status === "assigned").length
    return {
      total: records.length,
      assigned,
      unassigned: records.length - assigned,
    }
  }, [records])

  const handleSelectRecord = (record: StatusRecord) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const refreshApartment = async (apartmentId: number) => {
    if (apartmentMap.has(apartmentId)) {
      return apartmentMap.get(apartmentId)
    }
    try {
      const response = await ofetch(`/api/apartments/${apartmentId}`, {
        ignoreResponseError: true,
      })
      if (response?.success && response.data) {
        const apartment = response.data as Apartment
        setApartments((prev) => [...prev, apartment])
        return apartment
      }
    } catch (error) {
      console.error("Failed to fetch apartment details", error)
    }
    return undefined
  }

  const handleSaveStatus = async (payload: StatusChangePayload) => {
    if (!selectedRecord) return
    try {
      setIsSaving(true)
      if (payload.status === "unassigned") {
        const response = await ofetch(`/api/users/${selectedRecord.userId}/apartments`, {
          method: "DELETE",
          ignoreResponseError: true,
        })
        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to unassign apartment")
        }
        setRecords((prev) =>
          prev.map((record) =>
            record.userId === selectedRecord.userId
              ? {
                ...record,
                status: "unassigned" as ResidentStatus,
                apartmentId: null,
                apartmentNumber: null,
                buildingId: null,
              }
              : record
          )
        )
      } else {
        if (!payload.apartmentId) {
          toast.error("Apartment ID is required for assignment")
          return
        }
        const response = await ofetch(`/api/users/${selectedRecord.userId}/apartments`, {
          method: "PUT",
          body: { apartmentId: payload.apartmentId },
          ignoreResponseError: true,
        })
        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to assign apartment")
        }
        let apartment = apartmentMap.get(payload.apartmentId)
        if (!apartment) {
          apartment = await refreshApartment(payload.apartmentId)
        }
        setRecords((prev) =>
          prev.map((record) =>
            record.userId === selectedRecord.userId
              ? {
                ...record,
                status: "assigned" as ResidentStatus,
                apartmentId: payload.apartmentId,
                apartmentNumber: apartment?.apartmentNumber ?? null,
                buildingId: apartment?.buildingId ?? null,
              }
              : record
          )
        )
      }
      toast.success("Assignment updated successfully")
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message ?? "Failed to update status")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Head>
        <title>Residence Status • Resident Management</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/residents/profiles">Resident Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Residence Status</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Residence status</h1>
          <p className="text-muted-foreground text-sm">
            Monitor apartment assignments using live data from the schema.
          </p>
        </div>

        <ResidenceStatusCards
          total={stats.total}
          assigned={stats.assigned}
          unassigned={stats.unassigned}
        />

        <div className="rounded-xl border bg-card/50 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Assignment list</h2>
              <p className="text-muted-foreground text-sm">
                Use the drawer to assign or remove apartments for each resident.
              </p>
            </div>
          </div>
          <ResidenceStatusTable
            records={records}
            onSelect={handleSelectRecord}
            isLoading={isLoading}
          />
        </div>
      </div>
      <StatusChangeDialog
        open={dialogOpen}
        record={selectedRecord}
        onOpenChange={setDialogOpen}
        onSave={handleSaveStatus}
        isSaving={isSaving}
      />
    </>
  )
}

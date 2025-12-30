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
import { usePagination } from "@/hooks/use-pagination"
import { PaginationWrapper } from "@/components/ui/pagination-wrapper"

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
        if (!usersResponse?.success)
          throw new Error(usersResponse?.message ?? "Không thể tải danh sách cư dân")
        if (!apartmentsResponse?.success)
          throw new Error(apartmentsResponse?.message ?? "Không thể tải danh sách căn hộ")

        const apartmentsPayload = (apartmentsResponse.data as Apartment[]) ?? []
        const apartmentLookup = new Map(
          apartmentsPayload.map((apartment) => [apartment.apartmentId, apartment])
        )
        const dataset = (usersResponse.data as User[])
          .filter((user) => user.role !== "police" && user.role !== "accountant")
          .map((user) => buildStatusRecord(user, apartmentLookup))
        if (active) {
          setApartments(apartmentsPayload)
          setRecords(dataset)
        }
      } catch (error) {
        console.error(error)
        toast.error((error as Error).message || "Không thể tải dữ liệu trạng thái cư trú")
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

  const recordsPagination = usePagination(records, { itemsPerPage: 25 })

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
      console.error("Không thể tải chi tiết căn hộ", error)
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
          throw new Error(response?.message ?? "Không thể gỡ gán căn hộ")
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
          toast.error("Vui lòng chọn căn hộ để gán")
          return
        }
        const response = await ofetch(`/api/users/${selectedRecord.userId}/apartments`, {
          method: "PUT",
          body: { apartmentId: payload.apartmentId },
          ignoreResponseError: true,
        })
        if (!response?.success) {
          throw new Error(response?.message ?? "Không thể gán căn hộ")
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
      toast.success("Đã cập nhật trạng thái gán thành công")
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message ?? "Không thể cập nhật trạng thái")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Head>
        <title>Trạng thái cư trú • Quản lý cư dân</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/residents/profiles">Quản lý cư dân</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Trạng thái cư trú</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trạng thái cư trú</h1>
          <p className="text-muted-foreground text-sm">
            Theo dõi việc gán căn hộ cho cư dân theo dữ liệu cập nhật.
          </p>
        </div>

        <ResidenceStatusCards
          total={stats.total}
          assigned={stats.assigned}
          unassigned={stats.unassigned}
        />

        <div className="space-y-4">
          <div className="rounded-xl border bg-card/50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Danh sách gán căn hộ</h2>
                <p className="text-muted-foreground text-sm">
                  Mở khung chi tiết để gán hoặc gỡ căn hộ cho từng cư dân.
                </p>
              </div>
            </div>
            <ResidenceStatusTable
              records={recordsPagination.paginatedItems}
              onSelect={handleSelectRecord}
              isLoading={isLoading}
            />
          </div>
          {records.length > 0 && (
            <PaginationWrapper
              currentPage={recordsPagination.currentPage}
              totalPages={recordsPagination.totalPages}
              itemsPerPage={recordsPagination.itemsPerPage}
              totalItems={recordsPagination.totalItems}
              startIndex={recordsPagination.startIndex}
              endIndex={recordsPagination.endIndex}
              onPageChange={recordsPagination.setCurrentPage}
              onItemsPerPageChange={recordsPagination.setItemsPerPage}
              itemsPerPageOptions={[25, 50, 100, 200]}
            />
          )}
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

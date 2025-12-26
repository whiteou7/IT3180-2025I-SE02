import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import type { Apartment } from "@/types/apartments"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ApartmentDetailsDialog,
  ApartmentDirectoryFilters,
  ApartmentDirectoryGrid,
  ApartmentFiltersState,
  CreateApartmentDialog,
  EditApartmentDialog,
  ApartmentFormValues,
} from "@/components/residents/apartment-directory"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"

export default function ApartmentDirectoryPage() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState<ApartmentFiltersState>({
    search: "",
    buildingId: "all",
    occupancy: "all",
  })
  const { role, userId } = useUserStore()
  const isAdmin = role === "admin"

  useEffect(() => {
    let mounted = true
    const loadApartments = async () => {
      setIsLoading(true)
      try {
        let currentUserApartmentId: number | null = null

        // For tenants, get their apartment ID first
        if (!isAdmin && userId) {
          const userResponse = await ofetch(`/api/users/${userId}`, { ignoreResponseError: true })
          if (userResponse?.success) {
            const user = userResponse.data as { apartmentId: number | null }
            currentUserApartmentId = user.apartmentId
          }
        }

        const response = await ofetch("/api/apartments", { ignoreResponseError: true })
        if (!response?.success) {
          throw new Error(response?.message ?? "Không thể tải danh sách căn hộ")
        }
        if (mounted) {
          let apartmentsList = response.data as Apartment[]
          // Tenants can only see their own apartment
          if (!isAdmin && currentUserApartmentId !== null) {
            apartmentsList = apartmentsList.filter(
              (apt) => apt.apartmentId === currentUserApartmentId
            )
          }
          setApartments(apartmentsList)
        }
      } catch (error) {
        console.error(error)
        toast.error((error as Error).message || "Không thể tải danh sách căn hộ")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadApartments()
    return () => {
      mounted = false
    }
  }, [isAdmin, userId])

  const buildingOptions = useMemo(
    () =>
      Array.from(new Set(apartments.map((apartment) => apartment.buildingId))).sort(
        (a, b) => a - b
      ),
    [apartments]
  )

  const filteredApartments = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return apartments.filter((apartment) => {
      if (
        filters.buildingId !== "all" &&
        String(apartment.buildingId) !== filters.buildingId
      ) {
        return false
      }
      if (filters.occupancy !== "all") {
        const occupied = Boolean(apartment.members?.length)
        if (filters.occupancy === "occupied" && !occupied) return false
        if (filters.occupancy === "vacant" && occupied) return false
      }
      if (!query.length) return true
      return String(apartment.apartmentNumber).includes(query)
    })
  }, [apartments, filters])

  const handleSelectApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment)
    setDialogOpen(true)
  }

  const handleEditApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment)
    setDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleCreateApartment = async (values: ApartmentFormValues) => {
    try {
      setIsCreating(true)
      const response = await ofetch("/api/apartments", {
        method: "POST",
        body: {
          buildingId: Number(values.buildingId),
          floor: Number(values.floor),
          apartmentNumber: Number(values.apartmentNumber),
          monthlyFee: Number(values.monthlyFee),
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tạo căn hộ")
      }
      toast.success("Đã tạo căn hộ thành công")
      setCreateDialogOpen(false)
      // Reload apartments
      const apartmentsResponse = await ofetch("/api/apartments", {
        ignoreResponseError: true,
      })
      if (apartmentsResponse?.success) {
        setApartments(apartmentsResponse.data as Apartment[])
      }
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message || "Không thể tạo căn hộ")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSaveApartment = async (values: ApartmentFormValues) => {
    if (!selectedApartment) return
    try {
      setIsSaving(true)
      const response = await ofetch(`/api/apartments/${selectedApartment.apartmentId}`, {
        method: "PUT",
        body: {
          buildingId: Number(values.buildingId),
          floor: Number(values.floor),
          apartmentNumber: Number(values.apartmentNumber),
          monthlyFee: Number(values.monthlyFee),
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể lưu căn hộ")
      }
      toast.success("Đã cập nhật căn hộ thành công")
      setEditDialogOpen(false)
      // Reload apartments
      const apartmentsResponse = await ofetch("/api/apartments", {
        ignoreResponseError: true,
      })
      if (apartmentsResponse?.success) {
        setApartments(apartmentsResponse.data as Apartment[])
      }
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message || "Không thể lưu căn hộ")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Head>
        <title>Danh bạ căn hộ • Quản lý cư dân</title>
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
              <BreadcrumbPage>Danh bạ căn hộ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Danh bạ căn hộ</h1>
            <p className="text-muted-foreground text-sm">
              Xem tình trạng ở theo tòa nhà, tầng và số căn hộ.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Thêm căn hộ
            </Button>
          )}
        </div>
        
        {isAdmin &&
          <ApartmentDirectoryFilters
            filters={filters}
            onChange={setFilters}
            buildingOptions={buildingOptions}
            isLoading={isLoading}
          />
        }

        <ApartmentDirectoryGrid
          apartments={filteredApartments}
          onSelectApartment={handleSelectApartment}
          isLoading={isLoading}
        />
      </div>
      <ApartmentDetailsDialog
        apartment={selectedApartment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onEdit={handleEditApartment}
        isAdmin={isAdmin}
      />
      {isAdmin && (
        <>
          <CreateApartmentDialog
            open={isCreateDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSubmit={handleCreateApartment}
            isCreating={isCreating}
            buildingOptions={buildingOptions}
          />
          <EditApartmentDialog
            apartment={selectedApartment}
            open={isEditDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSubmit={handleSaveApartment}
            isSaving={isSaving}
            buildingOptions={buildingOptions}
          />
        </>
      )}
    </>
  )
}

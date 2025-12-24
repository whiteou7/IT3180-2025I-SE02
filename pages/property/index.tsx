import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { AuthGate } from "@/components/auth/auth-gate"
import {
  PropertyFilters,
  PropertyFiltersState,
  PropertyFormDialog,
  PropertyGrid,
  PropertyDetailSheet,
  formatStatusLabel,
} from "@/components/property/properties"
import type { PropertyFormValues } from "@/components/property/properties"
import type { PropertyStatus, PropertySummary } from "@/types/properties"
import { useUserStore } from "@/store/userStore"

export default function PropertiesPage() {
  const { userId, role } = useUserStore()
  const isAdmin = role === "admin"

  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [filters, setFilters] = useState<PropertyFiltersState>({
    search: "",
    status: "all",
    propertyType: "all",
    startDate: null,
    endDate: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null)
  const [editingProperty, setEditingProperty] = useState<PropertySummary | null>(null)

  const fetchProperties = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const endpoint =
        role === "admin" ? "/api/properties" : `/api/users/${userId}/properties`
      const response = await ofetch(endpoint, { ignoreResponseError: true })

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tải danh sách tài sản")
      }

      const data = response.data as PropertySummary[]
      setProperties(
        data.map((item) => ({
          ...item,
          ownerName: item.ownerName ?? (item.userId === userId ? "Bạn" : item.ownerName),
        }))
      )
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải danh sách tài sản")
    } finally {
      setIsLoading(false)
    }
  }, [role, userId])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (
        filters.status !== "all" &&
        property.status !== filters.status
      ) {
        return false
      }
      if (
        filters.propertyType !== "all" &&
        property.propertyType !== filters.propertyType
      ) {
        return false
      }
      if (filters.search.trim().length > 0) {
        const query = filters.search.toLowerCase()
        const matchesName = property.propertyName.toLowerCase().includes(query)
        const matchesOwner =
          property.ownerName?.toLowerCase().includes(query) ?? false
        const matchesId = String(property.propertyId).includes(query)
        if (!matchesName && !matchesOwner && !matchesId) {
          return false
        }
      }
      const createdAt = new Date(property.createdAt)
      if (filters.startDate && createdAt < new Date(filters.startDate)) {
        return false
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (createdAt > endDate) {
          return false
        }
      }
      return true
    })
  }, [properties, filters])

  const handleSelectProperty = (property: PropertySummary) => {
    setSelectedProperty(property)
    setIsDetailOpen(true)
  }

  const handleCreateProperty = async (values: PropertyFormValues) => {
    if (!userId) return
    setIsSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        propertyName: values.propertyName,
        propertyType: values.propertyType,
        isPublic: values.isPublic,
      }

      if (values.propertyType === "vehicle") {
        payload.licensePlate = values.licensePlate
      }

      const response = await ofetch(`/api/users/${userId}/properties`, {
        method: "POST",
        body: payload,
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể đăng ký tài sản")
      }

      toast.success("Đăng ký tài sản thành công")
      setIsFormOpen(false)
      await fetchProperties()
    } catch (error) {
      console.error(error)
      toast.error("Không thể đăng ký tài sản")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProperty = async (values: PropertyFormValues) => {
    if (!editingProperty || !editingProperty.userId) return
    setIsSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        propertyName: values.propertyName,
        propertyType: values.propertyType,
        status: values.status,
        isPublic: values.isPublic,
      }

      if (values.propertyType === "vehicle") {
        payload.licensePlate = values.licensePlate
      }

      const response = await ofetch(
        `/api/users/${editingProperty.userId}/properties/${editingProperty.propertyId}`,
        {
          method: "PUT",
          body: payload,
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể lưu tài sản")
      }

      toast.success("Đã cập nhật tài sản")
      setEditingProperty(null)
      setIsFormOpen(false)
      await fetchProperties()
    } catch (error) {
      console.error(error)
      toast.error("Không thể cập nhật tài sản")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProperty = async (property: PropertySummary) => {
    if (!property.userId) return
    try {
      await ofetch(`/api/users/${property.userId}/properties/${property.propertyId}`, {
        method: "DELETE",
        ignoreResponseError: true,
      })
      toast.success("Đã xóa tài sản")
      await fetchProperties()
    } catch (error) {
      console.error(error)
      toast.error("Không thể xóa tài sản")
    }
  }

  const handleStatusChange = async (property: PropertySummary, status: PropertyStatus) => {
    if (!property.userId) return
    try {
      await ofetch(`/api/users/${property.userId}/properties/${property.propertyId}`, {
        method: "PUT",
        body: { status },
        ignoreResponseError: true,
      })
      toast.success(`Đã chuyển trạng thái: ${formatStatusLabel(status)}`)
      await fetchProperties()
    } catch (error) {
      console.error(error)
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  const handleOpenEdit = (property: PropertySummary) => {
    setEditingProperty(property)
    setIsFormOpen(true)
  }

  const creationEnabled = Boolean(userId) && role !== "police" && role !== "accountant"
  const tenantCanManage = role === "tenant"
  const editingDefaults = useMemo(() => {
    if (!editingProperty) return undefined
    return {
      propertyName: editingProperty.propertyName,
      propertyType: editingProperty.propertyType,
      isPublic: editingProperty.isPublic,
      status: editingProperty.status,
      licensePlate: editingProperty.licensePlate ?? "",
    }
  }, [editingProperty])

  return (
    <>
      <Head>
        <title>Tài sản • Quản lý tài sản</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quản lý tài sản</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Danh sách tài sản</h1>
            <p className="text-muted-foreground text-sm">
              Theo dõi tài sản cư dân đã đăng ký và trạng thái hiện tại.
            </p>
          </div>
          {creationEnabled && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 size-4" />
              Đăng ký tài sản
            </Button>
          )}
        </div>

        <AuthGate
          isAuthenticated={Boolean(userId)}
          description="Vui lòng đăng nhập để xem danh sách tài sản đã đăng ký."
        >
          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <PropertyFilters filters={filters} onChange={setFilters} isLoading={isLoading} />
            <PropertyGrid
              properties={filteredProperties}
              isLoading={isLoading}
              onSelect={handleSelectProperty}
              onEdit={isAdmin || tenantCanManage ? handleOpenEdit : undefined}
              onDelete={isAdmin || tenantCanManage ? handleDeleteProperty : undefined}
              onStatusChange={isAdmin ? handleStatusChange : undefined}
              canManage={isAdmin || tenantCanManage}
            />
          </div>
        </AuthGate>
      </div>
      <PropertyDetailSheet
        property={selectedProperty}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
      <PropertyFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingProperty(null)
        }}
        mode={editingProperty ? "edit" : "create"}
        allowStatusField={isAdmin}
        canSetPublic={isAdmin}
        defaultValues={editingDefaults}
        isSubmitting={isSubmitting}
        onSubmit={editingProperty ? handleSaveProperty : handleCreateProperty}
      />
    </>
  )
}

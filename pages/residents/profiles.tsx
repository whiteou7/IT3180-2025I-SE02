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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ResidentFilters,
  ResidentProfile,
  ResidentProfileDrawer,
  ResidentProfilesTable,
  ResidentFormValues,
  ResidentEmptyState,
  CreateUserDialog,
  CreateUserFormValues,
  useResidentFilters,
  useResidentSearch,
} from "@/components/residents/resident-profiles"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useUserStore } from "@/store/userStore"

const buildResidentProfile = (
  user: User,
  apartmentLookup: Map<number, Apartment>
): ResidentProfile => {
  const assignedApartment =
    user.apartmentId != null
      ? apartmentLookup.get(user.apartmentId)
      : undefined
  return {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    yearOfBirth: user.yearOfBirth ?? null,
    gender: user.gender ?? null,
    apartmentId: assignedApartment?.apartmentId ?? user.apartmentId,
    apartmentNumber: assignedApartment?.apartmentNumber,
    buildingId: assignedApartment?.buildingId,
    floor: assignedApartment?.floor,
    status: user.apartmentId ? ("assigned" as ResidentStatus) : ("unassigned" as ResidentStatus),
  }
}

export default function ResidentProfilesPage() {
  const [residents, setResidents] = useState<ResidentProfile[]>([])
  const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { filters, setFilters } = useResidentFilters()
  const { role, userId } = useUserStore()
  const isAdmin = role === "admin"

  useEffect(() => {
    let active = true
    const loadResidents = async () => {
      setIsLoading(true)
      try {
        const [usersResponse, apartmentsResponse] = await Promise.all([
          ofetch("/api/users", { ignoreResponseError: true }),
          ofetch("/api/apartments", { ignoreResponseError: true }),
        ])

        if (!usersResponse?.success) {
          throw new Error(usersResponse?.message ?? "Unable to load residents")
        }
        if (!apartmentsResponse?.success) {
          throw new Error(apartmentsResponse?.message ?? "Unable to load apartments")
        }

        const apartments = (apartmentsResponse.data as Apartment[]) ?? []
        const apartmentLookup = new Map(
          apartments.map((apartment) => [apartment.apartmentId, apartment])
        )

        let dataset = (usersResponse.data as User[]).map((user) =>
          buildResidentProfile(user, apartmentLookup)
        )

        // Tenants can only see their own profile
        if (!isAdmin) {
          dataset = dataset.filter((resident) => resident.userId === userId)
        }

        if (active) {
          setResidents(dataset)
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load residents. Please try again.")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadResidents()
    return () => {
      active = false
    }
  }, [isAdmin, userId])

  const filteredResidents = useResidentSearch(residents, filters)
  const assignmentStats = useMemo(() => {
    const assigned = residents.filter((resident) => resident.status === "assigned").length
    return {
      total: residents.length,
      assigned,
      unassigned: residents.length - assigned,
    }
  }, [residents])

  const handleRowClick = (resident: ResidentProfile) => {
    setSelectedResident(resident)
    setDrawerOpen(true)
  }

  const handleSave = async (values: ResidentFormValues) => {
    if (!selectedResident) return
    const parsedYear = values.yearOfBirth ? Number(values.yearOfBirth) : undefined
    const yearOfBirth =
      parsedYear && Number.isFinite(parsedYear)
        ? parsedYear
        : selectedResident.yearOfBirth
    const gender = values.gender ?? selectedResident.gender ?? null
    try {
      setIsSaving(true)
      const response = await ofetch(`/api/users/${selectedResident.userId}`, {
        method: "PUT",
        body: {
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          yearOfBirth,
          gender,
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to save resident")
      }
      setResidents((prev) =>
        prev.map((resident) =>
          resident.userId === selectedResident.userId
            ? {
              ...resident,
              fullName: values.fullName,
              email: values.email,
              role: values.role,
              yearOfBirth: yearOfBirth ?? null,
              gender,
            }
            : resident
        )
      )
      toast.success("Resident profile updated")
      setDrawerOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to save resident")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateUser = async (values: CreateUserFormValues) => {
    try {
      setIsCreating(true)
      const response = await ofetch("/api/users", {
        method: "POST",
        body: {
          email: values.email,
          fullName: values.fullName,
          password: values.password,
          role: values.role,
          yearOfBirth: values.yearOfBirth ? Number(values.yearOfBirth) : undefined,
          gender: values.gender,
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to create user")
      }
      toast.success("User created successfully")
      setCreateDialogOpen(false)
      // Reload residents
      const [usersResponse, apartmentsResponse] = await Promise.all([
        ofetch("/api/users", { ignoreResponseError: true }),
        ofetch("/api/apartments", { ignoreResponseError: true }),
      ])
      if (usersResponse?.success && apartmentsResponse?.success) {
        const apartments = (apartmentsResponse.data as Apartment[]) ?? []
        const apartmentLookup = new Map(
          apartments.map((apartment) => [apartment.apartmentId, apartment])
        )
        let dataset = (usersResponse.data as User[]).map((user) =>
          buildResidentProfile(user, apartmentLookup)
        )
        // Tenants can only see their own profile
        if (!isAdmin) {
          dataset = dataset.filter((resident) => resident.userId === userId)
        }
        setResidents(dataset)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to create user")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Head>
        <title>Resident Profiles • Apartment Management</title>
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
              <BreadcrumbPage>Resident Profiles</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Resident profiles</h1>
            <p className="text-muted-foreground text-sm">
              Search, filter, and edit resident records backed directly by the database schema.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add user
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total residents</CardDescription>
                <CardTitle className="text-2xl">{assignmentStats.total}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">
              Count of all users returned from `/api/users`.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Assigned</CardDescription>
                <CardTitle className="text-2xl">{assignmentStats.assigned}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">
              Residents with an `apartment_id`.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unassigned</CardDescription>
                <CardTitle className="text-2xl">{assignmentStats.unassigned}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">
              Residents awaiting placement.
              </CardContent>
            </Card>
          </div>
        )}
        {isAdmin && (
          <ResidentFilters filters={filters} onChange={setFilters} isLoading={isLoading} />
        )}

        {filteredResidents.length ? (
          <ResidentProfilesTable
            residents={filteredResidents}
            isLoading={isLoading}
            onSelectResident={handleRowClick}
          />
        ) : isLoading ? null : (
          <ResidentEmptyState className="py-20" message="No resident matches the selected filters." />
        )}
      </div>
      <ResidentProfileDrawer
        resident={selectedResident}
        open={isDrawerOpen}
        onOpenChange={setDrawerOpen}
        onSubmit={handleSave}
        isSaving={isSaving}
        isAdmin={isAdmin}
      />
      {isAdmin && (
        <CreateUserDialog
          open={isCreateDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateUser}
          isCreating={isCreating}
        />
      )}
    </>
  )
}

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
  SpecialAccountProfile,
  SpecialAccountsTable,
  useSpecialAccountSearch,
} from "@/components/residents/resident-profiles"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useUserStore } from "@/store/userStore"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

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
    phoneNumber: user.phoneNumber ?? null,
    apartmentId: assignedApartment?.apartmentId ?? user.apartmentId,
    apartmentNumber: assignedApartment?.apartmentNumber,
    buildingId: assignedApartment?.buildingId,
    floor: assignedApartment?.floor,
    status: user.apartmentId ? ("assigned" as ResidentStatus) : ("unassigned" as ResidentStatus),
  }
}

export default function ResidentProfilesPage() {
  const [residents, setResidents] = useState<ResidentProfile[]>([])
  const [specialAccounts, setSpecialAccounts] = useState<SpecialAccountProfile[]>([])
  const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<SpecialAccountProfile | null>(null)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("residents")
  const [specialAccountSearch, setSpecialAccountSearch] = useState("")
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
          throw new Error(usersResponse?.message ?? "Không thể tải danh sách cư dân")
        }
        if (!apartmentsResponse?.success) {
          throw new Error(apartmentsResponse?.message ?? "Không thể tải danh sách căn hộ")
        }

        const apartments = (apartmentsResponse.data as Apartment[]) ?? []
        const apartmentLookup = new Map(
          apartments.map((apartment) => [apartment.apartmentId, apartment])
        )

        const allUsers = usersResponse.data as User[]
        
        // Separate residents (tenant and admin) from special accounts (accountant and police)
        const residentUsers = allUsers.filter(
          (user) => user.role === "tenant" || user.role === "admin"
        )
        const specialAccountUsers = allUsers.filter(
          (user) => user.role === "accountant" || user.role === "police"
        )

        let residentDataset = residentUsers.map((user) =>
          buildResidentProfile(user, apartmentLookup)
        )
        const specialAccountDataset: SpecialAccountProfile[] = specialAccountUsers.map((user) => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          yearOfBirth: user.yearOfBirth ?? null,
          gender: user.gender ?? null,
          phoneNumber: user.phoneNumber ?? null,
        }))

        // Tenants can only see their own profile
        if (!isAdmin) {
          residentDataset = residentDataset.filter((resident) => resident.userId === userId)
        }

        if (active) {
          setResidents(residentDataset)
          setSpecialAccounts(specialAccountDataset)
        }
      } catch (error) {
        console.error(error)
        toast.error((error as Error).message || "Không thể tải dữ liệu. Vui lòng thử lại.")
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
  const filteredSpecialAccounts = useSpecialAccountSearch(specialAccounts, specialAccountSearch)
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
    setSelectedAccount(null)
    setDrawerOpen(true)
  }

  const handleAccountClick = (account: SpecialAccountProfile) => {
    setSelectedAccount(account)
    setSelectedResident(null)
    setDrawerOpen(true)
  }

  const handleSave = async (values: ResidentFormValues) => {
    const targetUser = selectedResident || selectedAccount
    if (!targetUser) return
    
    const parsedYear = values.yearOfBirth ? Number(values.yearOfBirth) : undefined
    const yearOfBirth =
      parsedYear && Number.isFinite(parsedYear)
        ? parsedYear
        : targetUser.yearOfBirth
    const gender = values.gender ?? targetUser.gender ?? null
    try {
      setIsSaving(true)
      const response = await ofetch(`/api/users/${targetUser.userId}`, {
        method: "PUT",
        body: {
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          yearOfBirth,
          gender,
          phoneNumber: values.phoneNumber || null,
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể lưu thông tin")
      }
      
      if (selectedResident) {
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
                phoneNumber: values.phoneNumber || null,
              }
              : resident
          )
        )
        toast.success("Đã cập nhật hồ sơ cư dân")
      } else if (selectedAccount) {
        setSpecialAccounts((prev) =>
          prev.map((account) =>
            account.userId === selectedAccount.userId
              ? {
                ...account,
                fullName: values.fullName,
                email: values.email,
                role: values.role,
                yearOfBirth: yearOfBirth ?? null,
                gender,
                phoneNumber: values.phoneNumber || null,
              }
              : account
          )
        )
        toast.success("Đã cập nhật tài khoản đặc biệt")
      }
      setDrawerOpen(false)
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message || "Không thể lưu thông tin")
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
          phoneNumber: values.phoneNumber || undefined,
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tạo người dùng")
      }
      toast.success("Tạo người dùng thành công")
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
        const allUsers = usersResponse.data as User[]
        
        const residentUsers = allUsers.filter(
          (user) => user.role === "tenant" || user.role === "admin"
        )
        const specialAccountUsers = allUsers.filter(
          (user) => user.role === "accountant" || user.role === "police"
        )

        let residentDataset = residentUsers.map((user) =>
          buildResidentProfile(user, apartmentLookup)
        )
        const specialAccountDataset: SpecialAccountProfile[] = specialAccountUsers.map((user) => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          yearOfBirth: user.yearOfBirth ?? null,
          gender: user.gender ?? null,
          phoneNumber: user.phoneNumber ?? null,
        }))

        if (!isAdmin) {
          residentDataset = residentDataset.filter((resident) => resident.userId === userId)
        }
        setResidents(residentDataset)
        setSpecialAccounts(specialAccountDataset)
      }
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message || "Không thể tạo người dùng")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Head>
        <title>Hồ sơ cư dân • Quản lý chung cư</title>
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
              <BreadcrumbPage>Hồ sơ cư dân</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hồ sơ cư dân</h1>
            <p className="text-muted-foreground text-sm">
              Tìm kiếm, lọc và cập nhật thông tin cư dân.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Thêm người dùng
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tổng số cư dân</CardDescription>
                <CardTitle className="text-2xl">{assignmentStats.total}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">
                Tổng số cư dân trong hệ thống.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Đã gán</CardDescription>
                <CardTitle className="text-2xl">{assignmentStats.assigned}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">
                Cư dân đã được gán căn hộ.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Chưa gán</CardDescription>
                <CardTitle className="text-2xl">{assignmentStats.unassigned}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">
                Cư dân chưa được gán căn hộ.
              </CardContent>
            </Card>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="residents">Cư dân</TabsTrigger>
            {isAdmin && <TabsTrigger value="special-accounts">Tài khoản đặc biệt</TabsTrigger>}
          </TabsList>

          <TabsContent value="residents" className="space-y-6">
            {isAdmin && (
              <ResidentFilters filters={filters} onChange={setFilters} isLoading={isLoading} />
            )}

            {filteredResidents.length ? (
              <div className="rounded-xl border bg-card/50 p-6 shadow-sm">
                <ResidentProfilesTable
                  residents={filteredResidents}
                  isLoading={isLoading}
                  onSelectResident={handleRowClick}
                />
              </div>
            ) : isLoading ? null : (
              <ResidentEmptyState className="py-20" message="Không có cư dân nào phù hợp với bộ lọc." />
            )}
          </TabsContent>

          <TabsContent value="special-accounts" className="space-y-6">
            {isAdmin && (
              <div className="flex flex-col gap-3 rounded-xl border bg-card/40 p-4 backdrop-blur">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tìm tài khoản đặc biệt
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Tìm theo tên, email hoặc số điện thoại.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setSpecialAccountSearch("")}
                  >
                    Đặt lại
                  </Button>
                </div>
                <Input
                  placeholder="Tìm theo tên, email hoặc số điện thoại..."
                  value={specialAccountSearch}
                  disabled={isLoading}
                  onChange={(event) => setSpecialAccountSearch(event.target.value)}
                />
              </div>
            )}

            {filteredSpecialAccounts.length ? (
              <div className="rounded-xl border bg-card/50 p-6 shadow-sm">
                <SpecialAccountsTable
                  accounts={filteredSpecialAccounts}
                  isLoading={isLoading}
                  onSelectAccount={handleAccountClick}
                />
              </div>
            ) : isLoading ? null : (
              <ResidentEmptyState className="py-20" message="Không tìm thấy tài khoản đặc biệt." />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <ResidentProfileDrawer
        resident={selectedResident || (selectedAccount ? {
          userId: selectedAccount.userId,
          fullName: selectedAccount.fullName,
          email: selectedAccount.email,
          role: selectedAccount.role,
          yearOfBirth: selectedAccount.yearOfBirth,
          gender: selectedAccount.gender,
          phoneNumber: selectedAccount.phoneNumber,
          apartmentId: null,
          status: "unassigned" as ResidentStatus,
        } : null)}
        open={isDrawerOpen}
        onOpenChange={setDrawerOpen}
        onSubmit={handleSave}
        isSaving={isSaving}
        isAdmin={isAdmin}
        isSpecialAccount={!!selectedAccount}
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

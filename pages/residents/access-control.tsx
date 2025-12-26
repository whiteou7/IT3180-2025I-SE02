import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AccessControlTable,
  AccessFiltersState,
  AccessLiveClock,
  AccessSummaryCards,
  AccessLog,
} from "@/components/residents/access-control"
import { APIBody } from "@/types/api"
import { Vehicle } from "@/types/properties"

type VehicleCheckinResponse = {
  logs: AccessLog[]
}

const timeframeToQuery: Record<AccessFiltersState["timeframe"], string | undefined> =
  {
    week: "week",
    month: "month",
    year: "year",
    all: undefined,
  }

export default function AccessControlPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [filters, setFilters] = useState<AccessFiltersState>({
    timeframe: "month",
    status: "all",
    search: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hasVehicle, setHasVehicle] = useState(false)
  const { role, userId } = useUserStore()
  const hasAllowedRole = role === "admin" || role === "police"

  // Check if user has a vehicle
  useEffect(() => {
    if (!userId) {
      setHasVehicle(false)
      return
    }

    const checkVehicle = async () => {
      try {
        const res = await ofetch<APIBody<Vehicle>>(
          `/api/users/${userId}/vehicles`,
          {
            ignoreResponseError: true,
          }
        )
        setHasVehicle(res.success && res.data !== null)
      } catch (err) {
        console.error(err)
        setHasVehicle(false)
      }
    }

    checkVehicle()
  }, [userId])

  useEffect(() => {
    let active = true
    const fetchLogs = async () => {
      setIsLoading(true)
      try {
        const queryFilter = timeframeToQuery[filters.timeframe]
        const queryParams: { filter?: string; userId?: string } = {}
        if (queryFilter) {
          queryParams.filter = queryFilter
        }
        // For residents, only fetch their own logs
        if (!hasAllowedRole && userId) {
          queryParams.userId = userId
        }
        const response = await ofetch("/api/vehicles/checkin", {
          ignoreResponseError: true,
          query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        })
        if (!response?.success) {
          throw new Error(response?.message ?? "Không thể tải nhật ký ra/vào")
        }
        const payload = (response.data as VehicleCheckinResponse).logs ?? []
        if (active) {
          setLogs(payload)
        }
      } catch (error) {
        console.error(error)
        toast.error((error as Error).message || "Không thể tải dữ liệu ra/vào")
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    fetchLogs()
    return () => {
      active = false
    }
  }, [filters.timeframe, hasAllowedRole, userId])

  const filteredLogs = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return logs.filter((log) => {
      if (filters.status === "inside" && log.exitTime) {
        return false
      }
      if (filters.status === "exited" && !log.exitTime) {
        return false
      }
      if (!query.length) return true
      return (
        (log.fullName ?? "").toLowerCase().includes(query) ||
        (log.licensePlate ?? "").toLowerCase().includes(query) ||
        (log.userId ?? "").toLowerCase().includes(query)
      )
    })
  }, [logs, filters.status, filters.search])

  const insideCount = filteredLogs.filter((log) => !log.exitTime).length
  const summary = {
    totalEntries: filteredLogs.length,
    insideCount,
    exitedCount: filteredLogs.length - insideCount,
  }

  return (
    <>
      <Head>
        <title>Kiểm soát ra vào • Quản lý cư dân</title>
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
              <BreadcrumbPage>Kiểm soát ra vào</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Kiểm soát ra vào</h1>
            <p className="text-muted-foreground text-sm">
              Theo dõi hoạt động ra/vào theo thời gian thực.
            </p>
          </div>
          {hasVehicle && (
            <Button
              onClick={() => router.push("/vehicle-checkin-demo")}
              variant="default"
            >
              Mô phỏng ra/vào xe
            </Button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <AccessSummaryCards {...summary} />
          <AccessLiveClock />
        </div>

        <AccessControlTable
          logs={filteredLogs}
          filters={filters}
          onFiltersChange={setFilters}
          isLoading={isLoading}
        />
      </div>
    </>
  )
}

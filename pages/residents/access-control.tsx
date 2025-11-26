import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"
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
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [filters, setFilters] = useState<AccessFiltersState>({
    timeframe: "month",
    status: "all",
    search: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { role, userId } = useUserStore()
  const isAdmin = role === "admin"

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
        if (!isAdmin && userId) {
          queryParams.userId = userId
        }
        const response = await ofetch("/api/vehicles/checkin", {
          ignoreResponseError: true,
          query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        })
        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to load access logs")
        }
        const payload = (response.data as VehicleCheckinResponse).logs ?? []
        if (active) {
          setLogs(payload)
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load gate events")
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
  }, [filters.timeframe, isAdmin, userId])

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
        <title>Access Control • Resident Management</title>
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
              <BreadcrumbPage>Access Control</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Access control</h1>
          <p className="text-muted-foreground text-sm">
            Monitor real-time gate activity using vehicle logs stored in the database schema.
          </p>
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

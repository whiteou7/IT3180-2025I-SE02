import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import type { User } from "@/types/users"
import type { Document } from "@/pages/api/users/[id]/documents"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DocumentDashboard, DocumentEmptyState, CategorizedDocument } from "@/components/residents/document-management"
import { useUserStore } from "@/store/userStore"

export default function DocumentManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [documents, setDocuments] = useState<CategorizedDocument[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { role, userId } = useUserStore()
  const hasAllowedRole = role === "admin" || role === "police"

  useEffect(() => {
    let mounted = true
    const loadUsers = async () => {
      try {
        const response = await ofetch("/api/users", { ignoreResponseError: true })
        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to fetch residents")
        }
        let userList = response.data as User[]
        // Tenants can only see their own documents
        if (!hasAllowedRole) {
          userList = userList.filter((user) => user.userId === userId)
        }
        if (mounted) {
          setUsers(userList)
          // Auto-select current user for tenants
          setSelectedUserId((prev) => prev || userId || (userList[0]?.userId ?? ""))
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load residents")
      }
    }
    loadUsers()
    return () => {
      mounted = false
    }
  }, [hasAllowedRole, userId])

  useEffect(() => {
    if (!selectedUserId) return
    let mounted = true
    const loadDocuments = async () => {
      setIsLoading(true)
      try {
        const response = await ofetch(`/api/users/${selectedUserId}/documents`, {
          ignoreResponseError: true,
        })
        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to fetch documents")
        }
        const payload = (response.data as Document[]).map((doc, index) => ({
          ...doc,
          category: "other" as const,
          uploadedAt: new Date(Date.now() - index * 86400000).toLocaleDateString(),
          size: 120 + index * 10,
        }))
        if (mounted) {
          setDocuments(payload)
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to fetch documents")
        if (mounted) setDocuments([])
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadDocuments()
    return () => {
      mounted = false
    }
  }, [selectedUserId, refreshKey])

  const currentUser = useMemo(
    () => users.find((user) => user.userId === selectedUserId),
    [users, selectedUserId]
  )

  return (
    <>
      <Head>
        <title>Document Management • Resident Management</title>
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
              <BreadcrumbPage>Document Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Document management</h1>
            <p className="text-muted-foreground text-sm">
              Centralize personal, apartment, and legal documents for residents.
            </p>
          </div>
          {hasAllowedRole && (
            <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={!users.length}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select resident" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {documents.length ? (
          <DocumentDashboard
            documents={documents}
            search={search}
            onSearchChange={setSearch}
            onRefresh={() => setRefreshKey((key) => key + 1)}
            isLoading={isLoading}
            userId={selectedUserId}
          />
        ) : (
          <DocumentEmptyState
            onUpload={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = ".pdf"
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return

                if (!file.name.toLowerCase().endsWith(".pdf")) {
                  toast.error("Only PDF files are allowed")
                  return
                }

                try {
                  const formData = new FormData()
                  formData.append("file", file)

                  const response = await ofetch(`/api/users/${selectedUserId}/documents/upload`, {
                    method: "POST",
                    body: formData,
                    ignoreResponseError: true,
                  })

                  if (!response?.success) {
                    throw new Error(response?.message ?? "Failed to upload document")
                  }

                  toast.success("Document uploaded successfully")
                  setRefreshKey((key) => key + 1)
                } catch (error) {
                  console.error(error)
                  toast.error("Failed to upload document")
                }
              }
              input.click()
            }}
          />
        )}

        {currentUser ? (
          <p className="text-muted-foreground text-xs">
            Showing storage usage for <strong>{currentUser.fullName}</strong>. Switch residents to manage other folders.
          </p>
        ) : null}
      </div>
    </>
  )
}

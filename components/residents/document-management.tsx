import * as React from "react"
import { useRef, useState } from "react"
import type { Document } from "@/pages/api/users/[id]/documents"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Folder, RefreshCcw, Upload, Download, Eye } from "lucide-react"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import type { DocumentCategory } from "@/types/enum"

export type CategorizedDocument = Document & {
  category: DocumentCategory
  uploadedAt?: string
  size?: number
}

type DocumentDashboardProps = {
  documents: CategorizedDocument[]
  search: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  isLoading?: boolean
  userId: string
}

export function DocumentDashboard({
  documents,
  search,
  onSearchChange,
  onRefresh,
  isLoading,
  userId,
}: DocumentDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const filteredDocuments = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    return documents.filter((doc) => {
      return !query || doc.name.toLowerCase().includes(query) || doc.path.toLowerCase().includes(query)
    })
  }, [documents, search])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await ofetch(`/api/users/${userId}/documents/upload`, {
        method: "POST",
        body: formData,
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Failed to upload document")
      }

      toast.success("Document uploaded successfully")
      onRefresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload document")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const totalDocuments = documents.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kho tài liệu</h2>
          <p className="text-muted-foreground text-sm">
            Lưu trữ giấy tờ cá nhân và giấy tờ căn hộ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isLoading} onClick={onRefresh}>
            <RefreshCcw className="mr-2 size-4" />
            Làm mới
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            disabled={isLoading || isUploading}
            onClick={handleUploadClick}
          >
            <Upload className="mr-2 size-4" />
            {isUploading ? "Đang tải lên..." : "Tải lên"}
          </Button>
        </div>
      </div>

      <Card className="border border-border/70 bg-muted/20">
        <CardHeader className="pb-2">
          <CardDescription>Tổng số tài liệu</CardDescription>
          <CardTitle className="text-3xl">{totalDocuments}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs">
          Danh sách tài liệu đã được đồng bộ.
        </CardContent>
      </Card>

      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Danh sách tài liệu</CardTitle>
          <CardDescription>
            Xem, tìm kiếm và tải xuống giấy tờ của cư dân.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tìm theo tên file..."
            value={search}
            disabled={isLoading}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <ScrollArea className="max-h-[480px] pr-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`doc-skeleton-${index}`}
                    className="h-16 animate-pulse rounded-lg bg-muted/30"
                  />
                ))}
              </div>
            ) : filteredDocuments.length ? (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <DocumentListItem key={doc.path} document={doc} userId={userId} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                Không tìm thấy tài liệu nào.
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentListItem({
  document: doc,
  userId,
}: {
  document: CategorizedDocument
  userId: string
}) {
  const handleDownload = () => {
    const url = `/api/users/${userId}/documents/${doc.name}`
    const link = window.document.createElement("a")
    link.href = url
    link.download = doc.name
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const handleView = () => {
    const url = `/api/users/${userId}/documents/${doc.name}`
    window.open(url, "_blank")
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/60 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <FileText className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">{doc.name}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{doc.path}</span>
            {doc.uploadedAt && <span>• {doc.uploadedAt}</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleView}>
          <Eye className="mr-2 size-4" />
          Xem
        </Button>
        <Button size="sm" onClick={handleDownload}>
          <Download className="mr-2 size-4" />
          Tải xuống
        </Button>
      </div>
    </div>
  )
}

type DocumentEmptyStateProps = {
  onUpload?: () => void
}

export function DocumentEmptyState({ onUpload }: DocumentEmptyStateProps) {
  return (
    <Card className="border border-dashed border-border/70 bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Folder className="size-5 text-primary" />
          Chưa có tài liệu
        </CardTitle>
        <CardDescription>
          Tải lên hợp đồng, giấy tờ tùy thân và giấy tờ căn hộ để lưu trữ và tra cứu khi cần.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onUpload}>
          <Upload className="mr-2 size-4" />
          Tải lên file đầu tiên
        </Button>
      </CardContent>
    </Card>
  )
}

import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Search } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useUserStore } from "@/store/userStore"
import type { Feedback } from "@/types/feedbacks"
import type { FeedbackStatus } from "@/types/enum"

const statusOptions: { label: string; value: FeedbackStatus | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Mở", value: "open" },
  { label: "Đang xử lý", value: "in_progress" },
  { label: "Đã giải quyết", value: "resolved" },
  { label: "Đã đóng", value: "closed" },
]

const statusLabels: Record<FeedbackStatus, string> = {
  open: "Mở",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
}

const statusColors: Record<FeedbackStatus, string> = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
}

export default function FeedbacksPage() {
  const { userId, role } = useUserStore()
  const isAdmin = role === "admin"
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [formData, setFormData] = useState({
    content: "",
    tags: "",
  })
  const [updateStatus, setUpdateStatus] = useState<FeedbackStatus>("open")

  const fetchFeedbacks = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const params: Record<string, string> = {
        userId,
        role,
      }
      if (selectedStatus !== "all") {
        params.status = selectedStatus
      }
      const response = await ofetch<{ success: boolean; data: Feedback[]; message?: string }>("/api/feedbacks", {
        query: params,
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tải phản hồi")
      }

      setFeedbacks(response.data)
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải phản hồi")
    } finally {
      setIsLoading(false)
    }
  }, [userId, role, selectedStatus])

  useEffect(() => {
    fetchFeedbacks()
  }, [fetchFeedbacks])

  const handleCreateFeedback = async () => {
    if (!userId) return
    if (!formData.content.trim()) {
      toast.error("Vui lòng điền nội dung phản hồi")
      return
    }

    setIsSubmitting(true)
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const response = await ofetch<{ success: boolean; data: Feedback; message?: string }>("/api/feedbacks", {
        method: "POST",
        body: {
          userId,
          content: formData.content,
          tags: tags.length > 0 ? tags : undefined,
        },
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tạo phản hồi")
      }

      toast.success("Gửi phản hồi thành công")
      setIsFormOpen(false)
      setFormData({ content: "", tags: "" })
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Gửi phản hồi thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setIsViewModalOpen(true)
  }

  const handleEditFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setFormData({
      content: feedback.content,
      tags: feedback.tags?.join(", ") || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return

    setIsSubmitting(true)
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const response = await ofetch<{ success: boolean; data: Feedback; message?: string }>(
        `/api/feedbacks/${selectedFeedback.feedbackId}`,
        {
          method: "PATCH",
          body: {
            tags: tags.length > 0 ? tags : [],
          },
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể cập nhật phản hồi")
      }

      toast.success("Cập nhật phản hồi thành công")
      setIsEditModalOpen(false)
      setSelectedFeedback(null)
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Cập nhật phản hồi thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedFeedback) return

    setIsSubmitting(true)
    try {
      const response = await ofetch<{ success: boolean; data: Feedback; message?: string }>(
        `/api/feedbacks/${selectedFeedback.feedbackId}`,
        {
          method: "PATCH",
          body: {
            status: updateStatus,
          },
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể cập nhật phản hồi")
      }

      toast.success("Cập nhật trạng thái phản hồi thành công")
      setIsUpdateDialogOpen(false)
      setSelectedFeedback(null)
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Cập nhật trạng thái phản hồi thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFeedback = async () => {
    if (!userId || !selectedFeedback) return

    setIsSubmitting(true)
    try {
      const response = await ofetch<{ success: boolean; message?: string }>(
        `/api/feedbacks/${selectedFeedback.feedbackId}`,
        {
          method: "DELETE",
          body: { userId },
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể xóa phản hồi")
      }

      toast.success("Xóa phản hồi thành công")
      setIsDeleteDialogOpen(false)
      setSelectedFeedback(null)
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Xóa phản hồi thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenUpdateDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setUpdateStatus(feedback.status)
    setIsUpdateDialogOpen(true)
  }

  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((feedback) => feedback.status === selectedStatus)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (feedback) =>
          feedback.content.toLowerCase().includes(query) ||
          feedback.fullName.toLowerCase().includes(query) ||
          feedback.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filtered = filtered.filter((feedback) => {
        const feedbackDate = new Date(feedback.createdAt)
        return feedbackDate >= start
      })
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((feedback) => {
        const feedbackDate = new Date(feedback.createdAt)
        return feedbackDate <= end
      })
    }

    return filtered
  }, [feedbacks, selectedStatus, searchQuery, startDate, endDate])

  return (
    <AuthGate isAuthenticated={!!userId}>
      <Head>
        <title>Phản hồi - Hệ thống Quản lý Chung cư</title>
      </Head>
      <div className="flex flex-col gap-6 p-6 pt-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/services/feedbacks">Dịch vụ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Phản hồi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Phản hồi</h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? "Quản lý tất cả phản hồi từ cư dân" : "Gửi và theo dõi phản hồi của bạn"}
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Gửi phản hồi
          </Button>
        </div>

        <div className="w-full md:w-1/2"> {/* Half width */}
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm phản hồi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as FeedbackStatus | "all")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Từ ngày</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Đến ngày</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Đang tải phản hồi...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Không tìm thấy phản hồi</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phản hồi</TableHead>
                  <TableHead>Nội dung</TableHead>
                  {isAdmin && <TableHead>Tác giả</TableHead>}
                  <TableHead>Thẻ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.map((feedback) => (
                  <TableRow
                    key={feedback.feedbackId}
                    className="cursor-pointer"
                    onClick={() => handleViewFeedback(feedback)}
                  >
                    <TableCell className="font-mono text-xs">{feedback.feedbackId.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{feedback.content}</div>
                    </TableCell>
                    {isAdmin && <TableCell>{feedback.fullName}</TableCell>}
                    <TableCell>
                      {feedback.tags && feedback.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {feedback.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[feedback.status]} text-white`} variant="secondary">
                        {statusLabels[feedback.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {feedback.userId === userId && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFeedback(feedback)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFeedback(feedback)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdateDialog(feedback)}
                          >
                            Cập nhật trạng thái
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Form Dialog */}
        <Dialog open={isFormOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false)
            setIsEditModalOpen(false)
            setFormData({ content: "", tags: "" })
          }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditModalOpen ? "Chỉnh sửa Phản hồi" : "Gửi Phản hồi"}</DialogTitle>
              <DialogDescription>
                {isEditModalOpen ? "Cập nhật phản hồi của bạn" : "Chia sẻ phản hồi của bạn với ban quản lý tòa nhà"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content">Nội dung Phản hồi</Label>
                <Textarea
                  id="content"
                  placeholder="Mô tả phản hồi, đề xuất hoặc mối quan tâm của bạn..."
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Thẻ (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="tags"
                  placeholder="ví dụ: bảo trì, thanh toán, an ninh"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false)
                  setIsEditModalOpen(false)
                  setFormData({ content: "", tags: "" })
                }}
              >
                Hủy
              </Button>
              <Button onClick={isEditModalOpen ? handleUpdateFeedback : handleCreateFeedback} disabled={isSubmitting}>
                {isSubmitting ? (isEditModalOpen ? "Đang cập nhật..." : "Đang gửi...") : (isEditModalOpen ? "Cập nhật" : "Gửi")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Feedback Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle>Chi tiết Phản hồi</DialogTitle>
                  <DialogDescription className="mt-2">
                    bởi {selectedFeedback?.fullName} • {selectedFeedback && new Date(selectedFeedback.createdAt).toLocaleString()}
                  </DialogDescription>
                </div>
                {selectedFeedback && (
                  <Badge
                    className={`${statusColors[selectedFeedback.status]} text-white ml-2`}
                    variant="secondary"
                  >
                    {statusLabels[selectedFeedback.status]}
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Mã phản hồi</Label>
                <p className="font-mono text-sm">{selectedFeedback?.feedbackId}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nội dung</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedFeedback?.content}</p>
              </div>
              {selectedFeedback?.tags && selectedFeedback.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Thẻ</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFeedback.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {selectedFeedback?.userId === userId && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleEditFeedback(selectedFeedback!)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewModalOpen(false)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog (Admin only) */}
        {isAdmin && (
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cập nhật Trạng thái Phản hồi</DialogTitle>
                <DialogDescription>Thay đổi trạng thái của phản hồi này</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {selectedFeedback && (
                  <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground mb-2">Mã phản hồi: {selectedFeedback.feedbackId}</p>
                    <p className="text-sm">{selectedFeedback.content}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={updateStatus}
                    onValueChange={(value) => setUpdateStatus(value as FeedbackStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter((opt) => opt.value !== "all").map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn phản hồi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFeedback} disabled={isSubmitting}>
                {isSubmitting ? "Đang xóa..." : "Xóa"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGate>
  )
}

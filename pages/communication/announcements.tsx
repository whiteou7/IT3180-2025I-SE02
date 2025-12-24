import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import ReactMarkdown from "react-markdown"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import type { Post } from "@/types/posts"
import type { PostCategory } from "@/types/enum"

const categoryOptions: { label: string; value: PostCategory | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Phí & hóa đơn", value: "fees_billing" },
  { label: "Bảo trì", value: "maintenance" },
  { label: "Sự cố tòa nhà", value: "building_issues" },
  { label: "Chung", value: "general" },
]

const categoryLabels: Record<PostCategory, string> = {
  fees_billing: "Phí & hóa đơn",
  maintenance: "Bảo trì",
  building_issues: "Sự cố tòa nhà",
  general: "Chung",
}

const categoryColors: Record<PostCategory, string> = {
  fees_billing: "bg-blue-500",
  maintenance: "bg-yellow-500",
  building_issues: "bg-red-500",
  general: "bg-gray-500",
}

export default function AnnouncementsPage() {
  const { userId } = useUserStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general" as PostCategory,
  })

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = selectedCategory !== "all" ? { category: selectedCategory } : {}
      const response = await ofetch<{ success: boolean; data: Post[]; message?: string }>("/api/posts", {
        query: params,
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tải thông báo")
      }

      setPosts(response.data)
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải thông báo")
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleCreateAnnouncement = async () => {
    if (!userId) return
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await ofetch<{ success: boolean; data: Post; message?: string }>("/api/posts", {
        method: "POST",
        body: {
          userId,
          title: formData.title,
          content: formData.content,
          category: formData.category,
        },
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tạo thông báo")
      }

      toast.success("Tạo thông báo thành công")
      setIsFormOpen(false)
      setFormData({ title: "", content: "", category: "general" })
      await fetchPosts()
    } catch (error) {
      console.error(error)
      toast.error("Không thể tạo thông báo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setIsViewModalOpen(true)
  }

  const handleEditPost = (post: Post) => {
    setSelectedPost(post)
    setFormData({
      title: post.title || "",
      content: post.content,
      category: post.category || "general",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdatePost = async () => {
    if (!userId || !selectedPost) return
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await ofetch<{ success: boolean; data: Post; message?: string }>(
        `/api/posts/${selectedPost.postId}`,
        {
          method: "PATCH",
          body: {
            userId,
            title: formData.title,
            content: formData.content,
            category: formData.category,
          },
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể cập nhật thông báo")
      }

      toast.success("Cập nhật thông báo thành công")
      setIsEditModalOpen(false)
      setSelectedPost(null)
      await fetchPosts()
    } catch (error) {
      console.error(error)
      toast.error("Không thể cập nhật thông báo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!userId || !selectedPost) return

    setIsSubmitting(true)
    try {
      const response = await ofetch<{ success: boolean; message?: string }>(
        `/api/posts/${selectedPost.postId}`,
        {
          method: "DELETE",
          body: { userId },
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể xóa thông báo")
      }

      toast.success("Xóa thông báo thành công")
      setIsDeleteDialogOpen(false)
      setSelectedPost(null)
      await fetchPosts()
    } catch (error) {
      console.error(error)
      toast.error("Không thể xóa thông báo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.fullName.toLowerCase().includes(query)
      )
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.createdAt)
        return postDate >= start
      })
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.createdAt)
        return postDate <= end
      })
    }

    return filtered
  }, [posts, selectedCategory, searchQuery, startDate, endDate])

  return (
    <AuthGate isAuthenticated={!!userId}>
      <Head>
        <title>Thông báo công khai • Quản lý chung cư</title>
      </Head>
      <div className="flex flex-col gap-6 p-6 pt-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/communication/announcements">Giao tiếp</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Thông báo công khai</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Thông báo công khai</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Xem và tạo thông báo cho cư dân</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Tạo thông báo
          </Button>
        </div>

        <div className="w-full md:w-1/2 md:mr-auto">
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                <div className="mt-5 relative w-full md:w-1/2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm thông báo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2 sm:gap-4 w-full md:w-auto">
                  <div className="flex flex-col space-y-1 flex-1 md:flex-initial">
                    <Label className="text-xs">Từ ngày</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1 flex-1 md:flex-initial">
                    <Label className="text-xs">Đến ngày</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as PostCategory | "all")}>
          <TabsList className="w-full overflow-x-auto flex-nowrap sm:w-auto">
            {categoryOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value} className="whitespace-nowrap">
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Đang tải thông báo...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Chủ đề</TableHead>
                      <TableHead>Người đăng</TableHead>
                      <TableHead>Ngày</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow
                        key={post.postId}
                        className="cursor-pointer"
                        onClick={() => handleViewPost(post)}
                      >
                        <TableCell className="font-medium">{post.title || "Không có tiêu đề"}</TableCell>
                        <TableCell>
                          {post.category && (
                            <Badge
                              className={`${categoryColors[post.category]} text-white`}
                              variant="secondary"
                            >
                              {categoryLabels[post.category]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{post.fullName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Form Dialog */}
        <Dialog open={isFormOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false)
            setIsEditModalOpen(false)
            setFormData({ title: "", content: "", category: "general" })
          }
        }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditModalOpen ? "Sửa thông báo" : "Tạo thông báo"}</DialogTitle>
              <DialogDescription>
                {isEditModalOpen ? "Cập nhật nội dung thông báo" : "Đăng thông báo cho cư dân"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề thông báo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Chủ đề</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as PostCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.filter((opt) => opt.value !== "all").map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  placeholder="Nhập nội dung thông báo..."
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false)
                  setIsEditModalOpen(false)
                  setFormData({ title: "", content: "", category: "general" })
                }}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button 
                onClick={isEditModalOpen ? handleUpdatePost : handleCreateAnnouncement} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting
                  ? isEditModalOpen
                    ? "Đang cập nhật..."
                    : "Đang đăng..."
                  : isEditModalOpen
                    ? "Cập nhật"
                    : "Đăng"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Post Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl break-words">{selectedPost?.title || "Không có tiêu đề"}</DialogTitle>
                  <DialogDescription className="mt-2 text-sm">
                    bởi {selectedPost?.fullName} • {selectedPost && new Date(selectedPost.createdAt).toLocaleString()}
                  </DialogDescription>
                </div>
                {selectedPost?.category && (
                  <Badge
                    className={`${categoryColors[selectedPost.category]} text-white shrink-0`}
                    variant="secondary"
                  >
                    {categoryLabels[selectedPost.category]}
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
              <ReactMarkdown>{selectedPost?.content || ""}</ReactMarkdown>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              {selectedPost?.userId === userId && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false)
                      handleEditPost(selectedPost!)
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewModalOpen(false)
                      setIsDeleteDialogOpen(true)
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                onClick={() => setIsViewModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Thông báo sẽ bị xóa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="w-full sm:w-auto">Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePost} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Đang xóa..." : "Xóa"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGate>
  )
}

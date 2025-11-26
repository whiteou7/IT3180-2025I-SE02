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
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
]

const statusLabels: Record<FeedbackStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
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
        throw new Error(response?.message ?? "Unable to load feedbacks")
      }

      setFeedbacks(response.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load feedbacks")
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
      toast.error("Please fill in the feedback content")
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
        throw new Error(response?.message ?? "Unable to create feedback")
      }

      toast.success("Feedback submitted successfully")
      setIsFormOpen(false)
      setFormData({ content: "", tags: "" })
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Failed to submit feedback")
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
        throw new Error(response?.message ?? "Unable to update feedback")
      }

      toast.success("Feedback updated successfully")
      setIsEditModalOpen(false)
      setSelectedFeedback(null)
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update feedback")
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
        throw new Error(response?.message ?? "Unable to update feedback")
      }

      toast.success("Feedback status updated successfully")
      setIsUpdateDialogOpen(false)
      setSelectedFeedback(null)
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update feedback status")
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
        throw new Error(response?.message ?? "Unable to delete feedback")
      }

      toast.success("Feedback deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedFeedback(null)
      await fetchFeedbacks()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete feedback")
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
        <title>Feedback - Apartment Management System</title>
      </Head>
      <div className="flex flex-col gap-6 p-6 pt-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/notifications/feedbacks">Notifications</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Feedback</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Feedback</h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? "Manage all feedbacks from residents" : "Submit and track your feedback"}
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Feedback
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
                      placeholder="Search feedbacks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as FeedbackStatus | "all")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
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
                    <Label className="text-xs">From Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">To Date</Label>
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
            <p className="text-muted-foreground">Loading feedbacks...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No feedbacks found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feedback ID</TableHead>
                  <TableHead>Content</TableHead>
                  {isAdmin && <TableHead>Author</TableHead>}
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
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
                            Update Status
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
              <DialogTitle>{isEditModalOpen ? "Edit Feedback" : "Submit Feedback"}</DialogTitle>
              <DialogDescription>
                {isEditModalOpen ? "Update your feedback" : "Share your feedback with building management"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content">Feedback Content</Label>
                <Textarea
                  id="content"
                  placeholder="Describe your feedback, suggestion, or concern..."
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., maintenance, billing, security"
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
                Cancel
              </Button>
              <Button onClick={isEditModalOpen ? handleUpdateFeedback : handleCreateFeedback} disabled={isSubmitting}>
                {isSubmitting ? (isEditModalOpen ? "Updating..." : "Submitting...") : (isEditModalOpen ? "Update" : "Submit")}
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
                  <DialogTitle>Feedback Details</DialogTitle>
                  <DialogDescription className="mt-2">
                    by {selectedFeedback?.fullName} • {selectedFeedback && new Date(selectedFeedback.createdAt).toLocaleString()}
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
                <Label className="text-xs text-muted-foreground">Feedback ID</Label>
                <p className="font-mono text-sm">{selectedFeedback?.feedbackId}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Content</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedFeedback?.content}</p>
              </div>
              {selectedFeedback?.tags && selectedFeedback.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
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
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewModalOpen(false)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog (Admin only) */}
        {isAdmin && (
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Feedback Status</DialogTitle>
                <DialogDescription>Change the status of this feedback</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {selectedFeedback && (
                  <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground mb-2">Feedback ID: {selectedFeedback.feedbackId}</p>
                    <p className="text-sm">{selectedFeedback.content}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={updateStatus}
                    onValueChange={(value) => setUpdateStatus(value as FeedbackStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the feedback.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFeedback} disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGate>
  )
}

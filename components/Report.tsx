import * as React from "react"
import { Card, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PropertyReport } from "@/types/reports"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import ReactMarkdown from "react-markdown"
import { ChevronsUpDown } from "lucide-react"
import { ofetch } from "ofetch"
import { toast } from "sonner"

export function Report({
  propertyReportId,
  content,
  propertyId,
  status,
  createdAt,
  userFullName,
  propertyName,
  issuerFullName,
  userId,
  issuerId,
}: PropertyReport) {
  const [loading, setLoading] = React.useState(false)
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const uid = localStorage.getItem("userId")
    setCurrentUserId(uid)
  }, [])

  const handleApprove = async () => {
    if (!propertyReportId) return
    setLoading(true)
    try {
      const payload = await ofetch(`/api/property-reports/${propertyReportId}`, {
        method: "PATCH",
        body: { approved: true, issuerId: currentUserId ?? issuerId ?? null },
        ignoreResponseError: true,
      })

      if (payload?.success) {
        toast.success(payload.message ?? "Report approved")
        window.location.reload()
      } else {
        toast.error(payload?.message ?? "Failed to approve")
      }
    } catch (err: unknown) {
      toast.error(String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!propertyReportId) return
    if (!confirm("Delete this report? This action cannot be undone.")) return
    setLoading(true)
    try {
      const payload = await ofetch(`/api/property-reports/${propertyReportId}`, {
        method: "DELETE",
        ignoreResponseError: true,
      })

      if (payload?.success) {
        toast.success(payload.message ?? "Report deleted")
        window.location.reload()
      } else {
        toast.error(payload?.message ?? "Failed to delete")
      }
    } catch (err: unknown) {
      toast.error(String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleIssueStatus = async () => {
    if (!propertyReportId) return
    const newStatus = prompt("Enter new status for this report (e.g., found, not found):", status ?? "")
    if (newStatus == null) return
    setLoading(true)
    try {
      const payload = await ofetch(`/api/property-reports/${propertyReportId}`, {
        method: "PATCH",
        body: { status: newStatus, issuerId: currentUserId ?? issuerId ?? null },
        ignoreResponseError: true,
      })

      if (payload?.success) {
        toast.success(payload.message ?? "Report status updated")
        window.location.reload()
      } else {
        toast.error(payload?.message ?? "Failed to update status")
      }
    } catch (err: unknown) {
      toast.error(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">

      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{userFullName?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Missing property &quot;{propertyName} #{propertyId}&quot; by {userFullName ?? "Unknown"}</Label>
                <Badge variant={status === "found" ? "default" : "secondary"}>{status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">#{propertyReportId?.slice(0, 8)}</div>
        </div>
      </CardHeader>

      <CardFooter>
        <div className="flex w-full justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">Details</Button>
            </DialogTrigger>

            <DialogContent className="max-w-[50%]">
              <DialogHeader>
                <DialogTitle>View Report Detail</DialogTitle>
              </DialogHeader>

              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <div className="mb-2 text-sm font-medium">Report Content</div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <ChevronsUpDown />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {content ?? "-"}
                    </ReactMarkdown>
                  </div>
                  <hr className="my-4 border-t border-gray-300 dark:border-gray-600" />
                </CollapsibleContent>
              </Collapsible>

              {issuerFullName && (
                <div>
                  <Collapsible defaultOpen>
                    <div className="flex items-center justify-between">
                      <div className="mb-2 text-sm font-medium">Issuer</div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <ChevronsUpDown />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">Issued by - {issuerFullName}</div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              <div className="mt-4 flex gap-2 justify-end">
                {currentUserId && currentUserId === userId ? (
                  <>
                    {issuerFullName && (
                      <Button variant="outline" size="sm" onClick={handleApprove} disabled={loading}>
                        Approve
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleIssueStatus} disabled={loading}>
                    Issue status
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}

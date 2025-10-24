import * as React from "react"
import { Card, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PropertyReport } from "@/types/reports"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import ReactMarkdown from "react-markdown"

export function Report({ propertyReportId, userId, content, propertyId, status, createdAt, issuerId, userFullName, issuerFullName, propertyName }: PropertyReport) {
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
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {content ?? "-"}
                </ReactMarkdown>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}

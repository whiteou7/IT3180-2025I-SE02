import * as React from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PropertyReport } from "@/types/reports"

export function Report({ propertyReportId, userId, propertyId, status, createdAt, issuerId, userFullName, issuerFullName, propertyName }: PropertyReport) {
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
                <Label className="text-sm">Report by {userFullName ?? "Unknown"}</Label>
                <Badge variant={status === "found" ? "default" : "secondary"}>{status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">#{propertyReportId?.slice(0, 8)}</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm">Property {propertyName} #{propertyId ?? "—"}</div>
        {issuerFullName ? <div className="text-sm">Issuer: {issuerFullName}</div> : null}
      </CardContent>

      <CardFooter>
        <div className="flex w-full justify-end">
          <Button variant="ghost" size="sm">Details</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

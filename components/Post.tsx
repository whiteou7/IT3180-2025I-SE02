import * as React from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Post } from "@/types/posts"
import ReactMarkdown from "react-markdown"

export function Post({ postId, userId, fullName, content, createdAt }: Post) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{fullName?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">{fullName}</Label>
                <Badge variant="outline">Post</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">#{postId?.slice(0, 8)}</div>
        </div>
      </CardHeader>

      <CardContent className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </CardContent>

      <CardFooter>
        <div className="flex w-full justify-end">
          <Button variant="ghost" size="sm">View</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

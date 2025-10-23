"use client"

import * as React from "react"
import { useEffect, useState } from "react"
// use global fetch (browser) to avoid external dependency issues
import type { APIBody } from "@/types/api"
import { Post as PostComponent } from "@/components/Post"
import { Report } from "@/components/Report"
import { Spinner } from "@/components/ui/spinner"
import { Post } from "@/types/posts"
import { PropertyReport } from "@/types/reports"

type FeedItem = {
  type: "post" | "report"
  id: string
  createdAt: string
  data: Post | PropertyReport
}

export function Feed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        const [postsResp, reportsResp] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/property-reports"),
        ])

        if (!mounted) return

        const postsRes = (await postsResp.json()) as APIBody<Post[]>
        const reportsRes = (await reportsResp.json()) as APIBody<PropertyReport[]>

        if (!postsRes.success) throw new Error(postsRes.message)
        if (!reportsRes.success) throw new Error(reportsRes.message)

        const posts: FeedItem[] = (postsRes.data as Post[]).map((p: Post) => ({ type: "post", id: p.postId, createdAt: p.createdAt, data: p }))
        const reports: FeedItem[] = (reportsRes.data as PropertyReport[]).map((r: PropertyReport) => ({ type: "report", id: r.propertyReportId, createdAt: r.createdAt, data: r }))

        const merged = [...posts, ...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setItems(merged)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="flex items-center justify-center p-6"><Spinner /></div>
  if (error) return <div className="p-6 text-destructive">Error: {error}</div>

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id}>
          {item.type === "post" ? (
            <PostComponent {...(item.data as Post)} />
          ) : (
            <Report {...(item.data as PropertyReport)} />
          )}
        </div>
      ))}
    </div>
  )
}

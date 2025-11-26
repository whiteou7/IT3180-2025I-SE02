import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Post } from "@/types/posts"
import type { PostCategory } from "@/types/enum"

function parsePostId(idParam: string | string[] | undefined): string | null {
  if (!idParam) return null
  if (typeof idParam === "string") return idParam
  if (Array.isArray(idParam) && idParam.length > 0) return idParam[0]
  return null
}

/**
 * GET /api/posts/[id] - Get a specific post
 * PATCH /api/posts/[id] - Update a post (only by owner)
 * DELETE /api/posts/[id] - Delete a post (only by owner)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Post | null>>
) {
  try {
    const postId = parsePostId(req.query.id)

    if (!postId) {
      return res.status(400).json({ success: false, message: "Post ID is required" })
    }

    if (req.method === "GET") {
      const [post] = await db<Post[]>`
        SELECT post_id, p.user_id, content, created_at, full_name, category, title
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE post_id = ${postId}
        LIMIT 1;
      `

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" })
      }

      return res.status(200).json({ success: true, message: "Post fetched successfully", data: post })
    } else if (req.method === "PATCH") {
      const { userId, title, content, category } = req.body as {
        userId: string;
        title?: string;
        content?: string;
        category?: PostCategory;
      }

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" })
      }

      // Check if post exists and user owns it
      const [existing] = await db<{ userId: string }[]>`
        SELECT user_id FROM posts WHERE post_id = ${postId} LIMIT 1;
      `

      if (!existing) {
        return res.status(404).json({ success: false, message: "Post not found" })
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ success: false, message: "You can only edit your own posts" })
      }

      // Build update query - update all provided fields
      // Use COALESCE to only update fields that are provided (non-null)
      await db`
        UPDATE posts 
        SET 
          title = COALESCE(${title ?? null}, title),
          content = COALESCE(${content ?? null}, content),
          category = COALESCE(${category ?? null}, category)
        WHERE post_id = ${postId}
      `

      // Fetch updated post
      const [updated] = await db<Post[]>`
        SELECT post_id, p.user_id, content, created_at, full_name, category, title
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE post_id = ${postId}
        LIMIT 1;
      `

      return res.status(200).json({ success: true, message: "Post updated successfully", data: updated })
    } else if (req.method === "DELETE") {
      const { userId } = req.body as {
        userId: string;
      }

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" })
      }

      // Check if post exists and user owns it
      const [existing] = await db<{ userId: string }[]>`
        SELECT user_id FROM posts WHERE post_id = ${postId} LIMIT 1;
      `

      if (!existing) {
        return res.status(404).json({ success: false, message: "Post not found" })
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ success: false, message: "You can only delete your own posts" })
      }

      await db`DELETE FROM posts WHERE post_id = ${postId}`

      return res.status(200).json({ success: true, message: "Post deleted successfully", data: null })
    } else {
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("Error in /api/posts/[id]:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}


import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Post } from "@/types/posts"
import type { PostCategory } from "@/types/enum"

/**
 * GET /api/posts - Retrieve all posts with user information
 * POST /api/posts - Create a new post
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Post[] | Post>>
) {
  try {
    if (req.method === "GET") {
      const categoryFilter = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category
      
      let posts: Post[]
      
      if (categoryFilter && categoryFilter !== "all") {
        posts = await db<Post[]>`
          SELECT post_id, p.user_id, content, created_at, full_name, category, title
          FROM 
            posts p
          JOIN
            users u
          ON
            p.user_id = u.user_id
          WHERE category = ${categoryFilter}
          ORDER BY created_at DESC;
        `
      } else {
        posts = await db<Post[]>`
          SELECT post_id, p.user_id, content, created_at, full_name, category, title
          FROM 
            posts p
          JOIN
            users u
          ON
            p.user_id = u.user_id
          ORDER BY created_at DESC;
        `
      }

      return res.status(200).json({ success: true, message: "Posts fetched successfully", data: posts })
    } else if (req.method === "POST") {
      const { content, userId, category, title } = req.body as {
        content: string;
        userId: string;
        category?: PostCategory;
        title?: string;
      }

      if (!content || typeof content !== "string") {
        return res.status(400).json({ success: false, message: "`content` is required and must be a string" })
      }

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, message: "`userId` is required and must be a string" })
      }

      // Insert post
      const [row] = await db<{ postId: string }[]>`
        INSERT INTO posts (user_id, content, category, title)
        VALUES (${userId}, ${content}, ${category ?? "general"}, ${title ?? null})
        RETURNING post_id
      `

      // fetch the created post joined with user to return full_name
      const [created] = await db<Post[]>`
        SELECT post_id, p.user_id, content, created_at, full_name, category, title
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE post_id = ${row.postId}
        LIMIT 1;
      `

      return res.status(201).json({ success: true, message: "Post created", data: created })
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("Error in /api/posts:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

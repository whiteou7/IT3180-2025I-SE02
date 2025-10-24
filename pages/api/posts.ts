import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Post } from "@/types/posts"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Post[]>>
) {
  try {
    if (req.method === "GET") {
      const posts = await db<Post[]>`
        SELECT post_id, p.user_id, content, created_at, full_name
        FROM 
          posts p
        JOIN
          users u
        ON
          p.user_id = u.user_id
        ORDER BY created_at DESC;
      `

      return res.status(200).json({ success: true, message: "Posts fetched successfully", data: posts })
    } else if (req.method === "POST") {
      // create a new post
      const { content, userId } = req.body as { content?: string; userId?: string }

      if (!content || typeof content !== "string") {
        return res.status(400).json({ success: false, message: "`content` is required and must be a string" })
      }

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, message: "`userId` is required and must be a string" })
      }

      // Insert post
      const [row] = await db<{ postId: string }[]>`
        INSERT INTO posts (user_id, content)
        VALUES (${userId}, ${content})
        RETURNING post_id
      `

      // fetch the created post joined with user to return full_name
      const created = await db<Post[]>
      `
        SELECT post_id, p.user_id, content, created_at, full_name
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

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
    } else {
      res.setHeader("Allow", ["GET"])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("Error in /api/posts:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

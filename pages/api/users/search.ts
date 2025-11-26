import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { User } from "@/types/users"

/**
 * GET /api/users/search - Search users by name
 * Query params: q (search query)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<User[]>>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }

  try {
    const { q, userId } = req.query

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query 'q' is required",
      })
    }

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      })
    }

    // Search users by name (case-insensitive)
    const users = await db<User[]>`
      SELECT 
        user_id,
        email,
        full_name,
        role,
        year_of_birth,
        gender,
        phone_number,
        apartment_id
      FROM users
      WHERE LOWER(full_name) LIKE LOWER(${`%${q}%`})
        AND user_id != ${userId}
      ORDER BY full_name
      LIMIT 20
    `

    return res.status(200).json({
      success: true,
      message: "Users found",
      data: users,
    })
  } catch (error) {
    console.error("Error in /api/users/search:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

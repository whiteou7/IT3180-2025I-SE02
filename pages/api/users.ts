import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db" 
import type { User } from "@/types/users"
import { APIBody } from "@/types/api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<User[]>>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const users = await db<User[]>`
      SELECT 
        user_id, 
        email, 
        full_name, 
        role,
        year_of_birth
      FROM users;
    `

    return res.status(200).json({
      success: true,
      message: "User list fetched successfully.",
      data: users
    })

  } catch (error) {
    console.error("Error fetching user list:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}
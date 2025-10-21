
import { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import { User } from "@/types/users"
import { APIBody } from "@/types/api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<User>>
) {
  try {
    const { id: userId } = req.query
    if (req.method === "PATCH") {
      const { email, fullName, role, yearOfBirth } = req.body

      if (!userId) {
        return res.status(400).json({
          success: false, 
          message: "User ID is required" 
        })
      }
      const updatedUser = await db<User[]>`
          UPDATE users
          SET
            email = ${email},
            full_name = ${fullName},
            role = ${role},
            year_of_birth = ${yearOfBirth}
          WHERE user_id = ${userId}
          RETURNING 
            email,
            full_name,
            role,
            year_of_birth;
        `

      if (updatedUser.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        })
      }

      res.status(200).json({
        success: true,
        message: "Updated user info",
        data: updatedUser[0]
      })
    }
  } catch (error) {
    console.error("Error updating user info:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

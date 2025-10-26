
import { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import { User } from "@/types/users"
import { APIBody } from "@/types/api"

/**
 * PUT /api/users/[id] - Update user information
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<User>>
) {
  try {
    const { id: userId } = req.query
    if (req.method === "PUT") {
      const { email, fullName, role, yearOfBirth, gender } = req.body as {
        email: string;
        fullName: string;
        role: "tenant" | "admin";
        yearOfBirth: number;
        gender: "male" | "female";
      }

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
            year_of_birth = ${yearOfBirth},
            gender = ${gender}
          WHERE user_id = ${userId}
          RETURNING 
            email,
            full_name,
            role,
            year_of_birth,
            gender;
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
    } else {
      res.setHeader("Allow", ["PUT"])
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`,
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

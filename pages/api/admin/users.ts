import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"
import { db } from "@/db" 
import type { APIBody } from "@/types/api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<string>>
) {
  try {
    if (req.method == "POST") {
      const body = req.body
      const { email, fullName, password } = body

      // Validate inputs
      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          message: "Full name, password and email must be included",
        })
      }

      // Check if email already exists
      const [existingUser] = await db`
        SELECT u.user_id FROM users u WHERE u.email = ${email};
      `

      if (existingUser?.user_id) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        })
      }

      // Prepare hashed password and UUID
      const hashedPassword = await bcrypt.hash(password, 10)
      const userId = crypto.randomUUID()

      // Insert new user
      await db`
        INSERT INTO users (user_id, email, full_name, password)
        VALUES (${userId}, ${email}, ${fullName}, ${hashedPassword});
      `

      return res.status(201).json({
        success: true,
        data: userId,
        message: "Account created successfully",
      })
    }
  } catch (error) {
    console.error("Error registering:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

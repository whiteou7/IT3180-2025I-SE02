import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { User } from "@/types/users"
import type { UserRole, Gender } from "@/types/enum"

/**
 * POST /api/users - Create a new user account
 * GET /api/users - Retrieve all users (admin only)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | APIBody<{ userId: string }> // For POST 
    | APIBody<User[]> // For GET
  >
) {
  try {
    if (req.method === "POST") {
      const { email, fullName, password, role, yearOfBirth, gender, phoneNumber } = req.body as {
        email: string;
        fullName: string;
        password: string;
        role?: UserRole;
        yearOfBirth?: number;
        gender?: Gender;
        phoneNumber?: string;
      }

      // Validate required fields
      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          message: "Full name, password, and email must be included.",
        })
      }

      // Check for existing user
      const [existingUser] = await db`
        SELECT user_id FROM users WHERE email = ${email};
      `

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered.",
        })
      }

      // Create hashed password and user ID
      const hashedPassword = await bcrypt.hash(password, 10)
      const userId = crypto.randomUUID()

      // Insert new user
      await db`
        INSERT INTO users (user_id, email, full_name, password, role, year_of_birth, gender, phone_number)
        VALUES (${userId}, ${email}, ${fullName}, ${hashedPassword}, ${role ?? "tenant" as const}, ${yearOfBirth ?? null}, ${gender ?? null}, ${phoneNumber ?? null});
      `

      return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        data: { userId },
      })
    }

    if (req.method === "GET") {
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
        FROM users;
      `

      return res.status(200).json({
        success: true,
        message: "User list fetched successfully.",
        data: users,
      })
    }

    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed.`,
    })
  } catch (error) {
    console.error("Error in /api/users:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

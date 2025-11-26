import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"

import { db } from "@/db"
import type { APIBody } from "@/types/api"

/**
 * POST /api/auth/reset-password - Reset user password
 * Requires matching email and phone number
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ success: boolean }>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed.`,
    })
  }

  try {
    const { email, phoneNumber, newPassword } = req.body as {
      email?: string
      phoneNumber?: string
      newPassword?: string
    }

    if (!email || !phoneNumber || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, phone number, and new password are required.",
      })
    }

    // Find user with matching email and phone number
    const [user] = await db<{ userId: string; phoneNumber: string | null }[]>`
      SELECT user_id, phone_number
      FROM users
      WHERE email = ${email};
    `

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email address.",
      })
    }

    // Verify phone number matches
    if (user.phoneNumber !== phoneNumber) {
      return res.status(401).json({
        success: false,
        message: "Email and phone number do not match.",
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await db`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE user_id = ${user.userId};
    `

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      data: { success: true },
    })
  } catch (error) {
    console.error("Error in /api/auth/reset-password:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"

import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { validateEmail, validatePhoneNumber, validateString } from "@/lib/validation"

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
      message: `Phương thức ${req.method} không được phép.`,
    })
  }

  try {
    const { email, phoneNumber, newPassword } = req.body as {
      email?: string
      phoneNumber?: string
      newPassword?: string
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      })
    }

    const phoneValidation = validatePhoneNumber(phoneNumber)
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: phoneValidation.message,
      })
    }

    const passwordValidation = validateString(newPassword, "Mật khẩu mới")
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      })
    }

    // Find user with matching email and phone number
    const [user] = await db<{ userId: string; phoneNumber: string | null }[]>`
      SELECT user_id, phone_number
      FROM users
      WHERE email = ${email ?? ""};
    `

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với địa chỉ email đó.",
      })
    }

    // Verify phone number matches
    if (user.phoneNumber !== phoneNumber) {
      return res.status(401).json({
        success: false,
        message: "Email và số điện thoại không khớp.",
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword ?? "", 10)

    // Update password
    await db`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE user_id = ${user.userId};
    `

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công.",
      data: { success: true },
    })
  } catch (error) {
    console.error("Error in /api/auth/reset-password:", error)
    return res.status(500).json({
      success: false,
      message: "Đặt lại mật khẩu thất bại.",
    })
  }
}

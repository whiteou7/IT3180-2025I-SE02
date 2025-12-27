import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"

import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { UserRole } from "@/types/enum"
import { validateEmail, validateString } from "@/lib/validation"

type LoginSuccess = {
  userId: string
  role: UserRole
  fullName: string
}

/**
 * POST /api/auth/login - Authenticate user with email and password
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<LoginSuccess>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép.`,
    })
  }

  try {
    const { email, password } = req.body as {
      email?: string
      password?: string
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      })
    }

    const passwordValidation = validateString(password, "Mật khẩu")
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      })
    }

    const [user] = await db<
      { userId: string; role: UserRole; password: string, fullName: string }[]
    >`
      SELECT user_id, role, password, full_name
      FROM users
      WHERE email = ${email ?? ""};
    `

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng.",
      })
    }

    const passwordMatches = await bcrypt.compare(password ?? "", user.password)

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng.",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        userId: user.userId,
        role: user.role,
        fullName: user.fullName,
      },
    })
  } catch (error) {
    console.error("Error in /api/auth/login:", error)
    return res.status(500).json({
      success: false,
      message: "Đăng nhập thất bại.",
    })
  }
}

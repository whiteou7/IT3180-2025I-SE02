import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"

import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { UserRole } from "@/types/enum"

type LoginSuccess = {
  userId: string
  role: UserRole
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<LoginSuccess>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed.`,
    })
  }

  try {
    const { email, password } = req.body as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      })
    }

    const [user] = await db<
      { userId: string; role: UserRole; password: string }[]
    >`
      SELECT user_id, role, password
      FROM users
      WHERE email = ${email};
    `

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        userId: user.userId,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error in /api/auth/login:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to login.",
    })
  }
}

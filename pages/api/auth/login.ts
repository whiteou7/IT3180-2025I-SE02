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
 * API xác thực người dùng
 * POST /api/auth/login - Đăng nhập với email và mật khẩu
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<LoginSuccess>>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép.`,
    })
  }

  try {
    // Lấy email và mật khẩu từ request body
    const { email, password } = req.body as {
      email?: string
      password?: string
    }

    // Kiểm tra tính hợp lệ của email (định dạng email)
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      })
    }

    // Kiểm tra tính hợp lệ của mật khẩu (không được rỗng)
    const passwordValidation = validateString(password, "Mật khẩu")
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      })
    }

    // Tìm người dùng trong database theo email
    // Lấy thông tin user_id, role, password (đã hash) và full_name
    const [user] = await db<
      { userId: string; role: UserRole; password: string, fullName: string }[]
    >`
      SELECT user_id, role, password, full_name
      FROM users
      WHERE email = ${email ?? ""};
    `

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng.",
      })
    }

    // So sánh mật khẩu người dùng nhập với mật khẩu đã hash trong database
    // Sử dụng bcrypt để so sánh an toàn
    const passwordMatches = await bcrypt.compare(password ?? "", user.password)

    // Kiểm tra xem mật khẩu có khớp không
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng.",
      })
    }

    // Đăng nhập thành công, trả về thông tin người dùng (không bao gồm mật khẩu)
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
    // Xử lý lỗi khi đăng nhập
    console.error("Error in /api/auth/login:", error)
    return res.status(500).json({
      success: false,
      message: "Đăng nhập thất bại.",
    })
  }
}

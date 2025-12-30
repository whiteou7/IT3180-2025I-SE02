import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"

import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { validateEmail, validatePhoneNumber, validateString } from "@/lib/validation"

/**
 * API đặt lại mật khẩu
 * POST /api/auth/reset-password - Đặt lại mật khẩu người dùng
 * Yêu cầu email và số điện thoại phải khớp với tài khoản
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ success: boolean }>>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép.`,
    })
  }

  try {
    // Lấy thông tin từ request body
    const { email, phoneNumber, newPassword } = req.body as {
      email?: string
      phoneNumber?: string
      newPassword?: string
    }

    // Kiểm tra tính hợp lệ của email (phải đúng định dạng)
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      })
    }

    // Kiểm tra tính hợp lệ của số điện thoại
    const phoneValidation = validatePhoneNumber(phoneNumber)
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: phoneValidation.message,
      })
    }

    // Kiểm tra tính hợp lệ của mật khẩu mới (không được rỗng)
    const passwordValidation = validateString(newPassword, "Mật khẩu mới")
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      })
    }

    // Tìm người dùng với email khớp
    // Lấy user_id và phone_number để xác thực
    const [user] = await db<{ userId: string; phoneNumber: string | null }[]>`
      SELECT user_id, phone_number
      FROM users
      WHERE email = ${email ?? ""};
    `

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với địa chỉ email đó.",
      })
    }

    // Xác thực số điện thoại có khớp với tài khoản không
    // Đây là bước bảo mật để đảm bảo chỉ chủ tài khoản mới có thể đặt lại mật khẩu
    if (user.phoneNumber !== phoneNumber) {
      return res.status(401).json({
        success: false,
        message: "Email và số điện thoại không khớp.",
      })
    }

    // Hash mật khẩu mới
    // Sử dụng bcrypt với salt rounds = 10 để hash mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword ?? "", 10)

    // Cập nhật mật khẩu trong database
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

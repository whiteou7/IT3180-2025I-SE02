import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { User } from "@/types/users"
import type { UserRole, Gender } from "@/types/enum"
import {
  validateString,
  validateEmail,
  validateYear,
  validatePhoneNumber,
  validateFields,
} from "@/lib/validation"

/**
 * API quản lý người dùng
 * POST /api/users - Tạo tài khoản người dùng mới
 * GET /api/users - Lấy danh sách tất cả người dùng (chỉ dành cho admin)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | APIBody<{ userId: string }> // Cho POST 
    | APIBody<User[]> // Cho GET
  >
) {
  try {
    // Xử lý yêu cầu tạo tài khoản mới
    if (req.method === "POST") {
      // Lấy thông tin người dùng từ request body
      const { email, fullName, password, role, yearOfBirth, gender, phoneNumber } = req.body as {
        email: string;
        fullName: string;
        password: string;
        role?: UserRole;
        yearOfBirth?: number;
        gender?: Gender;
        phoneNumber?: string;
      }

      // Kiểm tra tính hợp lệ của các trường bắt buộc
      // Kiểm tra email (phải đúng định dạng)
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.message,
        })
      }

      // Kiểm tra họ tên (không được rỗng)
      const fullNameValidation = validateString(fullName, "Họ tên")
      if (!fullNameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: fullNameValidation.message,
        })
      }

      // Kiểm tra mật khẩu (không được rỗng)
      const passwordValidation = validateString(password, "Mật khẩu")
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của các trường tùy chọn
      // Kiểm tra năm sinh nếu có cung cấp
      if (yearOfBirth !== undefined && yearOfBirth !== null) {
        const yearValidation = validateYear(yearOfBirth, "Năm sinh")
        if (!yearValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: yearValidation.message,
          })
        }
      }

      // Kiểm tra số điện thoại nếu có cung cấp
      if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
        const phoneValidation = validatePhoneNumber(phoneNumber)
        if (!phoneValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: phoneValidation.message,
          })
        }
      }

      // Kiểm tra xem email đã được sử dụng chưa
      const [existingUser] = await db`
        SELECT user_id FROM users WHERE email = ${email};
      `

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email này đã được đăng ký.",
        })
      }

      // Tạo mật khẩu đã hash và ID người dùng
      // Sử dụng bcrypt với salt rounds = 10 để hash mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10)
      // Tạo UUID ngẫu nhiên cho user_id
      const userId = crypto.randomUUID()

      // Thêm người dùng mới vào database
      // Role mặc định là "tenant" nếu không được chỉ định
      await db`
        INSERT INTO users (user_id, email, full_name, password, role, year_of_birth, gender, phone_number)
        VALUES (${userId}, ${email}, ${fullName}, ${hashedPassword}, ${role ?? "tenant" as const}, ${yearOfBirth ?? null}, ${gender ?? null}, ${phoneNumber ?? null});
      `

      return res.status(201).json({
        success: true,
        message: "Tạo tài khoản thành công.",
        data: { userId },
      })
    }

    // Xử lý yêu cầu lấy danh sách người dùng
    if (req.method === "GET") {
      // Lấy tất cả người dùng từ database (không bao gồm mật khẩu)
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
        message: "Tải danh sách người dùng thành công.",
        data: users,
      })
    }

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép.`,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

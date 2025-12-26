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
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.message,
        })
      }

      const fullNameValidation = validateString(fullName, "Họ tên")
      if (!fullNameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: fullNameValidation.message,
        })
      }

      const passwordValidation = validateString(password, "Mật khẩu")
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
        })
      }

      // Validate optional fields
      if (yearOfBirth !== undefined && yearOfBirth !== null) {
        const yearValidation = validateYear(yearOfBirth, "Năm sinh")
        if (!yearValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: yearValidation.message,
          })
        }
      }

      if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
        const phoneValidation = validatePhoneNumber(phoneNumber)
        if (!phoneValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: phoneValidation.message,
          })
        }
      }

      // Check for existing user
      const [existingUser] = await db`
        SELECT user_id FROM users WHERE email = ${email};
      `

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email này đã được đăng ký.",
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
        message: "Tạo tài khoản thành công.",
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
        message: "Tải danh sách người dùng thành công.",
        data: users,
      })
    }

    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép.`,
    })
  } catch (error) {
    console.error("Error in /api/users:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

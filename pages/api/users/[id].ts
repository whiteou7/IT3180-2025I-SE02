
import { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import { User } from "@/types/users"
import { APIBody } from "@/types/api"
import type { UserRole, Gender } from "@/types/enum"
import {
  validateString,
  validateEmail,
  validateYear,
  validatePhoneNumber,
  validateUUID,
} from "@/lib/validation"

/**
 * PUT /api/users/[id] - Update user information
 * GET /api/users/[id] - Get user info 
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<User>>
) {
  const { id: userId } = req.query
  const userIdParam = Array.isArray(userId) ? userId[0] : userId
  const userIdValidation = validateUUID(userIdParam, "Mã người dùng")
  if (!userIdValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: userIdValidation.message || "Mã người dùng không hợp lệ.",
    })
  }

  const userIdString = userIdParam as string

  try {
    if (req.method === "PUT") {
      const { email, fullName, role, yearOfBirth, gender, phoneNumber } = req.body as {
        email: string;
        fullName: string;
        role: UserRole;
        yearOfBirth: number | null;
        gender: Gender | null;
        phoneNumber?: string | null;
      }

      // Validate required fields
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.message || "Email không hợp lệ.",
        })
      }

      const fullNameValidation = validateString(fullName, "Họ tên")
      if (!fullNameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: fullNameValidation.message || "Họ tên không hợp lệ.",
        })
      }

      // Validate optional fields
      if (yearOfBirth !== undefined && yearOfBirth !== null) {
        const yearValidation = validateYear(yearOfBirth, "Năm sinh")
        if (!yearValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: yearValidation.message || "Năm sinh không hợp lệ.",
          })
        }
      }

      if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
        const phoneValidation = validatePhoneNumber(phoneNumber)
        if (!phoneValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: phoneValidation.message || "Số điện thoại không hợp lệ.",
          })
        }
      }

      const updatedUser = await db<User[]>`
        UPDATE users
        SET
          email = ${email},
          full_name = ${fullName},
          role = ${role},
          year_of_birth = ${yearOfBirth ?? null},
          gender = ${gender ?? null},
          phone_number = ${phoneNumber ?? null}
        WHERE user_id = ${userIdString}
        RETURNING 
          user_id,
          email,
          full_name,
          role,
          year_of_birth,
          gender,
          phone_number,
          apartment_id;
      `

      if (updatedUser.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: "Không tìm thấy người dùng" 
        })
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật thông tin người dùng thành công",
        data: updatedUser[0]
      })
    } else if (req.method == "GET") {
      const user = await db<User[]>`
        SELECT 
          user_id,
          email,
          full_name,
          role,
          year_of_birth,
          gender,
          phone_number,
          apartment_id
        FROM users
        WHERE user_id = ${userIdString};
      `

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Tải thông tin người dùng thành công",
        data: user[0],
      })

    } else {
      res.setHeader("Allow", ["PUT"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }
  } catch (error) {
    console.error("Error updating user info:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

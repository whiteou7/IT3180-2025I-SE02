
import { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import { User } from "@/types/users"
import { APIBody } from "@/types/api"
import type { UserRole, Gender } from "@/types/enum"

/**
 * PUT /api/users/[id] - Update user information
 * GET /api/users/[id] - Get user info 
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<User>>
) {
  const { id: userId } = req.query
  if (!userId) {
    return res.status(400).json({
      success: false, 
      message: "Thiếu mã người dùng" 
    })
  }
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

      const updatedUser = await db<User[]>`
        UPDATE users
        SET
          email = ${email},
          full_name = ${fullName},
          role = ${role},
          year_of_birth = ${yearOfBirth ?? null},
          gender = ${gender ?? null},
          phone_number = ${phoneNumber ?? null}
        WHERE user_id = ${userId}
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
        WHERE user_id = ${userId};
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

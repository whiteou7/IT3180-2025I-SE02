import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db" 
import { APIBody } from "@/types/api"
import type { Apartment } from "@/types/apartments"

/**
 * - GET /api/users/[id]/apartments - Get user's apartment information
 * - PUT /api/users/[id]/apartments - Assign user to an apartment
 * - DELETE /api/users/[id]/apartments - Remove user from apartment
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Apartment | { apartmentId: number } | null>>
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
      const { apartmentId } = req.body as {
        apartmentId: number;
      }

      if (!apartmentId) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn căn hộ",
        })
      }

      const result = await db<{ apartmentId: number }[]>`
        UPDATE users
        SET apartment_id = ${apartmentId}
        WHERE user_id = ${userId}
        RETURNING apartment_id;
      `

      const [updatedUser] = result

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Đã gán căn hộ cho cư dân",
        data: updatedUser,
      })
    }

    else if (req.method === "DELETE") {
      const [user] = await db`
        SELECT apartment_id FROM users WHERE user_id = ${userId};
      `

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      await db`
        UPDATE users
        SET apartment_id = NULL
        WHERE user_id = ${userId};
      `

      return res.status(200).json({
        success: true,
        message: "Đã gỡ cư dân khỏi căn hộ",
        data: null,
      })
    }

    else if (req.method === "GET") {
      const [user] = await db`
        SELECT apartment_id FROM users WHERE user_id = ${userId};
      `

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      if (!user.apartmentId) {
        return res.status(200).json({
          success: true,
          message: "Cư dân chưa được gán căn hộ",
          data: null,
        })
      }

      const [apartment] = await db<Apartment[]>`
        SELECT apartment_id, building_id, floor, apartment_number, monthly_fee
        FROM apartments
        WHERE apartment_id = ${user.apartmentId};
      `

      // Fetch apartment members
      const members = await db<{userId: string, fullName: string, email: string}[]>`
        SELECT 
          user_id,
          full_name,
          email
        FROM users
        WHERE apartment_id = ${user.apartmentId}
      `

      const apartmentWithMembers = {
        ...apartment,
        members: members
      }

      return res.status(200).json({
        success: true,
        message: "Tải thông tin căn hộ thành công",
        data: apartmentWithMembers,
      })
    }

    else {
      res.setHeader("Allow", ["PUT", "DELETE", "GET"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }
  } catch (error) {
    console.error("Error in /api/users/[id]/apartments:", error)
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

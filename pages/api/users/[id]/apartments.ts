import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db" 
import { APIBody } from "@/types/api"
import type { Apartment } from "@/types/apartments"

/**
 * API quản lý căn hộ của người dùng
 * GET /api/users/[id]/apartments - Lấy thông tin căn hộ của người dùng
 * PUT /api/users/[id]/apartments - Gán người dùng vào một căn hộ
 * DELETE /api/users/[id]/apartments - Gỡ người dùng khỏi căn hộ
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Apartment | { apartmentId: number } | null>>
) {
  // Lấy userId từ query parameters
  const { id: userId } = req.query

  // Kiểm tra userId có tồn tại không
  if (!userId) {
    return res.status(400).json({
      success: false, 
      message: "Thiếu mã người dùng" 
    })
  }

  try {
    // Xử lý yêu cầu gán căn hộ cho người dùng
    if (req.method === "PUT") {
      // Lấy apartmentId từ request body
      const { apartmentId } = req.body as {
        apartmentId: number;
      }

      // Kiểm tra apartmentId có được cung cấp không
      if (!apartmentId) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn căn hộ",
        })
      }

      // Cập nhật apartment_id của người dùng
      const result = await db<{ apartmentId: number }[]>`
        UPDATE users
        SET apartment_id = ${apartmentId}
        WHERE user_id = ${userId}
        RETURNING apartment_id;
      `

      const [updatedUser] = result

      // Kiểm tra xem người dùng có tồn tại không
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

    // Xử lý yêu cầu gỡ người dùng khỏi căn hộ
    else if (req.method === "DELETE") {
      // Kiểm tra xem người dùng có tồn tại không
      const [user] = await db`
        SELECT apartment_id FROM users WHERE user_id = ${userId};
      `

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      // Xóa liên kết căn hộ của người dùng (đặt apartment_id = NULL)
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

    // Xử lý yêu cầu lấy thông tin căn hộ của người dùng
    else if (req.method === "GET") {
      // Tìm người dùng và lấy apartment_id của họ
      const [user] = await db`
        SELECT apartment_id FROM users WHERE user_id = ${userId};
      `

      // Kiểm tra xem người dùng có tồn tại không
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      // Kiểm tra xem người dùng có được gán căn hộ không
      if (!user.apartmentId) {
        return res.status(200).json({
          success: true,
          message: "Cư dân chưa được gán căn hộ",
          data: null,
        })
      }

      // Lấy thông tin chi tiết của căn hộ
      const [apartment] = await db<Apartment[]>`
        SELECT apartment_id, building_id, floor, apartment_number, monthly_fee
        FROM apartments
        WHERE apartment_id = ${user.apartmentId};
      `

      // Lấy danh sách thành viên của căn hộ
      const members = await db<{userId: string, fullName: string, email: string}[]>`
        SELECT 
          user_id,
          full_name,
          email
        FROM users
        WHERE apartment_id = ${user.apartmentId}
      `

      // Kết hợp thông tin căn hộ với danh sách thành viên
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

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    else {
      res.setHeader("Allow", ["PUT", "DELETE", "GET"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/apartments:", error)
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

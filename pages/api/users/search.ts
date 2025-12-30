import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { User } from "@/types/users"

/**
 * API tìm kiếm người dùng
 * GET /api/users/search - Tìm kiếm người dùng theo tên
 * Query params: q (từ khóa tìm kiếm), userId (mã người dùng hiện tại)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<User[]>>
) {
  // Chỉ chấp nhận phương thức GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Lấy từ khóa tìm kiếm và userId từ query parameters
    const { q, userId } = req.query

    // Kiểm tra từ khóa tìm kiếm có được cung cấp và là string không
    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập từ khóa tìm kiếm",
      })
    }

    // Kiểm tra userId có được cung cấp và là string không
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã người dùng",
      })
    }

    // Tìm kiếm người dùng theo tên (không phân biệt hoa thường)
    // Loại trừ người dùng hiện tại khỏi kết quả
    // Giới hạn 20 kết quả và sắp xếp theo tên
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
      FROM users
      WHERE LOWER(full_name) LIKE LOWER(${`%${q}%`})
        AND user_id != ${userId}
      ORDER BY full_name
      LIMIT 20
    `

    return res.status(200).json({
      success: true,
      message: "Đã tìm thấy người dùng phù hợp",
      data: users,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/search:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Vehicle } from "@/types/properties"

/**
 * API quản lý phương tiện của người dùng
 * GET /api/users/[id]/vehicles - Lấy thông tin phương tiện và nhật ký của người dùng
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Vehicle | null>>
) {
  // Lấy userId từ query parameters
  const { id: userId } = req.query

  // Kiểm tra userId có tồn tại không
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  // Chỉ chấp nhận phương thức GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Tìm phương tiện của người dùng
    // Kết hợp với bảng properties để lấy thông tin tài sản
    const [vehicle] = await db<Vehicle[]>`
      SELECT 
        v.vehicle_id,
        v.property_id,
        v.license_plate
      FROM 
        vehicles v
      JOIN
        properties p
      ON 
        v.property_id = p.property_id
      WHERE 
        p.user_id = ${userId as string};
    `

    // Kiểm tra xem phương tiện có tồn tại không
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phương tiện của người dùng này",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Tải thông tin phương tiện thành công",
      data: vehicle,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/vehicles:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"

import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { PropertySummary } from "@/types/properties"

/**
 * API quản lý tài sản
 * GET /api/properties - Lấy danh sách tất cả tài sản kèm thông tin chủ sở hữu và số lượng báo cáo
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<PropertySummary[]>>
) {
  try {
    // Xử lý yêu cầu lấy danh sách tài sản
    if (req.method === "GET") {
      // Lấy danh sách tài sản với thông tin chi tiết
      // Kết hợp với bảng users để lấy tên chủ sở hữu
      // Kết hợp với bảng vehicles để lấy biển số xe (nếu có)
      // Kết hợp với bảng property_reports để đếm số lượng báo cáo
      // Sử dụng LEFT JOIN để bao gồm cả tài sản không có chủ sở hữu, xe, hoặc báo cáo
      const properties = await db<PropertySummary[]>`
        SELECT
          p.property_id,
          p.property_name,
          p.user_id,
          p.is_public,
          p.property_type,
          p.status,
          p.created_at,
          v.license_plate,
          u.full_name AS owner_name,
          COUNT(pr.property_report_id)::int AS total_reports,
          MAX(pr.created_at) AS last_reported_at
        FROM properties p
        LEFT JOIN users u ON u.user_id = p.user_id
        LEFT JOIN vehicles v ON v.property_id = p.property_id
        LEFT JOIN property_reports pr ON pr.property_id = p.property_id
        GROUP BY p.property_id, u.full_name, v.license_plate
        ORDER BY p.created_at DESC;
      `

      return res.status(200).json({
        success: true,
        message: "Tải danh sách tài sản thành công",
        data: properties,
      })
    }

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/properties:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

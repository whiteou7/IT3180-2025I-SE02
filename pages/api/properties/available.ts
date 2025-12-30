import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Property } from "@/types/properties"

/**
 * API lấy danh sách tài sản có thể báo cáo
 * GET /api/properties/available - Lấy các tài sản có thể báo cáo
 * Trả về các tài sản có trạng thái "found" hoặc chưa từng được báo cáo
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Property[]>>
) {
  // Lấy userId từ query parameters
  const { userId } = req.query

  // Kiểm tra userId có tồn tại không
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  try {
    // Xử lý yêu cầu lấy danh sách tài sản có thể báo cáo
    if (req.method === "GET") {
      // Lấy tất cả tài sản của người dùng thỏa mãn một trong hai điều kiện:
      // 1. Chưa có báo cáo nào (chưa từng được báo cáo là mất)
      // 2. Báo cáo mới nhất có trạng thái 'found' hoặc 'deleted'
      const properties = await db<Property[]>`
        SELECT DISTINCT
          p.property_id,
          p.property_name,
          p.user_id,
          p.is_public,
          p.property_type,
          p.status,
          p.created_at
        FROM properties p
        WHERE p.user_id = ${userId as string}
          AND (
            -- Tài sản chưa có báo cáo nào
            NOT EXISTS (
              SELECT 1 
              FROM property_reports pr 
              WHERE pr.property_id = p.property_id
            )
            -- HOẶC báo cáo mới nhất có trạng thái 'found' hoặc 'deleted'
            OR EXISTS (
              SELECT 1 
              FROM property_reports pr 
              WHERE pr.property_id = p.property_id
                AND pr.status = 'found' OR pr.status = 'deleted'
                AND pr.created_at = (
                  SELECT MAX(created_at) 
                  FROM property_reports 
                  WHERE property_id = p.property_id
                )
            )
          )
        ORDER BY p.property_id;
      `

      return res.status(200).json({
        success: true,
        message: "Tải danh sách tài sản có thể báo cáo thành công",
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
    console.error("Error in /api/properties/available:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

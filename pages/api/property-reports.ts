import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { PropertyReport } from "@/types/reports"
import {
  validateUUID,
  validatePositiveInteger,
  validateString,
} from "@/lib/validation"

/**
 * API quản lý báo cáo tài sản
 * GET /api/property-reports - Lấy tất cả báo cáo tài sản kèm thông tin người dùng và người phát hành
 * POST /api/property-reports - Tạo báo cáo tài sản mới
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<PropertyReport[] | PropertyReport>>
) {
  try {
    // Xử lý yêu cầu lấy danh sách báo cáo
    if (req.method === "GET") {
      // Lấy các tham số lọc từ query
      const { startDate, endDate, filter, status } = req.query as {
        startDate?: string
        endDate?: string
        filter?: "week" | "month" | "year" | "daily"
        status?: string
      }

      // Xây dựng truy vấn cơ bản
      // Kết hợp với bảng users để lấy tên chủ sở hữu và người phát hành
      // Kết hợp với bảng properties để lấy tên tài sản
      let baseQuery = db<PropertyReport[]>`
        SELECT 
          pr.property_report_id, 
          pr.user_id AS owner_id, 
          pr.property_id, 
          pr.status, 
          pr.created_at, 
          pr.issuer_id, 
          u1.full_name AS owner_full_name,        -- Tên đầy đủ của chủ sở hữu
          u2.full_name AS issuer_full_name,      -- Tên đầy đủ của người phát hành
          pr.updated_at,
          p.property_name,
          pr.content,
          pr.issued_status,
          pr.approved
        FROM 
          property_reports pr
        JOIN
          users u1
          ON u1.user_id = pr.user_id
        LEFT JOIN
          users u2
          ON u2.user_id = pr.issuer_id           -- Kết hợp để lấy tên người phát hành
        JOIN
          properties p
        ON 
          p.property_id = pr.property_id
      `

      // Xây dựng các điều kiện WHERE động
      const whereClauses = []

      // Lọc theo khoảng thời gian (ưu tiên hơn filter)
      if (startDate) {
        whereClauses.push(db`pr.created_at >= ${startDate}::date`)
      }
      if (endDate) {
        whereClauses.push(db`pr.created_at <= ${endDate}::date + '1 day'::interval`)
      }

      // Bộ lọc nhanh (chỉ áp dụng nếu không có khoảng thời gian được chỉ định)
      if (!startDate && !endDate && filter) {
        if (filter === "daily") {
          // Lọc báo cáo trong 1 ngày qua
          whereClauses.push(db`pr.created_at >= NOW() - '1 day'::interval`)
        } else if (filter === "week") {
          // Lọc báo cáo trong 7 ngày qua
          whereClauses.push(db`pr.created_at >= NOW() - '7 days'::interval`)
        } else if (filter === "month") {
          // Lọc báo cáo trong 1 tháng qua
          whereClauses.push(db`pr.created_at >= NOW() - '1 month'::interval`)
        } else if (filter === "year") {
          // Lọc báo cáo trong 1 năm qua
          whereClauses.push(db`pr.created_at >= NOW() - '1 year'::interval`)
        }
      }

      // Lọc theo trạng thái
      if (status) {
        whereClauses.push(db`pr.status = ${status}`)
      }

      // Kết hợp tất cả các điều kiện WHERE
      if (whereClauses.length > 0) {
        const combinedWhere = whereClauses.reduce(
          (prev, curr) => db`${prev} AND ${curr}`
        )
        baseQuery = db<PropertyReport[]>`${baseQuery} WHERE ${combinedWhere}`
      }

      // Thực thi truy vấn và sắp xếp theo thời gian tạo mới nhất
      const reports = await db<PropertyReport[]>`${baseQuery} ORDER BY pr.created_at DESC`

      return res.status(200).json({
        success: true,
        message: "Tải danh sách báo cáo thành công",
        data: reports,
      })
    // Xử lý yêu cầu tạo báo cáo mới
    } else if (req.method === "POST") {
      // Lấy thông tin báo cáo từ request body
      const { userId, propertyId, content } = req.body as {
        userId: string
        propertyId: number
        content: string
      }

      // Kiểm tra tính hợp lệ của userId (phải là UUID)
      const userIdValidation = validateUUID(userId, "Mã người dùng")
      if (!userIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: userIdValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của propertyId (phải là số nguyên dương)
      const propertyIdValidation = validatePositiveInteger(propertyId, "Mã tài sản")
      if (!propertyIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: propertyIdValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của nội dung báo cáo (không được rỗng)
      const contentValidation = validateString(content, "Nội dung báo cáo")
      if (!contentValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: contentValidation.message,
        })
      }

      // Tạo báo cáo mới với trạng thái mặc định là 'not found'
      const [newReport] = await db<PropertyReport[]>`
        INSERT INTO property_reports (user_id, property_id, content, status)
        VALUES (${userId}, ${propertyId}, ${content}, 'not found')
        RETURNING *, (
          SELECT user_id FROM properties WHERE property_id = ${propertyId}
        ) AS property_owner_id;
      `

      return res.status(201).json({
        success: true,
        message: "Gửi báo cáo thành công",
        data: newReport,
      })
    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/property-reports:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

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
 * GET /api/property-reports - Retrieve all property reports with user and issuer information
 * POST /api/property-reports - Create a new property report
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<PropertyReport[] | PropertyReport>>
) {
  try {
    if (req.method === "GET") {
      const reports = await db<PropertyReport[]>`
        SELECT 
          pr.property_report_id, 
          pr.user_id AS owner_id, 
          pr.property_id, 
          pr.status, 
          pr.created_at, 
          pr.issuer_id, 
          u1.full_name AS owner_full_name,        -- Full name of the owner
          u2.full_name AS issuer_full_name,      -- Full name of the issuer
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
          ON u2.user_id = pr.issuer_id           -- Join to get issuer's name
        JOIN
          properties p
        ON 
          p.property_id = pr.property_id
        ORDER BY 
          pr.created_at DESC;

      `

      return res.status(200).json({
        success: true,
        message: "Tải danh sách báo cáo thành công",
        data: reports,
      })
    } else if (req.method === "POST") {
      const { userId, propertyId, content } = req.body as {
        userId: string
        propertyId: number
        content: string
      }

      const userIdValidation = validateUUID(userId, "Mã người dùng")
      if (!userIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: userIdValidation.message,
        })
      }

      const propertyIdValidation = validatePositiveInteger(propertyId, "Mã tài sản")
      if (!propertyIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: propertyIdValidation.message,
        })
      }

      const contentValidation = validateString(content, "Nội dung báo cáo")
      if (!contentValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: contentValidation.message,
        })
      }

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
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }
  } catch (error) {
    console.error("Error in /api/property-reports:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

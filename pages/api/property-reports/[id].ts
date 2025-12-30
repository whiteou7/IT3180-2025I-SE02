import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { PropertyReport } from "@/types/reports"
import type { UserRole } from "@/types/enum"

/**
 * API quản lý báo cáo tài sản theo ID
 * PATCH /api/property-reports/[id] - Cập nhật trạng thái báo cáo tài sản
 * DELETE /api/property-reports/[id] - Xóa báo cáo tài sản
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<PropertyReport | null>>
) {
  // Lấy report ID từ query parameters
  const { id } = req.query

  try {
    // Xử lý yêu cầu cập nhật báo cáo
    if (req.method === "PATCH") {
      // Lấy thông tin cập nhật từ request body
      const { approved, issuedStatus, status, issuerId } = req.body as {
        approved?: boolean
        issuedStatus?: string | null
        status?: string | null
        issuerId?: string | null
      }

      // Kiểm tra ít nhất một trường phải được cung cấp để cập nhật
      if (
        approved === undefined &&
        issuedStatus === undefined &&
        status === undefined &&
        issuerId === undefined
      ) {
        return res.status(400).json({ success: false, message: "Không có thay đổi nào để cập nhật" })
      }

      // Lấy thông tin meta của báo cáo (property_id và property_owner_id)
      const [reportMeta] = await db<{ propertyId: number | null; propertyOwnerId: string | null }[]>`
        SELECT pr.property_id, p.user_id AS property_owner_id
        FROM property_reports pr
        JOIN properties p ON p.property_id = pr.property_id
        WHERE pr.property_report_id = ${id as string}
      `

      // Kiểm tra xem báo cáo có tồn tại không
      if (!reportMeta) {
        return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo" })
      }

      let updated: PropertyReport | null = null

      // Xử lý cập nhật trạng thái duyệt (approved)
      if (approved !== undefined) {
        // Kiểm tra issuerId có được cung cấp không
        if (!issuerId) {
          return res.status(400).json({ success: false, message: "Vui lòng chọn người duyệt trước" })
        }

        // Lấy role của người duyệt
        const [actor] = await db<{ role: UserRole }[]>`
          SELECT role FROM users WHERE user_id = ${issuerId}
        `

        // Kiểm tra người duyệt có tồn tại không
        if (!actor) {
          return res.status(404).json({ success: false, message: "Không tìm thấy người duyệt" })
        }

        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu tài sản mới có thể duyệt
        const isAdmin = actor.role === "admin"
        const isOwner = issuerId === reportMeta.propertyOwnerId

        if (!isAdmin && !isOwner) {
          return res.status(403).json({ success: false, message: "Bạn không có quyền duyệt báo cáo này" })
        }

        // Cập nhật trạng thái duyệt
        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET approved = ${approved}, issuer_id = ${issuerId}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row

        // Cập nhật trạng thái của tài sản dựa trên kết quả duyệt
        if (row?.propertyId) {
          if (approved) {
            // Nếu được duyệt, cập nhật trạng thái tài sản theo trạng thái báo cáo
            await db`
              UPDATE properties
              SET status = ${row.status}
              WHERE property_id = ${row.propertyId}
            `
          } else {
            // Nếu không được duyệt, tìm báo cáo được duyệt gần nhất và cập nhật trạng thái tài sản
            const [nextStatus] = await db<{ status: string | null }[]>`
              SELECT status
              FROM property_reports
              WHERE property_id = ${row.propertyId}
                AND approved = true
              ORDER BY updated_at DESC
              LIMIT 1;
            `

            // Cập nhật trạng thái tài sản (mặc định là "found" nếu không có báo cáo được duyệt nào)
            await db`
              UPDATE properties
              SET status = ${nextStatus?.status ?? "found"}
              WHERE property_id = ${row.propertyId}
            `
          }
        }
      }

      // Xử lý cập nhật trạng thái phát hành (issuedStatus)
      if (issuedStatus !== undefined) {
        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET issued_status = ${issuedStatus}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      // Xử lý cập nhật trạng thái (status)
      if (status !== undefined) {
        // Khi cập nhật trạng thái, đặt lại approved = false
        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET status = ${status}, approved = false, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      // Xử lý cập nhật issuerId (nếu không có approved)
      if (issuerId !== undefined && approved === undefined) {
        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET issuer_id = ${issuerId}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      // Kiểm tra xem có bản ghi nào được cập nhật không
      if (!updated) {
        return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo" })
      }

      return res.status(200).json({ success: true, message: "Đã cập nhật báo cáo", data: updated })
    }

    // Xử lý yêu cầu xóa báo cáo
    else if (req.method === "DELETE") {
      // Xóa báo cáo khỏi database
      const [deleted] = await db<PropertyReport[]>`
        DELETE FROM property_reports
        WHERE property_report_id = ${id as string}
        RETURNING *;
      `

      // Kiểm tra xem báo cáo có tồn tại không
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo" })
      }

      // Cập nhật trạng thái tài sản sau khi xóa báo cáo
      if (deleted.propertyId) {
        // Tìm báo cáo được duyệt gần nhất cho tài sản này
        const [nextStatus] = await db<{ status: string | null }[]>`
          SELECT status
          FROM property_reports
          WHERE property_id = ${deleted.propertyId}
            AND approved = true
          ORDER BY updated_at DESC
          LIMIT 1;
        `

        // Cập nhật trạng thái tài sản (mặc định là "found" nếu không có báo cáo được duyệt nào)
        await db`
          UPDATE properties
          SET status = ${nextStatus?.status ?? "found"}
          WHERE property_id = ${deleted.propertyId}
        `
      }

      return res.status(200).json({ success: true, message: "Đã xóa báo cáo", data: null })
    }

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    else {
      res.setHeader("Allow", ["PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }
  } catch (error) {
    // Xử lý lỗi chung
    console.error(`Error processing property report ${id}:`, error)
    return res.status(500).json({ success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." })
  }
}

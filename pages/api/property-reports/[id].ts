import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { PropertyReport } from "@/types/reports"
import type { UserRole } from "@/types/enum"

/**
 * PATCH /api/property-reports/[id] - Update property report status
 * DELETE /api/property-reports/[id] - Delete property report
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<PropertyReport | null>>
) {
  const { id } = req.query

  try {
    if (req.method === "PATCH") {
      const { approved, issuedStatus, status, issuerId } = req.body as {
        approved?: boolean
        issuedStatus?: string | null
        status?: string | null
        issuerId?: string | null
      }

      if (
        approved === undefined &&
        issuedStatus === undefined &&
        status === undefined &&
        issuerId === undefined
      ) {
        return res.status(400).json({ success: false, message: "Không có thay đổi nào để cập nhật" })
      }

      const [reportMeta] = await db<{ propertyId: number | null; propertyOwnerId: string | null }[]>`
        SELECT pr.property_id, p.user_id AS property_owner_id
        FROM property_reports pr
        JOIN properties p ON p.property_id = pr.property_id
        WHERE pr.property_report_id = ${id as string}
      `

      if (!reportMeta) {
        return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo" })
      }

      let updated: PropertyReport | null = null

      if (approved !== undefined) {
        if (!issuerId) {
          return res.status(400).json({ success: false, message: "Vui lòng chọn người duyệt trước" })
        }

        const [actor] = await db<{ role: UserRole }[]>`
          SELECT role FROM users WHERE user_id = ${issuerId}
        `

        if (!actor) {
          return res.status(404).json({ success: false, message: "Không tìm thấy người duyệt" })
        }

        const isAdmin = actor.role === "admin"
        const isOwner = issuerId === reportMeta.propertyOwnerId

        if (!isAdmin && !isOwner) {
          return res.status(403).json({ success: false, message: "Bạn không có quyền duyệt báo cáo này" })
        }

        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET approved = ${approved}, issuer_id = ${issuerId}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row

        if (row?.propertyId) {
          if (approved) {
            await db`
              UPDATE properties
              SET status = ${row.status}
              WHERE property_id = ${row.propertyId}
            `
          } else {
            const [nextStatus] = await db<{ status: string | null }[]>`
              SELECT status
              FROM property_reports
              WHERE property_id = ${row.propertyId}
                AND approved = true
              ORDER BY updated_at DESC
              LIMIT 1;
            `

            await db`
              UPDATE properties
              SET status = ${nextStatus?.status ?? "found"}
              WHERE property_id = ${row.propertyId}
            `
          }
        }
      }

      if (issuedStatus !== undefined) {
        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET issued_status = ${issuedStatus}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      if (status !== undefined) {
        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET status = ${status}, approved = false, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      if (issuerId !== undefined && approved === undefined) {
        const [row] = await db<PropertyReport[]>`
          UPDATE property_reports
          SET issuer_id = ${issuerId}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      if (!updated) {
        return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo" })
      }

      return res.status(200).json({ success: true, message: "Đã cập nhật báo cáo", data: updated })
    }

    else if (req.method === "DELETE") {
      const [deleted] = await db<PropertyReport[]>`
        DELETE FROM property_reports
        WHERE property_report_id = ${id as string}
        RETURNING *;
      `

      if (!deleted) {
        return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo" })
      }

      if (deleted.propertyId) {
        const [nextStatus] = await db<{ status: string | null }[]>`
          SELECT status
          FROM property_reports
          WHERE property_id = ${deleted.propertyId}
            AND approved = true
          ORDER BY updated_at DESC
          LIMIT 1;
        `

        await db`
          UPDATE properties
          SET status = ${nextStatus?.status ?? "found"}
          WHERE property_id = ${deleted.propertyId}
        `
      }

      return res.status(200).json({ success: true, message: "Đã xóa báo cáo", data: null })
    }

    else {
      res.setHeader("Allow", ["PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }
  } catch (error) {
    console.error(`Error processing property report ${id}:`, error)
    return res.status(500).json({ success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." })
  }
}

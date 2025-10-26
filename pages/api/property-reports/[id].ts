import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { PropertyReport } from "@/types/reports"

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
        approved?: boolean;
        issuedStatus?: string | null;
        status?: string | null;
        issuerId?: string | null;
      }

      if (approved === undefined && issuedStatus === undefined && status === undefined && issuerId === undefined) {
        return res.status(400).json({ success: false, message: "No updatable fields provided" })
      }

      let updated: PropertyReport | null = null

      if (approved !== undefined) {
        const [row] = await db`
          UPDATE property_reports
          SET approved = ${approved}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      if (issuedStatus !== undefined) {
        const [row] = await db`
          UPDATE property_reports
          SET issued_status = ${issuedStatus}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      if (status !== undefined) {
        const [row] = await db`
          UPDATE property_reports
          SET status = ${status}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      if (issuerId !== undefined) {
        const [row] = await db`
          UPDATE property_reports
          SET issuer_id = ${issuerId}, updated_at = CURRENT_TIMESTAMP
          WHERE property_report_id = ${id as string}
          RETURNING *;
        `
        updated = row
      }

      if (!updated) {
        return res.status(404).json({ success: false, message: "Property report not found" })
      }

      return res.status(200).json({ success: true, message: "Report updated", data: updated })
    }

    else if (req.method === "DELETE") {
      const [deleted] = await db<{ propertyReportId: string }[]>`
        DELETE FROM property_reports
        WHERE property_report_id = ${id as string}
        RETURNING property_report_id;
      `

      if (!deleted) {
        return res.status(404).json({ success: false, message: "Report not found" })
      }

      return res.status(200).json({ success: true, message: "Report deleted", data: null })
    }

    else {
      res.setHeader("Allow", ["PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error(`Error processing property report ${id}:`, error)
    return res.status(500).json({ success: false, message: "Internal Server Error" })
  }
}

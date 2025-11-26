import type { NextApiRequest, NextApiResponse } from "next"

import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { PropertySummary } from "@/types/properties"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<PropertySummary[]>>
) {
  try {
    if (req.method === "GET") {
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
        message: "Properties fetched successfully",
        data: properties,
      })
    }

    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  } catch (error) {
    console.error("Error in /api/properties:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

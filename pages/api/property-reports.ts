import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { PropertyReport } from "@/types/reports"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<PropertyReport[]>>
) {
  try {
    if (req.method === "GET") {
      const reports = await db<PropertyReport[]>`
        SELECT 
          pr.property_report_id, 
          pr.user_id, 
          pr.property_id, 
          pr.status, 
          pr.created_at, 
          pr.issuer_id, 
          u1.full_name AS user_full_name,        -- Full name of the user
          u2.full_name AS issuer_full_name,      -- Full name of the issuer
          pr.updated_at,
          p.property_name,
          pr.content
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

      return res.status(200).json({ success: true, message: "Property reports fetched successfully", data: reports })
    } else {
      res.setHeader("Allow", ["GET"])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("Error in /api/property-reports:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

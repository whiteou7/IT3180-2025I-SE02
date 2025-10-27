import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Property } from "@/types/properties"

/**
 * GET /api/properties/available - Get properties available for reporting
 * Returns properties that are either "found" or have never been reported
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Property[]>>
) {
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    })
  }

  try {
    if (req.method === "GET") {
      // Get all properties for the user that are either:
      // 1. Have no reports (never reported as lost)
      // 2. Have their latest report with status 'found'
      const properties = await db<Property[]>`
        SELECT DISTINCT
          p.property_id,
          p.property_name,
          p.user_id,
          p.is_public
        FROM properties p
        WHERE p.user_id = ${userId as string}
          AND (
            -- Property has no reports
            NOT EXISTS (
              SELECT 1 
              FROM property_reports pr 
              WHERE pr.property_id = p.property_id
            )
            -- OR the most recent report has status 'found'
            OR EXISTS (
              SELECT 1 
              FROM property_reports pr 
              WHERE pr.property_id = p.property_id
                AND pr.status = 'found'
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
        message: "Available properties fetched successfully",
        data: properties,
      })
    }

    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  } catch (error) {
    console.error("Error in /api/properties/available:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

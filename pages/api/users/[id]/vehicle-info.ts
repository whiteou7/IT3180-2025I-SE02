import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Vehicle } from "@/types/properties"

/**
 * GET /api/users/[id]/vehicle-info - Get vehicle info and logs for a user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Vehicle | null>>
) {
  const { id: userId } = req.query

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    })
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }

  try {
    const [vehicle] = await db<Vehicle[]>`
      SELECT 
        v.vehicle_id,
        v.property_id,
        v.license_plate
      FROM 
        vehicles v
      JOIN
        properties p
      ON 
        v.property_id = p.property_id
      WHERE 
        p.user_id = ${userId as string};
    `

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found for this user",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle info fetched successfully",
      data: vehicle,
    })
  } catch (error) {
    console.error("Error in /api/users/[id]/vehicle-info:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

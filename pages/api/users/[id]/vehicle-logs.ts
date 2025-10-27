import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

type VehicleLogEntry = {
  vehicleLogId: string
  entranceTime: Date
  exitTime: Date | null
}

/**
 * GET /api/users/[id]/vehicle-logs - Get vehicle logs for a user's vehicle
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<VehicleLogEntry[]>>
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
    const logs = await db<VehicleLogEntry[]>`
      SELECT 
        vl.vehicle_log_id,
        vl.entrance_time,
        vl.exit_time
      FROM 
        vehicle_logs vl
      JOIN
        vehicles v
      ON 
        vl.vehicle_id = v.vehicle_id
      JOIN
        properties p
      ON 
        v.property_id = p.property_id
      WHERE 
        p.user_id = ${userId as string}
      ORDER BY 
        vl.entrance_time DESC;
    `

    return res.status(200).json({
      success: true,
      message: "Vehicle logs fetched successfully",
      data: logs,
    })
  } catch (error) {
    console.error("Error in /api/users/[id]/vehicle-logs:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

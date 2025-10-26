import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db" 
import type { APIBody } from "@/types/api" 
import type { VehicleLog } from "@/types/vehicles" 

/**
 * GET /api/vehicles/checkin - Retrieve vehicle logs with filtering options
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ logs: VehicleLog[] }>> 
) {
  // Only accept GET method
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }

  try {
    const { userId, filter } = req.query as {
      userId?: string;
      filter?: "week" | "month" | "year";
    }
    const baseQuery = db<VehicleLog[]>`
      SELECT 
        u.user_id, 
        u.full_name, 
        v.vehicle_id, 
        v.license_plate, 
        vl.entrance_time, 
        vl.exit_time
      FROM 
        vehicle_logs vl
      JOIN 
        vehicles v ON vl.vehicle_id = v.vehicle_id
      JOIN 
        properties p ON p.property_id = v.property_id
      JOIN 
        users u ON u.user_id = p.user_id
    `

    const whereClauses = []
    if (userId) {
      whereClauses.push(db`u.user_id = ${userId as string}`)
    }

    if (filter === "week") {
      whereClauses.push(db<VehicleLog[]>`vl.entrance_time >= NOW() - '7 days'::interval`)
    } else if (filter === "month") {
      whereClauses.push(db<VehicleLog[]>`vl.entrance_time >= NOW() - '1 month'::interval`)
    } else if (filter === "year") {
      whereClauses.push(db<VehicleLog[]>`vl.entrance_time >= NOW() - '1 year'::interval`)
    }

    const sortQuery = db<VehicleLog[]>`ORDER BY vl.entrance_time asc`

    let finalQuery
    
    if (whereClauses.length > 0) {
      const combinedWhere = whereClauses.reduce((prev, curr) => db<VehicleLog[]>`${prev} AND ${curr}`)
      finalQuery = db<VehicleLog[]>`${baseQuery} WHERE ${combinedWhere} ${sortQuery}`
    } else {
      finalQuery = db<VehicleLog[]>`${baseQuery} ${sortQuery}`
    }

    const logs = await finalQuery

    return res.status(200).json({
      success: true,
      message: "Fetched vehicle logs successfully.",
      data: {
        logs,
      },
    })

  } catch (error) {
    console.error("Error fetching vehicle logs:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}
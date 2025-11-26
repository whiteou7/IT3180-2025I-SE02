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
    let baseQuery = db<VehicleLog[]>`
      SELECT 
        vl.vehicle_log_id,
        vl.entrance_time,
        vl.exit_time,
        v.vehicle_id,
        v.license_plate,
        u.user_id,
        u.full_name,
        u.apartment_id,
        a.apartment_number,
        a.building_id,
        a.floor
      FROM 
        vehicle_logs vl
      JOIN 
        vehicles v ON vl.vehicle_id = v.vehicle_id
      JOIN 
        properties p ON p.property_id = v.property_id
      LEFT JOIN 
        users u ON u.user_id = p.user_id
      LEFT JOIN 
        apartments a ON a.apartment_id = u.apartment_id
    `

    const whereClauses = []
    if (userId) {
      whereClauses.push(db`u.user_id = ${userId as string}`)
    }

    if (filter === "week") {
      whereClauses.push(db`vl.entrance_time >= NOW() - '7 days'::interval`)
    } else if (filter === "month") {
      whereClauses.push(db`vl.entrance_time >= NOW() - '1 month'::interval`)
    } else if (filter === "year") {
      whereClauses.push(db`vl.entrance_time >= NOW() - '1 year'::interval`)
    }

    if (whereClauses.length > 0) {
      const combinedWhere = whereClauses.reduce(
        (prev, curr) => db`${prev} AND ${curr}`
      )
      baseQuery = db<VehicleLog[]>`${baseQuery} WHERE ${combinedWhere}`
    }

    const logs = await db<VehicleLog[]>`${baseQuery} ORDER BY vl.entrance_time DESC`

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
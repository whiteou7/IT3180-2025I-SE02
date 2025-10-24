import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ time: string }>>
) {
  const { id: userId } = req.query

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ 
      success: false, 
      message: "User ID is required" 
    })
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    })
  }

  try {
    // Check if user exists
    const [user] = await db`
      SELECT user_id FROM users WHERE user_id = ${userId};
    `

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      })
    }

    // Find the user's vehicle (1-to-1 mapping)
    const [vehicle] = await db`
      SELECT 
        v.vehicle_id
      FROM 
        vehicles v
      JOIN
        properties p
      ON 
        v.property_id = p.property_id
      WHERE 
        p.user_id = ${userId};
    `

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Vehicle not found for this user" 
      })
    }

    // Get the latest log entry for this vehicle
    const [latestLog] = await db`
      SELECT 
        vehicle_log_id,
        entrance_time,
        exit_time
      FROM 
        vehicle_logs
      WHERE 
        vehicle_id = ${vehicle.vehicleId}
      ORDER BY 
        entrance_time DESC
      LIMIT 1;
    `

    const currentTime = new Date().toISOString()

    if (!latestLog || latestLog.exitTime !== null) {
      // No log exists or vehicle is currently outside - create new entry (entering)
      await db`
        INSERT INTO vehicle_logs (vehicle_id, entrance_time, exit_time)
        VALUES (${vehicle.vehicleId}, ${currentTime}, NULL);
      `

      return res.status(200).json({
        success: true,
        message: "Vehicle entered",
        data: { time: currentTime }
      })
    } else {
      // Vehicle is currently inside - update exit time (exiting)
      await db`
        UPDATE vehicle_logs 
        SET exit_time = ${currentTime}
        WHERE vehicle_log_id = ${latestLog.vehicleLogId};
      `

      return res.status(200).json({
        success: true,
        message: "Vehicle exited",
        data: { time: currentTime }
      })
    }

  } catch (error) {
    console.error("Error in /api/users/[id]/vehicle/checkin:", error)
    return res.status(500).json({ 
      success: false, 
      message: (error as Error).message 
    })
  }
}

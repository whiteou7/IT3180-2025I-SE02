import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

type VehicleInfo = {
  vehicleId: number
  propertyId: number
  licensePlate: string
}

/**
 * PUT /api/users/[id]/vehicle/[vehicleId] - Update vehicle license plate
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<VehicleInfo | null>>
) {
  const { id: userId, vehicleId } = req.query

  if (!userId || !vehicleId) {
    return res.status(400).json({
      success: false,
      message: "User ID and Vehicle ID are required",
    })
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }

  try {
    const { licensePlate } = req.body as {
      licensePlate: string
    }

    if (!licensePlate) {
      return res.status(400).json({
        success: false,
        message: "licensePlate is required",
      })
    }

    // Update the vehicle's license plate
    const [updatedVehicle] = await db<VehicleInfo[]>`
      UPDATE vehicles
      SET license_plate = ${licensePlate}
      WHERE vehicle_id = ${vehicleId as string}
      RETURNING *;
    `

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "License plate updated successfully",
      data: updatedVehicle,
    })
  } catch (error) {
    console.error("Error in /api/users/[id]/vehicle/[vehicleId]:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Vehicle } from "@/types/properties"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Vehicle | null>>
) {
  const { id: userId } = req.query

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" })
  }

  try {
    if (req.method === "POST") {
      const { licensePlate } = req.body

      if (!licensePlate) {
        return res.status(400).json({
          success: false,
          message: "License plate is required",
        })
      }

      // Check user exists
      const [user] = await db`
        SELECT user_id FROM users WHERE user_id = ${userId};
      `

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
      }

      // Ensure license plate is unique
      const [existingVehicle] = await db`
        SELECT vehicle_id FROM vehicles WHERE license_plate = ${licensePlate};
      `

      if (existingVehicle) {
        return res.status(409).json({ success: false, message: "License plate already registered" })
      }

      // Ensure each user only have one vehicle
      const [existingUserVehicle] = await db`
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

      if (existingUserVehicle) {
        return res.status(409).json({ success: false, message: "User already has a vehicle" })
      }

      // Create property
      const [createdProperty] = await db<{ propertyId: number }[]>`
        INSERT INTO properties (property_name, user_id, is_public)
        VALUES ('Vehicle', ${userId}, ${false})
        RETURNING property_id;
      `

      if (!createdProperty) {
        return res.status(500).json({ success: false, message: "Failed to create property" })
      }

      // Create vehicle linked to property
      const [createdVehicle] = await db<{ vehicleId: number }[]>`
        INSERT INTO vehicles (property_id, license_plate)
        VALUES (${createdProperty.propertyId}, ${licensePlate})
        RETURNING vehicle_id;
      `

      return res.status(201).json({
        success: true,
        message: "Property and vehicle created successfully",
        data: {
          vehicleId: createdVehicle.vehicleId,
          propertyId: createdProperty.propertyId,
          licensePlate,
        },
      })
    }

    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error("Error in /api/users/[id]/vehicle:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

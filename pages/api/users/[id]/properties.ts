import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Property } from "@/types/properties"
import type { UserRole } from "@/types/enum"

/**
 * GET /api/users/[id]/properties - Get all properties for a user
 * POST /api/users/[id]/properties - Create a new property for a user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Property | Property[] | { propertyId: number }>>
) {
  const { id: userId } = req.query

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    })
  }

  try {
    if (req.method === "GET") {
      const properties = await db<Property[]>`
        SELECT 
          p.property_id,
          p.property_name,
          p.user_id,
          p.is_public,
          p.property_type,
          p.status,
          p.created_at,
          v.license_plate
        FROM properties p
        LEFT JOIN vehicles v ON v.property_id = p.property_id
        WHERE p.user_id = ${userId as string}
        ORDER BY p.created_at DESC;
      `

      return res.status(200).json({
        success: true,
        message: "Properties fetched successfully",
        data: properties,
      })
    }

    if (req.method === "POST") {
      const { propertyName, propertyType, isPublic, licensePlate } = req.body as {
        propertyName: string
        propertyType?: string
        isPublic?: boolean
        licensePlate?: string
      }

      if (!propertyName) {
        return res.status(400).json({
          success: false,
          message: "propertyName is required",
        })
      }

      const [userRecord] = await db<{ role: UserRole }[]>`
        SELECT role FROM users WHERE user_id = ${userId as string}
      `

      if (!userRecord) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      const requestedType = propertyType ?? "general"
      const requestedPublic = Boolean(isPublic)

      if (requestedPublic && userRecord.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only administrators can register public properties",
        })
      }

      if (requestedType === "vehicle") {
        if (!licensePlate?.trim()) {
          return res.status(400).json({
            success: false,
            message: "License plate is required for vehicle registrations",
          })
        }

        const [existingVehicle] = await db<{ propertyId: number }[]>`
          SELECT property_id
          FROM properties
          WHERE user_id = ${userId as string}
            AND property_type = 'vehicle'
          LIMIT 1;
        `

        if (existingVehicle) {
          return res.status(409).json({
            success: false,
            message: "Each user can only register one vehicle",
          })
        }

        const result = await db.begin(async (sql) => {
          const [newProperty] = await sql<{ propertyId: number }[]>`
            INSERT INTO properties (property_name, user_id, is_public, property_type)
            VALUES (
              ${propertyName},
              ${userId as string},
              ${false},
              ${requestedType}
            )
            RETURNING property_id;
          `

          await sql`
            INSERT INTO vehicles (property_id, license_plate)
            VALUES (${newProperty.propertyId}, ${licensePlate})
          `

          return newProperty
        })

        return res.status(201).json({
          success: true,
          message: "Vehicle registered successfully",
          data: { propertyId: result.propertyId },
        })
      }

      const [newProperty] = await db<{ propertyId: number }[]>`
        INSERT INTO properties (property_name, user_id, is_public, property_type)
        VALUES (
          ${propertyName},
          ${userId as string},
          ${requestedPublic && userRecord.role === "admin"},
          ${requestedType}
        )
        RETURNING property_id;
      `

      return res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: { propertyId: newProperty.propertyId },
      })
    }

    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  } catch (error) {
    console.error("Error in /api/users/[id]/properties:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

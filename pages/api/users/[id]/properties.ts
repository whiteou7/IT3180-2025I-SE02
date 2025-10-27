import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Property } from "@/types/properties"

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
          property_id,
          property_name,
          user_id,
          is_public
        FROM properties
        WHERE user_id = ${userId as string}
        ORDER BY property_id;
      `

      return res.status(200).json({
        success: true,
        message: "Properties fetched successfully",
        data: properties,
      })
    }

    if (req.method === "POST") {
      const { propertyName } = req.body as {
        propertyName: string
      }

      if (!propertyName) {
        return res.status(400).json({
          success: false,
          message: "propertyName is required",
        })
      }

      const [newProperty] = await db<{ propertyId: number }[]>`
        INSERT INTO properties (property_name, user_id, is_public)
        VALUES (${propertyName}, ${userId as string}, false)
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

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Property } from "@/types/properties"

/**
 * GET /api/users/[id]/properties/[propertyId] - Get a property by ID
 * PUT /api/users/[id]/properties/[propertyId] - Update a property
 * DELETE /api/users/[id]/properties/[propertyId] - Delete a property
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Property | null>>
) {
  const { id: userId, propertyId } = req.query

  if (!userId || !propertyId) {
    return res.status(400).json({
      success: false,
      message: "User ID and Property ID are required",
      data: null,
    })
  }

  try {
    if (req.method === "GET") {
      const [property] = await db<Property[]>`
        SELECT 
          property_id,
          property_name,
          user_id,
          is_public
        FROM properties
        WHERE property_id = ${propertyId as string}
          AND user_id = ${userId as string};
      `

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
          data: null,
        })
      }

      return res.status(200).json({
        success: true,
        message: "Property fetched successfully",
        data: property,
      })
    }

    if (req.method === "PUT") {
      const { propertyName } = req.body as {
        propertyName: string
      }

      if (!propertyName) {
        return res.status(400).json({
          success: false,
          message: "propertyName is required",
          data: null,
        })
      }

      const [updatedProperty] = await db<Property[]>`
        UPDATE properties
        SET property_name = ${propertyName}
        WHERE property_id = ${propertyId as string}
          AND user_id = ${userId as string}
        RETURNING *;
      `

      if (!updatedProperty) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
          data: null,
        })
      }

      return res.status(200).json({
        success: true,
        message: "Property updated successfully",
        data: updatedProperty,
      })
    }

    if (req.method === "DELETE") {
      const [deletedProperty] = await db<Property[]>`
        DELETE FROM properties
        WHERE property_id = ${propertyId as string}
          AND user_id = ${userId as string}
        RETURNING *;
      `

      if (!deletedProperty) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
          data: null,
        })
      }

      return res.status(200).json({
        success: true,
        message: "Property deleted successfully",
        data: deletedProperty,
      })
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
      data: null,
    })
  } catch (error) {
    console.error("Error in /api/users/[id]/properties/[propertyId]:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
      data: null,
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db" 
import { APIBody } from "@/types/api"
import type { Apartment } from "@/types/apartments"

/**
 * - GET /api/users/[id]/apartments - Get user's apartment information
 * - PUT /api/users/[id]/apartments - Assign user to an apartment
 * - DELETE /api/users/[id]/apartments - Remove user from apartment
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Apartment | { apartmentId: number } | null>>
) {
  const { id: userId } = req.query

  if (!userId) {
    return res.status(400).json({
      success: false, 
      message: "User ID is required" 
    })
  }

  try {
    if (req.method === "PUT") {
      const { apartmentId } = req.body as {
        apartmentId: number;
      }

      if (!apartmentId) {
        return res.status(400).json({
          success: false,
          message: "Missing apartmentId in request body",
        })
      }

      const result = await db<{ apartmentId: number }[]>`
        UPDATE users
        SET apartment_id = ${apartmentId}
        WHERE user_id = ${userId}
        RETURNING apartment_id;
      `

      const [updatedUser] = result

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      return res.status(200).json({
        success: true,
        message: "User added to apartment successfully",
        data: updatedUser,
      })
    }

    else if (req.method === "DELETE") {
      const [user] = await db`
        SELECT apartment_id FROM users WHERE user_id = ${userId};
      `

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      await db`
        UPDATE users
        SET apartment_id = NULL
        WHERE user_id = ${userId};
      `

      return res.status(200).json({
        success: true,
        message: "User removed from apartment successfully",
        data: null,
      })
    }

    else if (req.method === "GET") {
      const [user] = await db`
        SELECT apartment_id FROM users WHERE user_id = ${userId};
      `

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      if (!user.apartmentId) {
        return res.status(200).json({
          success: true,
          message: "User is not assigned to an apartment",
          data: null,
        })
      }

      const [apartment] = await db<Apartment[]>`
        SELECT apartment_id, building_id, floor, apartment_number, monthly_fee
        FROM apartments
        WHERE apartment_id = ${user.apartmentId};
      `

      return res.status(200).json({
        success: true,
        message: "Apartment fetched successfully",
        data: apartment,
      })
    }

    else {
      res.setHeader("Allow", ["PUT", "DELETE", "GET"])
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`,
      })
    }
  } catch (error) {
    console.error("Error in /api/users/[id]/apartments:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}

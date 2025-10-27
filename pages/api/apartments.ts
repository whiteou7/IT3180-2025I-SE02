import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Apartment } from "@/types/apartments"

/**
 * POST /api/apartments - Create a new apartment
 * GET /api/apartments - Get all apartments
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | APIBody<{ apartmentId: number }>
    | APIBody<Apartment[]>
  >
) {
  if (req.method === "POST") {
    try {
      const { buildingId, floor, apartmentNumber, monthlyFee } = req.body as {
        buildingId: number;
        floor: number;
        apartmentNumber: number;
        monthlyFee: number;
      }

      if (buildingId == undefined 
        || floor == undefined 
        || apartmentNumber == undefined 
        || monthlyFee == undefined 
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required body keys",
        })
      }

      const [newApartment] = await db`
        INSERT INTO apartments (building_id, floor, apartment_number, monthly_fee)
        VALUES (${buildingId}, ${floor}, ${apartmentNumber}, ${monthlyFee})
        RETURNING apartment_id;
      ` 

      return res.status(201).json({
        success: true,
        message: "Apartment created successfully.",
        data: { apartmentId: newApartment.apartmentId }
      })

    } catch (error) {
      console.error("Error creating apartment:", error)
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      })
    }
  }

  if (req.method === "GET") {
    try {
      const apartments = await db<Apartment[]>`
        SELECT 
          apartment_id,
          building_id,
          floor,
          apartment_number,
          monthly_fee
        FROM apartments
        ORDER BY building_id, apartment_number;
      `

      // Fetch members for each apartment
      const apartmentsWithMembers = await Promise.all(
        apartments.map(async (apartment) => {
          const members = await db<{userId: string, fullName: string, email: string}[]>`
            SELECT 
              user_id,
              full_name,
              email
            FROM users
            WHERE apartment_id = ${apartment.apartmentId}
          `
          return {
            ...apartment,
            members: members
          }
        })
      )

      return res.status(200).json({
        success: true,
        message: "Apartments fetched successfully.",
        data: apartmentsWithMembers,
      })
    } catch (error) {
      console.error("Error fetching apartments:", error)
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      })
    }
  }

  res.setHeader("Allow", ["POST", "GET"])
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} Not Allowed`,
  })
}
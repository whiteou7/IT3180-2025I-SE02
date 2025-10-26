import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

/**
 * POST /api/apartments - Create a new apartment
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ apartmentId: number }>>
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
  else {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }
}
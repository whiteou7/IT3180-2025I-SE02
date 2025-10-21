import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import type { APIBody } from "@/types/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<number>>
) {
  if (req.method === "POST") {
    try {
      const { buildingId, floor } = req.body;

      if (buildingId === undefined || floor === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: buildingId and floor.",
        });
      }

      const [newApartment] = await db`
        INSERT INTO apartments (building_id, floor)
        VALUES (${buildingId}, ${floor})
        RETURNING apartment_id;
      `; 

      return res.status(201).json({
        success: true,
        message: "Apartment created successfully.",
        data: newApartment.apartmentId,
      });

    } catch (error) {
      console.error("Error creating apartment:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
  else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
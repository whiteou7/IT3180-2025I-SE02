import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import type { APIBody } from "@/types/api";
import type { Apartment } from "@/types/apartments"; 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Apartment | null>> 
) {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      const { buildingId, floor } = req.body;

      if (buildingId === undefined || floor === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: buildingId and floor.",
        });
      }
      const [updatedApartment] = await db<Apartment[]>`
        UPDATE apartments
        SET building_id = ${buildingId}, floor = ${floor}
        WHERE apartment_id = ${id as string}
        RETURNING *; 
      `; 

      if (!updatedApartment) {
        return res.status(404).json({
          success: false,
          message: "Apartment not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Apartment updated successfully.",
        data: updatedApartment,
      });
    }

    else if (req.method === "DELETE") {
      const [deletedApartment] = await db<Apartment[]>`
        DELETE FROM apartments
        WHERE apartment_id = ${id as string}
        RETURNING apartment_id;
      `; 

      if (!deletedApartment) {
        return res.status(404).json({
          success: false,
          message: "Apartment not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Apartment deleted successfully.",
        data: null,
      });
    }
    else {
      res.setHeader("Allow", ["PUT", "DELETE"]);
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`,
      });
    }

  } catch (error) {
    console.error(`Error processing apartment ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
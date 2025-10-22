import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db"; 

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  const userId = Number(id);

  if (isNaN(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    if (req.method === "PUT") {
      const { apartmentId } = req.body;

      if (!apartmentId) {
        return res.status(400).json({
          success: false,
          message: "Missing apartmentId in request body",
        });
      }

      const result = await db`
        UPDATE users
        SET apartment_id = ${apartmentId}
        WHERE user_id = ${userId}
        RETURNING user_id AS "userId", apartment_id AS "apartmentId";
      `;

      const [updatedUser] = result;

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User added to apartment successfully",
        data: updatedUser,
      });
    }

    else if (req.method === "DELETE") {
      const { apartmentId } = req.body;

      if (!apartmentId) {
        return res.status(400).json({
          success: false,
          message: "Missing apartmentId in request body",
        });
      }

      const [user] = await db`
        SELECT apartment_id FROM users WHERE user_id = ${userId};
      `;

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.apartmentId !== apartmentId) {
        return res.status(400).json({
          success: false,
          message: "User does not belong to this apartment",
        });
      }

      await db`
        UPDATE users
        SET apartment_id = NULL
        WHERE user_id = ${userId};
      `;

      return res.status(200).json({
        success: true,
        message: "User removed from apartment successfully",
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
    console.error("Error in /api/users/[id]/apartments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

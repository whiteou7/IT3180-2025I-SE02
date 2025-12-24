import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Apartment } from "@/types/apartments" 

/**
 * GET /api/apartments/[id] - Get apartment information
 * PUT /api/apartments/[id] - Update apartment information
 * DELETE /api/apartments/[id] - Delete apartment
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Apartment | null>> 
) {
  const { id } = req.query

  try {
    if (req.method === "PUT") {
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
          message: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        })
      }

      const [updatedApartment] = await db<Apartment[]>`
        UPDATE apartments
        SET building_id = ${buildingId}, floor = ${floor}, apartment_number=${apartmentNumber}, monthly_fee=${monthlyFee}
        WHERE apartment_id = ${id as string}
        RETURNING *; 
      ` 

      if (!updatedApartment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy căn hộ.",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật căn hộ thành công.",
        data: updatedApartment,
      })
    }

    else if (req.method === "GET") {
      const [apartment] = await db<Apartment[]>`
        SELECT
          apartment_id,
          building_id,
          floor,
          apartment_number,
          monthly_fee
        FROM apartments
        WHERE apartment_id = ${id as string}
      ` 

      if (!apartment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy căn hộ.",
        })
      }

      // Fetch apartment members
      const members = await db<{userId: string, fullName: string, email: string}[]>`
        SELECT 
          user_id,
          full_name,
          email
        FROM users
        WHERE apartment_id = ${id as string}
      `

      const apartmentWithMembers = {
        ...apartment,
        members: members
      }

      return res.status(200).json({
        success: true,
        message: "Tải thông tin căn hộ thành công",
        data: apartmentWithMembers,
      })
    }

    else if (req.method === "DELETE") {
      const [deletedApartment] = await db<Apartment[]>`
        DELETE FROM apartments
        WHERE apartment_id = ${id as string}
        RETURNING apartment_id;
      ` 

      if (!deletedApartment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy căn hộ.",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Xóa căn hộ thành công.",
        data: null,
      })
    }

    else {
      res.setHeader("Allow", ["PUT", "GET", "DELETE"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }

  } catch (error) {
    console.error(`Error processing apartment ${id}:`, error)
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}
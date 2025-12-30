import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Apartment } from "@/types/apartments"
import {
  validatePositiveInteger,
  validateNonNegativeNumber,
} from "@/lib/validation" 

/**
 * API quản lý căn hộ theo ID
 * GET /api/apartments/[id] - Lấy thông tin chi tiết của một căn hộ
 * PUT /api/apartments/[id] - Cập nhật thông tin căn hộ
 * DELETE /api/apartments/[id] - Xóa căn hộ
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Apartment | null>> 
) {
  // Lấy ID căn hộ từ query parameters
  const { id } = req.query

  try {
    // Xử lý yêu cầu cập nhật thông tin căn hộ
    if (req.method === "PUT") {
      // Lấy thông tin cập nhật từ request body
      const { buildingId, floor, apartmentNumber, monthlyFee } = req.body as {
        buildingId: number;
        floor: number;
        apartmentNumber: number;
        monthlyFee: number;
      }

      // Kiểm tra tính hợp lệ của mã tòa nhà
      const buildingIdValidation = validatePositiveInteger(buildingId, "Mã tòa nhà")
      if (!buildingIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: buildingIdValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của tầng
      const floorValidation = validatePositiveInteger(floor, "Tầng")
      if (!floorValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: floorValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của số căn hộ
      const apartmentNumberValidation = validatePositiveInteger(apartmentNumber, "Số căn hộ")
      if (!apartmentNumberValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: apartmentNumberValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của phí hàng tháng
      const monthlyFeeValidation = validateNonNegativeNumber(monthlyFee, "Phí hàng tháng")
      if (!monthlyFeeValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: monthlyFeeValidation.message,
        })
      }

      // Cập nhật thông tin căn hộ trong database
      const [updatedApartment] = await db<Apartment[]>`
        UPDATE apartments
        SET building_id = ${buildingId}, floor = ${floor}, apartment_number=${apartmentNumber}, monthly_fee=${monthlyFee}
        WHERE apartment_id = ${id as string}
        RETURNING *; 
      ` 

      // Kiểm tra xem căn hộ có tồn tại không
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

    // Xử lý yêu cầu lấy thông tin căn hộ
    else if (req.method === "GET") {
      // Tìm căn hộ theo ID
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

      // Kiểm tra xem căn hộ có tồn tại không
      if (!apartment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy căn hộ.",
        })
      }

      // Lấy danh sách thành viên của căn hộ
      const members = await db<{userId: string, fullName: string, email: string}[]>`
        SELECT 
          user_id,
          full_name,
          email
        FROM users
        WHERE apartment_id = ${id as string}
      `

      // Kết hợp thông tin căn hộ với danh sách thành viên
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

    // Xử lý yêu cầu xóa căn hộ
    else if (req.method === "DELETE") {
      // Xóa căn hộ khỏi database
      const [deletedApartment] = await db<Apartment[]>`
        DELETE FROM apartments
        WHERE apartment_id = ${id as string}
        RETURNING apartment_id;
      ` 

      // Kiểm tra xem căn hộ có tồn tại không
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

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    else {
      res.setHeader("Allow", ["PUT", "GET", "DELETE"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }

  } catch (error) {
    // Xử lý lỗi chung cho tất cả các phương thức
    console.error(`Error processing apartment ${id}:`, error)
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}
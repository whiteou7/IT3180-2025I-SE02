import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Apartment } from "@/types/apartments"
import {
  validatePositiveInteger,
  validateNonNegativeNumber,
} from "@/lib/validation"

/**
 * API quản lý căn hộ
 * POST /api/apartments - Tạo căn hộ mới
 * GET /api/apartments - Lấy danh sách tất cả căn hộ kèm thông tin thành viên
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | APIBody<{ apartmentId: number }>
    | APIBody<Apartment[]>
  >
) {
  // Xử lý yêu cầu tạo căn hộ mới
  if (req.method === "POST") {
    try {
      // Lấy thông tin từ request body
      const { buildingId, floor, apartmentNumber, monthlyFee } = req.body as {
        buildingId: number;
        floor: number;
        apartmentNumber: number;
        monthlyFee: number;
      }

      // Kiểm tra tính hợp lệ của mã tòa nhà (phải là số nguyên dương)
      const buildingIdValidation = validatePositiveInteger(buildingId, "Mã tòa nhà")
      if (!buildingIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: buildingIdValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của tầng (phải là số nguyên dương)
      const floorValidation = validatePositiveInteger(floor, "Tầng")
      if (!floorValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: floorValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của số căn hộ (phải là số nguyên dương)
      const apartmentNumberValidation = validatePositiveInteger(apartmentNumber, "Số căn hộ")
      if (!apartmentNumberValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: apartmentNumberValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của phí hàng tháng (phải là số không âm)
      const monthlyFeeValidation = validateNonNegativeNumber(monthlyFee, "Phí hàng tháng")
      if (!monthlyFeeValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: monthlyFeeValidation.message,
        })
      }

      // Thêm căn hộ mới vào database và trả về ID của căn hộ vừa tạo
      const [newApartment] = await db`
        INSERT INTO apartments (building_id, floor, apartment_number, monthly_fee)
        VALUES (${buildingId}, ${floor}, ${apartmentNumber}, ${monthlyFee})
        RETURNING apartment_id;
      ` 

      return res.status(201).json({
        success: true,
        message: "Tạo căn hộ thành công.",
        data: { apartmentId: newApartment.apartmentId }
      })

    } catch (error) {
      // Xử lý lỗi khi tạo căn hộ
      console.error("Error creating apartment:", error)
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
      })
    }
  }

  // Xử lý yêu cầu lấy danh sách căn hộ
  if (req.method === "GET") {
    try {
      // Lấy danh sách tất cả căn hộ từ database, sắp xếp theo tòa nhà, tầng và số căn hộ
      const apartments = await db<Apartment[]>`
        SELECT 
          apartment_id,
          building_id,
          floor,
          apartment_number,
          monthly_fee
        FROM apartments
        ORDER BY building_id, floor, apartment_number;
      `

      // Lấy thông tin thành viên cho từng căn hộ
      // Sử dụng Promise.all để thực hiện song song các truy vấn, tăng hiệu suất
      const apartmentsWithMembers = await Promise.all(
        apartments.map(async (apartment) => {
          // Tìm tất cả người dùng thuộc căn hộ này
          const members = await db<{userId: string, fullName: string, email: string}[]>`
            SELECT 
              user_id,
              full_name,
              email
            FROM users
            WHERE apartment_id = ${apartment.apartmentId}
          `
          // Trả về thông tin căn hộ kèm danh sách thành viên
          return {
            ...apartment,
            members: members
          }
        })
      )

      return res.status(200).json({
        success: true,
        message: "Tải danh sách căn hộ thành công.",
        data: apartmentsWithMembers,
      })
    } catch (error) {
      // Xử lý lỗi khi lấy danh sách căn hộ
      console.error("Error fetching apartments:", error)
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
      })
    }
  }

  // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
  res.setHeader("Allow", ["POST", "GET"])
  return res.status(405).json({
    success: false,
    message: `Phương thức ${req.method} không được phép`,
  })
}
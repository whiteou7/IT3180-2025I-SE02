import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Vehicle } from "@/types/properties"

/**
 * API tạo phương tiện
 * POST /api/users/[id]/vehicle - Tạo phương tiện mới cho người dùng
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Vehicle | null>>
) {
  // Lấy userId từ query parameters
  const { id: userId } = req.query

  // Kiểm tra userId có tồn tại không
  if (!userId) {
    return res.status(400).json({ success: false, message: "Thiếu mã người dùng" })
  }

  try {
    // Xử lý yêu cầu tạo phương tiện mới
    if (req.method === "POST") {
      // Lấy biển số xe từ request body
      const { licensePlate } = req.body as {
        licensePlate: string;
      }

      // Kiểm tra biển số xe có được cung cấp không
      if (!licensePlate) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập biển số xe",
        })
      }

      // Kiểm tra người dùng có tồn tại không
      const [user] = await db`
        SELECT user_id FROM users WHERE user_id = ${userId};
      `

      if (!user) {
        return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" })
      }

      // Đảm bảo biển số xe là duy nhất
      const [existingVehicle] = await db`
        SELECT vehicle_id FROM vehicles WHERE license_plate = ${licensePlate};
      `

      if (existingVehicle) {
        return res.status(409).json({ success: false, message: "Biển số xe này đã được đăng ký" })
      }

      // Đảm bảo mỗi người dùng chỉ có một phương tiện
      const [existingUserVehicle] = await db`
        SELECT  
          v.vehicle_id 
        FROM 
          vehicles v
        JOIN
          properties p
        ON 
          v.property_id = p.property_id
        WHERE 
          p.user_id = ${userId};
      `

      if (existingUserVehicle) {
        return res.status(409).json({ success: false, message: "Người dùng này đã có phương tiện" })
      }

      // Tạo property (tài sản) cho phương tiện
      const [createdProperty] = await db<{ propertyId: number }[]>`
        INSERT INTO properties (property_name, user_id, is_public, property_type)
        VALUES ('Vehicle', ${userId}, ${false}, 'vehicle')
        RETURNING property_id;
      `

      if (!createdProperty) {
        return res.status(500).json({ success: false, message: "Không thể tạo tài sản. Vui lòng thử lại." })
      }

      // Tạo phương tiện liên kết với property
      const [createdVehicle] = await db<{ vehicleId: number }[]>`
        INSERT INTO vehicles (property_id, license_plate)
        VALUES (${createdProperty.propertyId}, ${licensePlate})
        RETURNING vehicle_id;
      `

      return res.status(201).json({
        success: true,
        message: "Đã tạo phương tiện thành công",
        data: {
          vehicleId: createdVehicle.vehicleId,
          propertyId: createdProperty.propertyId,
          licensePlate,
        },
      })
    }

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/vehicle:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

type VehicleInfo = {
  vehicleId: number
  propertyId: number
  licensePlate: string
}

/**
 * API cập nhật phương tiện
 * PUT /api/users/[id]/vehicle/[vehicleId] - Cập nhật biển số xe
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<VehicleInfo | null>>
) {
  // Lấy userId và vehicleId từ query parameters
  const { id: userId, vehicleId } = req.query

  // Kiểm tra userId và vehicleId có tồn tại không
  if (!userId || !vehicleId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng hoặc mã phương tiện",
    })
  }

  // Chỉ chấp nhận phương thức PUT
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Lấy biển số xe từ request body
    const { licensePlate } = req.body as {
      licensePlate: string
    }

    // Kiểm tra biển số xe có được cung cấp không
    if (!licensePlate) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập biển số xe",
      })
    }

    // Cập nhật biển số xe của phương tiện
    const [updatedVehicle] = await db<VehicleInfo[]>`
      UPDATE vehicles
      SET license_plate = ${licensePlate}
      WHERE vehicle_id = ${vehicleId as string}
      RETURNING *;
    `

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phương tiện",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật biển số xe thành công",
      data: updatedVehicle,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/vehicle/[vehicleId]:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

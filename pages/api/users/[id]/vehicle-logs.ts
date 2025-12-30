import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

type VehicleLogEntry = {
  vehicleLogId: string
  entranceTime: Date
  exitTime: Date | null
}

/**
 * API quản lý nhật ký phương tiện của người dùng
 * GET /api/users/[id]/vehicle-logs - Lấy nhật ký phương tiện của người dùng
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<VehicleLogEntry[]>>
) {
  // Lấy userId từ query parameters
  const { id: userId } = req.query

  // Kiểm tra userId có tồn tại không
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  // Chỉ chấp nhận phương thức GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Lấy nhật ký ra vào của phương tiện thuộc về người dùng
    // Kết hợp với bảng vehicles và properties để tìm phương tiện của người dùng
    const logs = await db<VehicleLogEntry[]>`
      SELECT 
        vl.vehicle_log_id,
        vl.entrance_time,
        vl.exit_time
      FROM 
        vehicle_logs vl
      JOIN
        vehicles v
      ON 
        vl.vehicle_id = v.vehicle_id
      JOIN
        properties p
      ON 
        v.property_id = p.property_id
      WHERE 
        p.user_id = ${userId as string}
      ORDER BY 
        vl.entrance_time DESC;
    `

    return res.status(200).json({
      success: true,
      message: "Tải nhật ký ra vào thành công",
      data: logs,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/vehicle-logs:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

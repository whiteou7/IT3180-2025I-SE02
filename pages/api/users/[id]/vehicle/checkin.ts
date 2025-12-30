import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

/**
 * API check-in/check-out phương tiện
 * POST /api/users/[id]/vehicle/checkin - Chuyển đổi trạng thái vào/ra của phương tiện
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ time: string }>>
) {
  // Lấy userId từ query parameters
  const { id: userId } = req.query

  // Kiểm tra userId có tồn tại và là string không
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ 
      success: false, 
      message: "Thiếu mã người dùng" 
    })
  }

  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ 
      success: false, 
      message: `Phương thức ${req.method} không được phép` 
    })
  }

  try {
    // Kiểm tra người dùng có tồn tại không
    const [user] = await db`
      SELECT user_id FROM users WHERE user_id = ${userId};
    `

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy người dùng" 
      })
    }

    // Tìm phương tiện của người dùng (mối quan hệ 1-1)
    // Kết hợp với bảng properties để tìm phương tiện thuộc về người dùng
    const [vehicle] = await db`
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

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy phương tiện của người dùng này" 
      })
    }

    // Lấy bản ghi nhật ký mới nhất của phương tiện này
    const [latestLog] = await db`
      SELECT 
        vehicle_log_id,
        entrance_time,
        exit_time
      FROM 
        vehicle_logs
      WHERE 
        vehicle_id = ${vehicle.vehicleId}
      ORDER BY 
        entrance_time DESC
      LIMIT 1;
    `

    const currentTime = new Date().toISOString()

    // Kiểm tra trạng thái hiện tại của phương tiện
    if (!latestLog || latestLog.exitTime !== null) {
      // Không có nhật ký hoặc phương tiện đang ở bên ngoài - tạo bản ghi mới (vào)
      await db`
        INSERT INTO vehicle_logs (vehicle_id, entrance_time, exit_time)
        VALUES (${vehicle.vehicleId}, ${currentTime}, NULL);
      `

      return res.status(200).json({
        success: true,
        message: "Đã ghi nhận xe vào",
        data: { time: currentTime }
      })
    } else {
      // Phương tiện đang ở bên trong - cập nhật thời gian ra (ra)
      await db`
        UPDATE vehicle_logs 
        SET exit_time = ${currentTime}
        WHERE vehicle_log_id = ${latestLog.vehicleLogId};
      `

      return res.status(200).json({
        success: true,
        message: "Đã ghi nhận xe ra",
        data: { time: currentTime }
      })
    }

  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/vehicle/checkin:", error)
    return res.status(500).json({ 
      success: false, 
      message: (error as Error).message 
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db" 
import type { APIBody } from "@/types/api" 
import type { VehicleLog } from "@/types/vehicles" 

/**
 * API quản lý nhật ký ra vào phương tiện
 * GET /api/vehicles/checkin - Lấy nhật ký ra vào phương tiện với các tùy chọn lọc
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ logs: VehicleLog[] }>> 
) {
  // Chỉ chấp nhận phương thức GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Lấy các tham số lọc từ query
    const { userId, filter } = req.query as {
      userId?: string;
      filter?: "week" | "month" | "year" |"daily";
    }
    
    // Xây dựng truy vấn cơ bản
    // Kết hợp với bảng vehicles, properties, users và apartments để lấy đầy đủ thông tin
    let baseQuery = db<VehicleLog[]>`
      SELECT 
        vl.vehicle_log_id,
        vl.entrance_time,
        vl.exit_time,
        v.vehicle_id,
        v.license_plate,
        u.user_id,
        u.full_name,
        u.apartment_id,
        a.apartment_number,
        a.building_id,
        a.floor
      FROM 
        vehicle_logs vl
      JOIN 
        vehicles v ON vl.vehicle_id = v.vehicle_id
      JOIN 
        properties p ON p.property_id = v.property_id
      LEFT JOIN 
        users u ON u.user_id = p.user_id
      LEFT JOIN 
        apartments a ON a.apartment_id = u.apartment_id
    `

    // Xây dựng các điều kiện WHERE động
    const whereClauses = []
    
    // Lọc theo userId nếu được cung cấp
    if (userId) {
      whereClauses.push(db`u.user_id = ${userId as string}`)
    }

    // Lọc theo khoảng thời gian
    if (filter === "week") {
      // Lọc nhật ký trong 7 ngày qua
      whereClauses.push(db`vl.entrance_time >= NOW() - '7 days'::interval`)
    } else if (filter === "month") {
      // Lọc nhật ký trong 1 tháng qua
      whereClauses.push(db`vl.entrance_time >= NOW() - '1 month'::interval`)
    } else if (filter === "year") {
      // Lọc nhật ký trong 1 năm qua
      whereClauses.push(db`vl.entrance_time >= NOW() - '1 year'::interval`)
    } else if (filter == "daily") {
      // Lọc nhật ký trong 1 ngày qua
      whereClauses.push(db`vl.entrance_time >= NOW() - '1 day'::interval`)
    }

    // Kết hợp tất cả các điều kiện WHERE
    if (whereClauses.length > 0) {
      const combinedWhere = whereClauses.reduce(
        (prev, curr) => db`${prev} AND ${curr}`
      )
      baseQuery = db<VehicleLog[]>`${baseQuery} WHERE ${combinedWhere}`
    }

    // Thực thi truy vấn và sắp xếp theo thời gian vào mới nhất
    const logs = await db<VehicleLog[]>`${baseQuery} ORDER BY vl.entrance_time DESC`

    return res.status(200).json({
      success: true,
      message: "Tải nhật ký ra vào thành công.",
      data: {
        logs,
      },
    })

  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error fetching vehicle logs:", error)
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}
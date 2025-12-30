import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Property } from "@/types/properties"
import type { UserRole } from "@/types/enum"

/**
 * API quản lý tài sản của người dùng
 * GET /api/users/[id]/properties - Lấy tất cả tài sản của một người dùng
 * POST /api/users/[id]/properties - Tạo tài sản mới cho người dùng
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Property | Property[] | { propertyId: number }>>
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

  try {
    // Xử lý yêu cầu lấy danh sách tài sản
    if (req.method === "GET") {
      // Lấy tất cả tài sản của người dùng
      // Kết hợp với bảng vehicles để lấy biển số xe (nếu có)
      const properties = await db<Property[]>`
        SELECT 
          p.property_id,
          p.property_name,
          p.user_id,
          p.is_public,
          p.property_type,
          p.status,
          p.created_at,
          v.license_plate
        FROM properties p
        LEFT JOIN vehicles v ON v.property_id = p.property_id
        WHERE p.user_id = ${userId as string}
        ORDER BY p.created_at DESC;
      `

      return res.status(200).json({
        success: true,
        message: "Tải danh sách tài sản thành công",
        data: properties,
      })
    }

    // Xử lý yêu cầu tạo tài sản mới
    if (req.method === "POST") {
      // Lấy thông tin tài sản từ request body
      const { propertyName, propertyType, isPublic, licensePlate } = req.body as {
        propertyName: string
        propertyType?: string
        isPublic?: boolean
        licensePlate?: string
      }

      // Kiểm tra tên tài sản có được cung cấp không
      if (!propertyName) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập tên tài sản",
        })
      }

      // Kiểm tra người dùng có tồn tại và lấy role của họ
      const [userRecord] = await db<{ role: UserRole }[]>`
        SELECT role FROM users WHERE user_id = ${userId as string}
      `

      if (!userRecord) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      // Xử lý loại tài sản và trạng thái công khai
      const requestedType = propertyType ?? "general"
      const requestedPublic = Boolean(isPublic)

      // Kiểm tra quyền: chỉ admin mới có thể đăng ký tài sản công khai
      if (requestedPublic && userRecord.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Chỉ quản trị viên mới có thể đăng ký tài sản công khai",
        })
      }

      // Xử lý đặc biệt cho loại tài sản là phương tiện (vehicle)
      if (requestedType === "vehicle") {
        // Kiểm tra biển số xe có được cung cấp không
        if (!licensePlate?.trim()) {
          return res.status(400).json({
            success: false,
            message: "Vui lòng nhập biển số xe",
          })
        }

        // Kiểm tra xem người dùng đã có phương tiện chưa
        // Mỗi người chỉ được đăng ký 1 phương tiện
        const [existingVehicle] = await db<{ propertyId: number }[]>`
          SELECT property_id
          FROM properties
          WHERE user_id = ${userId as string}
            AND property_type = 'vehicle'
          LIMIT 1;
        `

        if (existingVehicle) {
          return res.status(409).json({
            success: false,
            message: "Mỗi người chỉ có thể đăng ký 1 phương tiện",
          })
        }

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        // Tạo property và vehicle trong cùng một transaction
        const result = await db.begin(async (sql) => {
          // Tạo property mới
          const [newProperty] = await sql<{ propertyId: number }[]>`
            INSERT INTO properties (property_name, user_id, is_public, property_type)
            VALUES (
              ${propertyName},
              ${userId as string},
              ${false},
              ${requestedType}
            )
            RETURNING property_id;
          `

          // Tạo vehicle với biển số xe
          await sql`
            INSERT INTO vehicles (property_id, license_plate)
            VALUES (${newProperty.propertyId}, ${licensePlate})
          `

          return newProperty
        })

        return res.status(201).json({
          success: true,
          message: "Đăng ký phương tiện thành công",
          data: { propertyId: result.propertyId },
        })
      }

      // Tạo tài sản thông thường (không phải phương tiện)
      const [newProperty] = await db<{ propertyId: number }[]>`
        INSERT INTO properties (property_name, user_id, is_public, property_type)
        VALUES (
          ${propertyName},
          ${userId as string},
          ${requestedPublic && userRecord.role === "admin"},
          ${requestedType}
        )
        RETURNING property_id;
      `

      return res.status(201).json({
        success: true,
        message: "Tạo tài sản thành công",
        data: { propertyId: newProperty.propertyId },
      })
    }

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/properties:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

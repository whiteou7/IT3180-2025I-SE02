import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Service } from "@/types/services"
import type { ServiceCategory } from "@/types/enum"
import {
  validateString,
  validateNonNegativeNumber,
  validateTax,
  validatePositiveInteger,
} from "@/lib/validation"

type UpsertBody = {
  serviceName: string
  price: number
  description?: string | null
  tax: number
  category?: ServiceCategory
  isAvailable?: boolean
}

type DeleteBody = {
  serviceId: number
}

/**
 * Hàm helper để parse service ID từ query parameters
 * Xử lý các trường hợp: undefined, string, hoặc array
 * Kiểm tra tính hợp lệ (phải là số nguyên dương)
 */
function parseServiceId(idParam: string | string[] | undefined) {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam
  if (!rawId) {
    return null
  }
  const validation = validatePositiveInteger(rawId, "Mã dịch vụ")
  if (!validation.isValid) {
    return null
  }
  return Number(rawId)
}

/**
 * API quản lý dịch vụ theo ID
 * GET /api/services/[id] - Lấy thông tin một dịch vụ cụ thể theo ID
 * PUT /api/services/[id] - Cập nhật dịch vụ hiện có
 * DELETE /api/services/[id] - Xóa dịch vụ theo ID
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Service | null>>
) {
  // Parse service ID từ query parameters
  const serviceId = parseServiceId(req.query.id)

  // Kiểm tra service ID có hợp lệ không
  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: "Mã dịch vụ không hợp lệ.",
    })
  }

  try {
    // Xử lý yêu cầu lấy thông tin dịch vụ
    if (req.method === "GET") {
      // Tìm dịch vụ theo ID
      const service = await db<Service[]>`
        SELECT 
          service_id,
          service_name,
          price,
          description,
          tax,
          category,
          is_available,
          updated_at
        FROM services
        WHERE service_id = ${serviceId};
      `

      // Kiểm tra xem dịch vụ có tồn tại không
      if (service.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy dịch vụ.",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Tải dịch vụ thành công.",
        data: service[0],
      })
    }

    // Xử lý yêu cầu cập nhật dịch vụ
    if (req.method === "PUT") {
      // Lấy thông tin cập nhật từ request body
      const {
        serviceName,
        price,
        description = null,
        tax,
        category = "other",
        isAvailable = true,
      } = req.body as UpsertBody

      // Kiểm tra tính hợp lệ của tên dịch vụ (không được rỗng)
      const serviceNameValidation = validateString(serviceName, "Tên dịch vụ")
      if (!serviceNameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: serviceNameValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của giá (phải là số không âm)
      const priceValidation = validateNonNegativeNumber(price, "Giá")
      if (!priceValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: priceValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của thuế (phải trong khoảng 0-100)
      const taxValidation = validateTax(tax)
      if (!taxValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: taxValidation.message,
        })
      }

      // Chuyển đổi giá và thuế sang số
      const parsedPrice = Number(price)
      const parsedTax = Number(tax)

      // Danh sách danh mục hợp lệ
      const allowedCategories: ServiceCategory[] = ["cleaning", "maintenance", "utilities", "amenities", "other"]
      // Chuẩn hóa danh mục: nếu không hợp lệ thì mặc định là "other"
      const normalizedCategory: ServiceCategory =
        category && allowedCategories.includes(category) ? category : "other"

      // Cập nhật dịch vụ trong database
      const updatedService = await db<Service[]>`
        UPDATE services
        SET 
          service_name = ${serviceName},
          price = ${parsedPrice},
          description = ${description},
          tax = ${parsedTax},
          category = ${normalizedCategory},
          is_available = ${Boolean(isAvailable)},
          updated_at = NOW()
        WHERE service_id = ${serviceId}
        RETURNING 
          service_id,
          service_name,
          price,
          description,
          tax,
          category,
          is_available,
          updated_at;
      `

      // Kiểm tra xem dịch vụ có tồn tại không
      if (updatedService.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy dịch vụ.",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật dịch vụ thành công.",
        data: updatedService[0],
      })
    }

    // Xử lý yêu cầu xóa dịch vụ
    if (req.method === "DELETE") {
      // Lấy serviceId từ request body để xác nhận
      const { serviceId: bodyServiceId } = req.body as DeleteBody

      // Kiểm tra serviceId trong body có khớp với serviceId trong URL không
      // Đây là biện pháp bảo mật để tránh xóa nhầm
      if (bodyServiceId !== serviceId) {
        return res.status(400).json({
          success: false,
          message: "Mã dịch vụ không khớp.",
        })
      }

      // Xóa dịch vụ khỏi database
      const deletedService = await db<Service[]>`
        DELETE FROM services
        WHERE service_id = ${serviceId}
        RETURNING 
          service_id,
          service_name,
          price,
          description,
          tax;
      `

      // Kiểm tra xem dịch vụ có tồn tại không
      if (deletedService.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy dịch vụ.",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Xóa dịch vụ thành công.",
        data: null,
      })
    }

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error handling service request:", error)
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Service } from "@/types/services"
import type { ServiceCategory } from "@/types/enum"
import {
  validateString,
  validateNonNegativeNumber,
  validateTax,
} from "@/lib/validation"

type CreateServiceBody = {
  serviceName: string
  price: number
  description?: string | null
  tax: number
  category?: ServiceCategory
  isAvailable?: boolean
}

/**
 * API quản lý dịch vụ
 * GET /api/services - Lấy danh sách dịch vụ (có thể lọc theo danh mục, tìm kiếm, trạng thái)
 * POST /api/services - Tạo dịch vụ mới
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    APIBody<Service[]> | APIBody<{ serviceId: number }>
  >
) {
  // Xử lý yêu cầu lấy danh sách dịch vụ
  if (req.method === "GET") {
    try {
      // Lấy các tham số lọc từ query, xử lý trường hợp mảng
      const categoryFilter = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category
      const searchTerm = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search
      const availabilityFilter = Array.isArray(req.query.availability) ? req.query.availability[0] : req.query.availability
      
      // Lấy tất cả dịch vụ từ database (chỉ lấy các dịch vụ có ID < 100)
      const services = await db<Service[]>`
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
        WHERE service_id < 100
        ORDER BY service_id;
      `

      // Lọc dịch vụ theo các tiêu chí: danh mục, trạng thái khả dụng, và từ khóa tìm kiếm
      const filtered = services.filter((service) => {
        // Kiểm tra khớp với danh mục (nếu có bộ lọc)
        const matchesCategory =
          !categoryFilter || categoryFilter === "all" || service.category === categoryFilter
        // Kiểm tra khớp với trạng thái khả dụng (nếu có bộ lọc)
        const matchesAvailability =
          availabilityFilter === undefined ||
          availabilityFilter === "" ||
          (availabilityFilter === "available" ? service.isAvailable : !service.isAvailable)
        // Kiểm tra khớp với từ khóa tìm kiếm (tìm trong tên và mô tả)
        const matchesSearch =
          !searchTerm ||
          service.serviceName.toLowerCase().includes(String(searchTerm).toLowerCase()) ||
          (service.description ?? "").toLowerCase().includes(String(searchTerm).toLowerCase())
        // Dịch vụ phải thỏa mãn tất cả các điều kiện
        return matchesCategory && matchesAvailability && matchesSearch
      })

      return res.status(200).json({
        success: true,
        message: "Tải danh sách dịch vụ thành công.",
        data: filtered,
      })
    } catch (error) {
      console.error("Error fetching services:", error)
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
      })
    }
  }

  // Xử lý yêu cầu tạo dịch vụ mới
  if (req.method === "POST") {
    try {
      // Lấy thông tin dịch vụ từ request body
      // Các giá trị mặc định: description = null, category = "other", isAvailable = true
      const {
        serviceName,
        price,
        description = null,
        tax,
        category = "other",
        isAvailable = true,
      } = req.body as CreateServiceBody

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
      const normalizedCategory: ServiceCategory = allowedCategories.includes(category)
        ? category
        : "other"

      // Thêm dịch vụ mới vào database
      const [newService] = await db<{ serviceId: number }[]>`
        INSERT INTO services (service_name, price, description, tax, category, is_available)
        VALUES (
          ${serviceName},
          ${parsedPrice},
          ${description},
          ${parsedTax},
          ${normalizedCategory},
          ${Boolean(isAvailable)}
        )
        RETURNING service_id;
      `

      return res.status(201).json({
        success: true,
        message: "Tạo dịch vụ thành công.",
        data: { serviceId: newService.serviceId },
      })
    } catch (error) {
      console.error("Error creating service:", error)
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
      })
    }
  }

  // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
  res.setHeader("Allow", ["GET", "POST"])
  return res.status(405).json({
    success: false,
    message: `Phương thức ${req.method} không được phép`,
  })
}

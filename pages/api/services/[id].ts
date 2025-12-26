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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Service | null>>
) {
  const serviceId = parseServiceId(req.query.id)

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: "Mã dịch vụ không hợp lệ.",
    })
  }

  try {
    if (req.method === "GET") {
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

    if (req.method === "PUT") {
      const {
        serviceName,
        price,
        description = null,
        tax,
        category = "other",
        isAvailable = true,
      } = req.body as UpsertBody

      const serviceNameValidation = validateString(serviceName, "Tên dịch vụ")
      if (!serviceNameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: serviceNameValidation.message,
        })
      }

      const priceValidation = validateNonNegativeNumber(price, "Giá")
      if (!priceValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: priceValidation.message,
        })
      }

      const taxValidation = validateTax(tax)
      if (!taxValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: taxValidation.message,
        })
      }

      const parsedPrice = Number(price)
      const parsedTax = Number(tax)

      const allowedCategories: ServiceCategory[] = ["cleaning", "maintenance", "utilities", "amenities", "other"]
      const normalizedCategory: ServiceCategory =
        category && allowedCategories.includes(category) ? category : "other"

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

    if (req.method === "DELETE") {
      const { serviceId: bodyServiceId } = req.body as DeleteBody

      if (bodyServiceId !== serviceId) {
        return res.status(400).json({
          success: false,
          message: "Mã dịch vụ không khớp.",
        })
      }

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

    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    console.error("Error handling service request:", error)
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

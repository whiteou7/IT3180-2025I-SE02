import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Service } from "@/types/services"
import type { ServiceCategory } from "@/types/enum"

type CreateServiceBody = {
  serviceName: string
  price: number
  description?: string | null
  tax: number
  category?: ServiceCategory
  isAvailable?: boolean
}

/**
 * GET /api/services    - List services
 * POST /api/services   - Create service
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    APIBody<Service[]> | APIBody<{ serviceId: number }>
  >
) {
  if (req.method === "GET") {
    try {
      const categoryFilter = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category
      const searchTerm = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search
      const availabilityFilter = Array.isArray(req.query.availability) ? req.query.availability[0] : req.query.availability
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
        ORDER BY service_id;
      `

      const filtered = services.filter((service) => {
        const matchesCategory =
          !categoryFilter || categoryFilter === "all" || service.category === categoryFilter
        const matchesAvailability =
          availabilityFilter === undefined ||
          availabilityFilter === "" ||
          (availabilityFilter === "available" ? service.isAvailable : !service.isAvailable)
        const matchesSearch =
          !searchTerm ||
          service.serviceName.toLowerCase().includes(String(searchTerm).toLowerCase()) ||
          (service.description ?? "").toLowerCase().includes(String(searchTerm).toLowerCase())
        return matchesCategory && matchesAvailability && matchesSearch
      })

      return res.status(200).json({
        success: true,
        message: "Services fetched successfully.",
        data: filtered,
      })
    } catch (error) {
      console.error("Error fetching services:", error)
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      })
    }
  }

  if (req.method === "POST") {
    try {
      const {
        serviceName,
        price,
        description = null,
        tax,
        category = "other",
        isAvailable = true,
      } = req.body as CreateServiceBody

      if (
        !serviceName ||
        price === undefined ||
        tax === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required body keys",
        })
      }

      const parsedPrice = Number(price)
      const parsedTax = Number(tax)

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a non-negative number",
        })
      }

      if (!Number.isFinite(parsedTax)) {
        return res.status(400).json({
          success: false,
          message: "Tax must be a valid number",
        })
      }

      const allowedCategories: ServiceCategory[] = ["cleaning", "maintenance", "utilities", "amenities", "other"]
      const normalizedCategory: ServiceCategory = allowedCategories.includes(category)
        ? category
        : "other"

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
        message: "Service created successfully.",
        data: { serviceId: newService.serviceId },
      })
    } catch (error) {
      console.error("Error creating service:", error)
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      })
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} Not Allowed`,
  })
}

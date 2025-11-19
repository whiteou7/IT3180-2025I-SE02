import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Service } from "@/types/services"

type UpsertBody = {
  serviceName: string;
  price: number;
  description?: string | null;
  tax: number;
}

type DeleteBody = {
  serviceId: number;
}

function parseServiceId(idParam: string | string[] | undefined) {
  const rawId = Array.isArray(idParam) ? idParam[0] : idParam
  const serviceId = Number(rawId)
  if (!rawId || Number.isNaN(serviceId) || serviceId <= 0) {
    return null
  }
  return serviceId
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Service | null>>
) {
  const serviceId = parseServiceId(req.query.id)

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID",
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
          tax
        FROM services
        WHERE service_id = ${serviceId};
      `

      if (service.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Service fetched successfully.",
        data: service[0],
      })
    }

    if (req.method === "PUT") {
      const {
        serviceName,
        price,
        description = null,
        tax,
      } = req.body as UpsertBody

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

      const updatedService = await db<Service[]>`
        UPDATE services
        SET 
          service_name = ${serviceName},
          price = ${parsedPrice},
          description = ${description},
          tax = ${parsedTax}
        WHERE service_id = ${serviceId}
        RETURNING 
          service_id,
          service_name,
          price,
          description,
          tax;
      `

      if (updatedService.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Service updated successfully.",
        data: updatedService[0],
      })
    }

    if (req.method === "DELETE") {
      const { serviceId: bodyServiceId } = req.body as DeleteBody

      if (bodyServiceId !== serviceId) {
        return res.status(400).json({
          success: false,
          message: "Service ID mismatch",
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
          message: "Service not found",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Service deleted successfully.",
        data: null,
      })
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  } catch (error) {
    console.error("Error handling service request:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    })
  }
}


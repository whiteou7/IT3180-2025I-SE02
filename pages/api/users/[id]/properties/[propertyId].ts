import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { Property } from "@/types/properties"
import type { UserRole } from "@/types/enum"

/**
 * GET /api/users/[id]/properties/[propertyId] - Get a property by ID
 * PUT /api/users/[id]/properties/[propertyId] - Update a property
 * DELETE /api/users/[id]/properties/[propertyId] - Delete a property
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Property | null>>
) {
  const { id: userId, propertyId } = req.query

  if (!userId || !propertyId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng hoặc mã tài sản",
    })
  }

  try {
    if (req.method === "GET") {
      const [property] = await db<Property[]>`
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
        WHERE p.property_id = ${propertyId as string}
          AND p.user_id = ${userId as string};
      `

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tài sản",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Tải tài sản thành công",
        data: property,
      })
    }

    if (req.method === "PUT") {
      const { propertyName, propertyType, status, isPublic, licensePlate } = req.body as {
        propertyName?: string
        propertyType?: string
        status?: string
        isPublic?: boolean
        licensePlate?: string
      }

      if (
        propertyName === undefined &&
        propertyType === undefined &&
        status === undefined &&
        isPublic === undefined &&
        licensePlate === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật",
        })
      }

      const [existingProperty] = await db<Property[]>`
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
        WHERE p.property_id = ${propertyId as string}
          AND p.user_id = ${userId as string};
      `

      if (!existingProperty) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tài sản",
        })
      }

      const [ownerRecord] = await db<{ role: UserRole }[]>`
        SELECT role FROM users WHERE user_id = ${userId as string}
      `

      if (!ownerRecord) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy chủ sở hữu",
        })
      }

      if (
        propertyType !== undefined &&
        propertyType !== existingProperty.propertyType
      ) {
        return res.status(400).json({
          success: false,
          message: "Không thể thay đổi loại tài sản",
        })
      }

      if (
        isPublic === true &&
        ownerRecord.role !== "admin" &&
        !existingProperty.isPublic
      ) {
        return res.status(403).json({
          success: false,
          message: "Chỉ quản trị viên mới có thể đặt tài sản là công khai",
        })
      }

      const safePropertyName = propertyName ?? null
      const safeStatus = status ?? null
      const safeIsPublic = isPublic ?? null

      const [updatedProperty] = await db<Property[]>`
        UPDATE properties
        SET 
          property_name = COALESCE(${safePropertyName}, property_name),
          status = COALESCE(${safeStatus}, status),
          is_public = COALESCE(${safeIsPublic}, is_public)
        WHERE property_id = ${propertyId as string}
          AND user_id = ${userId as string}
        RETURNING property_id,
          property_name,
          user_id,
          is_public,
          property_type,
          status,
          created_at;
      `

      if (!updatedProperty) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tài sản",
        })
      }

      let nextLicensePlate: string | null | undefined = existingProperty.licensePlate ?? null

      if (updatedProperty.propertyType === "vehicle" && licensePlate?.trim()) {
        await db`
          UPDATE vehicles
          SET license_plate = ${licensePlate}
          WHERE property_id = ${updatedProperty.propertyId}
        `
        nextLicensePlate = licensePlate
      }

      const responseData: Property = {
        ...updatedProperty,
        licensePlate: nextLicensePlate,
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật tài sản thành công",
        data: responseData,
      })
    }

    if (req.method === "DELETE") {
      const [deletedProperty] = await db<Property[]>`
        DELETE FROM properties
        WHERE property_id = ${propertyId as string}
          AND user_id = ${userId as string}
        RETURNING *;
      `

      if (!deletedProperty) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tài sản",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Xóa tài sản thành công",
        data: deletedProperty,
      })
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    console.error("Error in /api/users/[id]/properties/[propertyId]:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

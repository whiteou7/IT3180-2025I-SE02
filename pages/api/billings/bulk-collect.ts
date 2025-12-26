import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { randomUUID } from "crypto"

type CollectRentBody = {
  type: "rent"
}

type CollectOtherFeeBody = {
  type: "other"
  name: string
  price: number
}

type BulkCollectBody = CollectRentBody | CollectOtherFeeBody

/**
 * POST /api/billings/bulk-collect
 * Bulk collect fees (rent or other fees) from all users with apartments
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ billingCount: number; serviceId: number }>>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ success: false, message: "Phương thức không được phép" })
  }

  try {
    const body = req.body as BulkCollectBody

    if (body.type === "rent") {
      // Collect rent: get all users with apartments and their monthly fees
      const usersWithApartments = await db<{ userId: string; monthlyFee: number }[]>`
        SELECT 
          u.user_id
          a.monthly_fee
        FROM users u
        INNER JOIN apartments a ON u.apartment_id = a.apartment_id
        WHERE u.apartment_id IS NOT NULL
      `

      if (usersWithApartments.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Không có cư dân nào có căn hộ để thu tiền nhà.",
          data: { billingCount: 0, serviceId: 0 },
        })
      }

      // Group by monthly fee to create/retrieve services
      const feeGroups = new Map<number, number>() // fee -> serviceId
      const uniqueFees = [...new Set(usersWithApartments.map((u) => u.monthlyFee))]

      // Check existing services or create new ones
      for (const fee of uniqueFees) {
        const [existing] = await db<{ serviceId: number }[]>`
          SELECT service_id
          FROM services
          WHERE service_id = ${fee}
        `

        if (existing) {
          feeGroups.set(fee, existing.serviceId)
        } else {
          // Create new service with service_id = fee, name = "monthly fee"
          await db`
            INSERT INTO services (service_id, service_name, price, description, tax, category, is_available)
            VALUES (${fee}, 'monthly fee', ${fee}, NULL, 0, 'other', FALSE)
          `
          feeGroups.set(fee, fee)
        }
      }

      // Create billings for all users
      const now = new Date()
      const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      const periodStart = now
      const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000)

      const billingRecords = usersWithApartments.map((user) => {
        const serviceId = feeGroups.get(user.monthlyFee)!
        const billingId = randomUUID()
        return {
          billing_id: billingId,
          user_id: user.userId,
          service_id: serviceId,
          billing_status: "unpaid",
          used_at: now,
          due_date: dueDate,
          period_start: periodStart,
          period_end: periodEnd,
        }
      })

      // Insert all billings
      await db`
        INSERT INTO billings ${db(billingRecords)}
      `

      return res.status(201).json({
        success: true,
        message: `Đã tạo hóa đơn tiền nhà cho ${billingRecords.length} cư dân.`,
        data: { billingCount: billingRecords.length, serviceId: 0 },
      })
    } else if (body.type === "other") {
      const { name, price } = body as CollectOtherFeeBody

      if (!name || price === undefined || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Tên và giá phải được cung cấp, giá phải không âm.",
        })
      }

      // Generate random service ID between 999000 and 999999
      let serviceId: number
      let attempts = 0
      do {
        serviceId = Math.floor(Math.random() * (999999 - 999000 + 1)) + 999000
        attempts++
        if (attempts > 100) {
          return res.status(500).json({
            success: false,
            message: "Không thể tạo ID dịch vụ duy nhất. Vui lòng thử lại.",
          })
        }
      } while (
        await db<{ count: number }[]>`
          SELECT COUNT(*) AS count
          FROM services
          WHERE service_id = ${serviceId}
        `.then((result) => result[0]?.count > 0)
      )

      // Create service with specific service_id
      // PostgreSQL allows inserting specific values into SERIAL columns
      await db`
        INSERT INTO services (service_id, service_name, price, description, tax, category, is_available)
        VALUES (${serviceId}, ${name}, ${price}, NULL, 0, 'other', FALSE)
      `

      // Get all users with apartments
      const usersWithApartments = await db<{ userId: string }[]>`
        SELECT user_id
        FROM users
        WHERE apartment_id IS NOT NULL
      `

      if (usersWithApartments.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Không có cư dân nào có căn hộ để thu phí.",
          data: { billingCount: 0, serviceId },
        })
      }

      // Create billings for all users
      const now = new Date()
      const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      const periodStart = now
      const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000)

      const billingRecords = usersWithApartments.map((user) => {
        const billingId = randomUUID()
        return {
          billing_id: billingId,
          user_id: user.userId,
          service_id: serviceId,
          billing_status: "unpaid",
          used_at: now,
          due_date: dueDate,
          period_start: periodStart,
          period_end: periodEnd,
        }
      })

      // Insert all billings
      await db`
        INSERT INTO billings ${db(billingRecords)}
      `

      return res.status(201).json({
        success: true,
        message: `Đã tạo hóa đơn "${name}" cho ${billingRecords.length} cư dân.`,
        data: { billingCount: billingRecords.length, serviceId },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Loại thu phí không hợp lệ.",
      })
    }
  } catch (error) {
    console.error("Error in bulk collect:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message || "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

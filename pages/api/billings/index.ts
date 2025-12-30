import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { BillingSummary } from "@/types/billings"
import type { BillingStatus } from "@/types/enum"
import { randomUUID } from "crypto"
import {
  validateUUID,
  validateNumberArray,
  validateDate,
} from "@/lib/validation"

type RawBillingFromDB = {
  billingId: string
  userId: string
  fullName: string
  billingStatus: string
  dueDate: string
  periodStart: string
  periodEnd: string
  paidAt: string | null
  serviceCount: number | string
  totalAmount: number | string
  services: Array<{
    serviceId: number
    serviceName: string
    price: number | string
    description: string | null
    tax: number | string
  }> | null
  usedAt: string
}

/**
 * GET /api/billings - Retrieve billing summaries with optional filtering
 *   Query params:
 *     - userId: Filter by user ID (optional)
 *     - status: Filter by billing status (optional)
 * POST /api/billings - Create a new billing record for a user with specified services
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ billingId: string } | BillingSummary[] | null>>
) {
  if (req.method === "GET") {
    try {
      const userIdParam = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId
      const statusParam = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status

      // Build query with conditional WHERE clauses using template literals
      let result: RawBillingFromDB[]

      if (userIdParam && statusParam) {
        // Both filters
        result = await db<RawBillingFromDB[]>`
          SELECT 
            b.billing_id,
            b.user_id,
            u.full_name,
            MAX(b.billing_status) as billing_status,
            MAX(b.due_date) as due_date,
            MIN(b.period_start) as period_start,
            MAX(b.period_end) as period_end,
            MAX(b.paid_at) as paid_at,
            COUNT(*) as service_count,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            json_agg(
              json_build_object(
                'serviceId', s.service_id,
                'serviceName', s.service_name,
                'price', s.price,
                'description', s.description,
                'tax', s.tax
              ) ORDER BY s.service_id
            ) as services,
            MAX(b.used_at) as used_at
          FROM billings b
          JOIN users u ON u.user_id = b.user_id
          JOIN services s ON s.service_id = b.service_id
          WHERE b.user_id = ${userIdParam} AND b.billing_status = ${statusParam}
          GROUP BY b.billing_id, b.user_id, u.full_name
          ORDER BY MAX(b.used_at) DESC
        `
      } else if (userIdParam) {
        // User filter only
        result = await db<RawBillingFromDB[]>`
          SELECT 
            b.billing_id,
            b.user_id,
            u.full_name,
            MAX(b.billing_status) as billing_status,
            MAX(b.due_date) as due_date,
            MIN(b.period_start) as period_start,
            MAX(b.period_end) as period_end,
            MAX(b.paid_at) as paid_at,
            COUNT(*) as service_count,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            json_agg(
              json_build_object(
                'serviceId', s.service_id,
                'serviceName', s.service_name,
                'price', s.price,
                'description', s.description,
                'tax', s.tax
              ) ORDER BY s.service_id
            ) as services,
            MAX(b.used_at) as used_at
          FROM billings b
          JOIN users u ON u.user_id = b.user_id
          JOIN services s ON s.service_id = b.service_id
          WHERE b.user_id = ${userIdParam}
          GROUP BY b.billing_id, b.user_id, u.full_name
          ORDER BY MAX(b.used_at) DESC
        `
      } else if (statusParam) {
        // Status filter only
        result = await db<RawBillingFromDB[]>`
          SELECT 
            b.billing_id,
            b.user_id,
            u.full_name,
            MAX(b.billing_status) as billing_status,
            MAX(b.due_date) as due_date,
            MIN(b.period_start) as period_start,
            MAX(b.period_end) as period_end,
            MAX(b.paid_at) as paid_at,
            COUNT(*) as service_count,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            json_agg(
              json_build_object(
                'serviceId', s.service_id,
                'serviceName', s.service_name,
                'price', s.price,
                'description', s.description,
                'tax', s.tax
              ) ORDER BY s.service_id
            ) as services,
            MAX(b.used_at) as used_at
          FROM billings b
          JOIN users u ON u.user_id = b.user_id
          JOIN services s ON s.service_id = b.service_id
          WHERE b.billing_status = ${statusParam}
          GROUP BY b.billing_id, b.user_id, u.full_name
          ORDER BY MAX(b.used_at) DESC
        `
      } else {
        // No filters
        result = await db<RawBillingFromDB[]>`
          SELECT 
            b.billing_id,
            b.user_id,
            u.full_name,
            MAX(b.billing_status) as billing_status,
            MAX(b.due_date) as due_date,
            MIN(b.period_start) as period_start,
            MAX(b.period_end) as period_end,
            MAX(b.paid_at) as paid_at,
            COUNT(*) as service_count,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            json_agg(
              json_build_object(
                'serviceId', s.service_id,
                'serviceName', s.service_name,
                'price', s.price,
                'description', s.description,
                'tax', s.tax
              ) ORDER BY s.service_id
            ) as services,
            MAX(b.used_at) as used_at
          FROM billings b
          JOIN users u ON u.user_id = b.user_id
          JOIN services s ON s.service_id = b.service_id
          GROUP BY b.billing_id, b.user_id, u.full_name
          ORDER BY MAX(b.used_at) DESC
        `
      }

      const payload: BillingSummary[] = result.map((row) => ({
        billingId: row.billingId,
        userId: row.userId,
        fullName: row.fullName,
        billingStatus: row.billingStatus as BillingStatus,
        dueDate: row.dueDate,
        periodStart: row.periodStart,
        periodEnd: row.periodEnd,
        paidAt: row.paidAt ?? null,
        totalAmount: Number(row.totalAmount ?? 0),
        serviceCount: Number(row.serviceCount ?? 0),
        services: (row.services ?? []) as BillingSummary["services"],
      }))

      return res.status(200).json({
        success: true,
        message: "Tải danh sách thanh toán thành công.",
        data: payload,
      })
    } catch (error) {
      console.error("Error fetching billings:", error)
      return res.status(500).json({
        success: false,
        message: (error as Error).message || "Lỗi máy chủ nội bộ",
      })
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({ success: false, message: "Phương thức không được phép" })
  }

  const { userId, serviceIds, dueDate, periodStart, periodEnd } = req.body as {
    userId: string
    serviceIds: number[]
    dueDate?: string
    periodStart?: string
    periodEnd?: string
  }

  const userIdValidation = validateUUID(userId, "Mã người dùng")
  if (!userIdValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: userIdValidation.message,
    })
  }

  const serviceIdsValidation = validateNumberArray(serviceIds, "Danh sách dịch vụ")
  if (!serviceIdsValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: serviceIdsValidation.message,
    })
  }

  // Validate optional date fields
  if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
    const dueDateValidation = validateDate(dueDate, "Ngày đến hạn")
    if (!dueDateValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: dueDateValidation.message,
      })
    }
  }

  if (periodStart !== undefined && periodStart !== null && periodStart !== "") {
    const periodStartValidation = validateDate(periodStart, "Ngày bắt đầu kỳ")
    if (!periodStartValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: periodStartValidation.message,
      })
    }
  }

  if (periodEnd !== undefined && periodEnd !== null && periodEnd !== "") {
    const periodEndValidation = validateDate(periodEnd, "Ngày kết thúc kỳ")
    if (!periodEndValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: periodEndValidation.message,
      })
    }
  }

  try {
    const newBillingId = await db.begin(async (sql) => {
      const billingId = randomUUID()
      const uniqueServiceIds = [...new Set(serviceIds)]
      const services = await sql`
        SELECT service_id FROM services WHERE service_id IN ${sql(uniqueServiceIds)}
      `

      if (services.length !== uniqueServiceIds.length) {
        throw new Error("Một hoặc nhiều dịch vụ không hợp lệ.")
      }

      const now = new Date()
      const parsedDueDate = dueDate ? new Date(dueDate) : new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      const parsedPeriodStart = periodStart ? new Date(periodStart) : now
      const parsedPeriodEnd = periodEnd
        ? new Date(periodEnd)
        : new Date(parsedPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000)

      const billingRecords = serviceIds.map((sid) => ({
        billing_id: billingId,
        user_id: userId,
        service_id: sid,
        billing_status: "unpaid",
        used_at: now,
        due_date: parsedDueDate,
        period_start: parsedPeriodStart,
        period_end: parsedPeriodEnd,
      }))

      await sql`
        INSERT INTO billings ${sql(billingRecords)}
      `

      return billingId
    })

    return res.status(201).json({
      success: true,
      message: "Tạo thanh toán thành công.",
      data: { billingId: newBillingId },
    })
  } catch (error) {
    console.error("Error creating billing:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message || "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}
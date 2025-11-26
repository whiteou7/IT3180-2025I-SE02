import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { BillingSummary } from "@/types/billings"
import type { BillingStatus } from "@/types/enum"
import { randomUUID } from "crypto"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ billingId: string } | BillingSummary[] | null>>
) {
  if (req.method === "GET") {
    try {
      const userIdParam = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId
      const statusParam = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status
      const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit
      const filters: string[] = []
      const values: (string | number)[] = []

      if (userIdParam) {
        values.push(userIdParam)
        filters.push(`b.user_id = $${values.length}`)
      }

      if (statusParam) {
        values.push(statusParam)
        filters.push(`b.billing_status = $${values.length}`)
      }

      const limit = Math.min(Math.max(Number(limitParam) || 25, 1), 200)
      values.push(limit)
      const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : ""
      const query = `
        SELECT 
          b.billing_id AS "billingId",
          b.user_id AS "userId",
          u.full_name AS "fullName",
          MAX(b.billing_status) AS "billingStatus",
          MAX(b.due_date) AS "dueDate",
          MIN(b.period_start) AS "periodStart",
          MAX(b.period_end) AS "periodEnd",
          MAX(b.paid_at) AS "paidAt",
          COUNT(*) AS "serviceCount",
          SUM(s.price + (s.price * s.tax / 100)) AS "totalAmount",
          json_agg(
            json_build_object(
              'serviceId', s.service_id,
              'serviceName', s.service_name,
              'price', s.price,
              'description', s.description,
              'tax', s.tax
            )
            ORDER BY s.service_id
          ) AS "services"
        FROM billings b
        JOIN users u ON u.user_id = b.user_id
        JOIN services s ON s.service_id = b.service_id
        ${whereClause}
        GROUP BY b.billing_id, b.user_id, u.full_name
        ORDER BY MAX(b.used_at) DESC
        LIMIT $${values.length}
      `

      const rows = await db.unsafe(query, values)
      const payload: BillingSummary[] = rows.map((row) => ({
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
        message: "Billings fetched successfully.",
        data: payload,
      })
    } catch (error) {
      console.error("Error fetching billings:", error)
      return res.status(500).json({
        success: false,
        message: (error as Error).message || "Internal Server Error",
      })
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({ success: false, message: "Method Not Allowed" })
  }

  const { userId, serviceIds, dueDate, periodStart, periodEnd } = req.body as {
    userId: string
    serviceIds: number[]
    dueDate?: string
    periodStart?: string
    periodEnd?: string
  }

  if (!userId || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "userId and serviceIds (non-empty array) are required",
    })
  }

  try {
    const newBillingId = await db.begin(async (sql) => {
      const billingId = randomUUID()
      const services = await sql`
        SELECT service_id FROM services WHERE service_id IN ${sql(serviceIds)}
      `

      if (services.length !== serviceIds.length) {
        throw new Error("One or more services are invalid.")
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
      message: "Billing created successfully.",
      data: { billingId: newBillingId },
    })
  } catch (error) {
    console.error("Error creating billing:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message || "Internal Server Error",
    })
  }
}
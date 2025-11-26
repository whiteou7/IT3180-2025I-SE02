import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { BillingDetail, BillingService } from "@/types/billings"

type RawServiceFromDB = {
  serviceId: number
  serviceName: string
  price: number | string
  tax: number | string
  description: string | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<BillingDetail[]>>
) {
  const { id: userId } = req.query

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({ success: false, message: "Method Not Allowed" })
  }

  try {
    const result = await db`
      SELECT 
        b.billing_id,
        b.user_id,
        u.full_name,
        MAX(b.billing_status) as billing_status, 
        MAX(b.used_at) as used_at,
        MAX(b.due_date) as due_date,
        MIN(b.period_start) as period_start,
        MAX(b.period_end) as period_end,
        MAX(b.paid_at) as paid_at,
        json_agg(
          json_build_object(
            'serviceId', s.service_id,
            'serviceName', s.service_name,
            'price', s.price,
            'tax', s.tax,
            'description', s.description
          ) ORDER BY s.service_id
        ) as services
      FROM billings b
      JOIN users u ON b.user_id = u.user_id
      JOIN services s ON b.service_id = s.service_id
      WHERE b.user_id = ${userId as string}
      GROUP BY b.billing_id, b.user_id, u.full_name
      ORDER BY used_at DESC
    `

    const billings: BillingDetail[] = result.map((row) => {
      const servicesList = (row.services || []) as RawServiceFromDB[]

      const totalPrice = servicesList.reduce((sum: number, s: RawServiceFromDB) => {
        const price = Number(s.price)
        const tax = Number(s.tax)
        return sum + price + (price * tax / 100)
      }, 0)

      return {
        billingId: row.billingId,
        userId: row.userId,
        fullName: row.fullName,
        totalPrice,
        billingStatus: row.billingStatus,
        dueDate: row.dueDate,
        periodStart: row.periodStart,
        periodEnd: row.periodEnd,
        paidAt: row.paidAt,
        
        services: servicesList.map((s: RawServiceFromDB): BillingService => ({
          serviceId: s.serviceId,    
          serviceName: s.serviceName,
          price: Number(s.price),
          tax: Number(s.tax),
          description: s.description
        }))
      }
    })

    return res.status(200).json({
      success: true,
      message: "User billings fetched successfully.",
      data: billings,
    })

  } catch (error: unknown) {
    console.error("Error fetching user billings:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error"
    return res.status(500).json({ 
      success: false, 
      message: errorMessage
    })
  }
}
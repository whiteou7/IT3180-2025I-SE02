import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { BillingDetail } from "@/types/billings"

/**
 * GET /api/billings/[id] - Retrieve detailed billing information by billing ID
 * PUT /api/billings/[id] - Mark a billing as paid and update payment timestamp
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<BillingDetail | null>>
) {
  const { id } = req.query

  if (!id) return res.status(400).json({ success: false, message: "Mã thanh toán là bắt buộc" })

  try {
    if (req.method === "GET") {
      const result = await db`
        SELECT 
          b.billing_id,
          b.user_id,
          b.billing_status,
          b.used_at,
          b.due_date,
          b.period_start,
          b.period_end,
          b.paid_at,
          u.full_name,
          s.service_id,
          s.service_name,
          s.price,
          s.tax,
          s.description
        FROM billings b
        JOIN users u ON b.user_id = u.user_id
        JOIN services s ON b.service_id = s.service_id
        WHERE b.billing_id = ${id as string}
      `

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán" })
      }

      const firstRow = result[0]
      
      const totalPrice = result.reduce((sum, row) => {
        const price = Number(row.price)
        const tax = Number(row.tax)
        return sum + price + (price * tax / 100)
      }, 0)

      const billingData: BillingDetail = {
        billingId: firstRow.billingId,        
        userId: firstRow.userId,              
        fullName: firstRow.fullName,          
        totalPrice: totalPrice,
        billingStatus: firstRow.billingStatus as BillingDetail["billingStatus"],
        dueDate: firstRow.dueDate,
        periodStart: firstRow.periodStart,
        periodEnd: firstRow.periodEnd,
        paidAt: firstRow.paidAt ?? null,
        
        services: result.map(row => ({
          serviceId: row.serviceId,
          serviceName: row.serviceName,
          price: Number(row.price),
          tax: Number(row.tax),
          description: row.description
        }))
      }

      return res.status(200).json({
        success: true,
        message: "Tải chi tiết thanh toán thành công.",
        data: billingData,
      })
    }

    else if (req.method === "PUT") {
      const updated = await db`
        UPDATE billings 
        SET billing_status = 'paid',
            paid_at = NOW()
        WHERE billing_id = ${id as string}
        RETURNING billing_id
      `

      if (updated.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán" })
      }

      return res.status(200).json({
        success: true,
        message: "Thanh toán thành công.",
        data: null,
      })
    }
    
    else {
      res.setHeader("Allow", ["GET", "PUT"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }

  } catch (error: unknown) {
    console.error("Error processing billing:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" })
  }
}
import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { TaxReport } from "@/types/billings"
type TaxReportResponse = APIBody<TaxReport>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaxReportResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }

  const { month } = req.query

  try {
    const monthNumber =
      month === "current" || month === undefined
        ? new Date().getMonth() + 1
        : Number(month)

    if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month. Use 1-12 or 'current'.",
      })
    }

    const rows = await db<{
      billingId: string
      serviceId: number
      serviceName: string
      price: number
      description: string | null
      tax: number
      usedAt: string
      billingStatus: string
    }[]>`
      SELECT
        b.billing_id,
        s.service_id,
        s.service_name,
        s.price,
        s.description,
        s.tax,
        b.used_at,
        b.billing_status
      FROM billings b
      JOIN services s ON s.service_id = b.service_id
      WHERE EXTRACT(MONTH FROM b.used_at) = ${monthNumber}
        AND b.billing_status = 'unpaid';
    `

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No billings found for selected month",
        data: {
          billingIds: [],
          totalIncome: 0,
          totalTax: 0,
        },
      })
    }

    const billingIds = rows.map((row) => row.billingId)

    const baseIncome = rows.reduce((sum, row) => sum + Number(row.price), 0)
    const totalTax = Number((baseIncome * 0.08).toFixed(2))
    const totalIncome = Number((baseIncome + totalTax).toFixed(2))

    const report: TaxReport = {
      billingIds,
      totalIncome,
      totalTax,
    }

    return res.status(200).json({
      success: true,
      message: "Monthly tax report generated",
      data: report,
    })
  } catch (error) {
    console.error("Error generating tax report:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly tax report",
    })
  }
}



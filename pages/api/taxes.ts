import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { TaxReport } from "@/types/billings"
type TaxReportResponse = APIBody<TaxReport>

/**
 * API báo cáo thuế
 * GET /api/taxes - Tạo báo cáo thuế cho các hóa đơn chưa thanh toán trong một tháng cụ thể
 *   Query params:
 *     - month: Số tháng (1-12) hoặc 'current' cho tháng hiện tại (tùy chọn, mặc định là tháng hiện tại)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaxReportResponse>
) {
  // Chỉ chấp nhận phương thức GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  // Lấy tham số month từ query
  const { month } = req.query

  try {
    // Xử lý tham số month: nếu là "current" hoặc undefined thì dùng tháng hiện tại
    const monthNumber =
      month === "current" || month === undefined
        ? new Date().getMonth() + 1
        : Number(month)

    // Kiểm tra tính hợp lệ của số tháng (phải là số nguyên từ 1-12)
    if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        success: false,
        message: "Tháng không hợp lệ. Vui lòng chọn từ 1–12 hoặc 'current'.",
      })
    }

    // Lấy tất cả các hóa đơn chưa thanh toán trong tháng được chỉ định
    // Kết hợp với bảng services để lấy thông tin dịch vụ
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

    // Kiểm tra xem có hóa đơn nào không
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có khoản nào trong tháng đã chọn",
        data: {
          billingIds: [],
          totalIncome: 0,
          totalTax: 0,
        },
      })
    }

    // Lấy danh sách billing IDs
    const billingIds = rows.map((row) => row.billingId)

    // Tính toán thuế và thu nhập
    // Thu nhập cơ bản: tổng giá của tất cả dịch vụ
    const baseIncome = rows.reduce((sum, row) => sum + Number(row.price), 0)
    // Tổng thuế: 8% của thu nhập cơ bản
    const totalTax = Number((baseIncome * 0.08).toFixed(2))
    // Tổng thu nhập: thu nhập cơ bản + thuế
    const totalIncome = Number((baseIncome + totalTax).toFixed(2))

    const report: TaxReport = {
      billingIds,
      totalIncome,
      totalTax,
    }

    return res.status(200).json({
      success: true,
      message: "Đã tạo báo cáo thuế theo tháng",
      data: report,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error generating tax report:", error)
    return res.status(500).json({
      success: false,
      message: "Không thể tạo báo cáo thuế theo tháng",
    })
  }
}

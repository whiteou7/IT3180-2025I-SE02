import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { BillingDetail } from "@/types/billings"

/**
 * API quản lý thanh toán theo ID
 * GET /api/billings/[id] - Lấy thông tin chi tiết thanh toán theo billing ID
 * PUT /api/billings/[id] - Đánh dấu thanh toán đã được thanh toán và cập nhật thời gian thanh toán
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<BillingDetail | null>>
) {
  // Lấy billing ID từ query parameters
  const { id } = req.query

  // Kiểm tra billing ID có tồn tại không
  if (!id) return res.status(400).json({ success: false, message: "Mã thanh toán là bắt buộc" })

  try {
    // Xử lý yêu cầu lấy thông tin chi tiết thanh toán
    if (req.method === "GET") {
      // Lấy thông tin thanh toán kèm thông tin người dùng và các dịch vụ
      // Một billing có thể có nhiều dịch vụ, nên kết quả trả về có thể có nhiều dòng
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

      // Kiểm tra xem thanh toán có tồn tại không
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán" })
      }

      // Lấy thông tin từ dòng đầu tiên (thông tin chung của billing)
      const firstRow = result[0]
      
      // Tính tổng giá trị thanh toán (bao gồm cả thuế)
      // Duyệt qua tất cả các dịch vụ và tính tổng: giá + (giá * thuế / 100)
      const totalPrice = result.reduce((sum, row) => {
        const price = Number(row.price)
        const tax = Number(row.tax)
        return sum + price + (price * tax / 100)
      }, 0)

      // Tạo đối tượng BillingDetail từ dữ liệu database
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
        
        // Chuyển đổi danh sách dịch vụ từ kết quả truy vấn
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

    // Xử lý yêu cầu đánh dấu thanh toán đã được thanh toán
    else if (req.method === "PUT") {
      // Cập nhật trạng thái thanh toán thành "paid" và đặt thời gian thanh toán là hiện tại
      const updated = await db`
        UPDATE billings 
        SET billing_status = 'paid',
            paid_at = NOW()
        WHERE billing_id = ${id as string}
        RETURNING billing_id
      `

      // Kiểm tra xem thanh toán có tồn tại không
      if (updated.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán" })
      }

      return res.status(200).json({
        success: true,
        message: "Thanh toán thành công.",
        data: null,
      })
    }
    
    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    else {
      res.setHeader("Allow", ["GET", "PUT"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }

  } catch (error: unknown) {
    console.error("Error processing billing:", error)
    return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" })
  }
}
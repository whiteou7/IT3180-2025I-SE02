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
 * API quản lý thanh toán (billing)
 * GET /api/billings - Lấy danh sách tổng hợp thanh toán với bộ lọc tùy chọn
 *   Query params:
 *     - userId: Lọc theo ID người dùng (tùy chọn)
 *     - status: Lọc theo trạng thái thanh toán (tùy chọn)
 * POST /api/billings - Tạo bản ghi thanh toán mới cho người dùng với các dịch vụ được chỉ định
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ billingId: string } | BillingSummary[] | null>>
) {
  // Xử lý yêu cầu lấy danh sách thanh toán
  if (req.method === "GET") {
    try {
      // Lấy các tham số query, xử lý trường hợp mảng (Next.js có thể trả về mảng)
      const userIdParam = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId
      const statusParam = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status

      // Xây dựng truy vấn với điều kiện WHERE có điều kiện
      // Sử dụng template literals để tạo truy vấn động
      let result: RawBillingFromDB[]

      // Trường hợp có cả hai bộ lọc: userId và status
      if (userIdParam && statusParam) {
        // Truy vấn với cả hai điều kiện lọc
        // Sử dụng GROUP BY để nhóm các dịch vụ cùng một billing_id
        // Sử dụng json_agg để tổng hợp thông tin dịch vụ thành mảng JSON
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
      // Trường hợp chỉ lọc theo userId
      } else if (userIdParam) {
        // Truy vấn chỉ với điều kiện lọc theo người dùng
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
      // Trường hợp chỉ lọc theo status
      } else if (statusParam) {
        // Truy vấn chỉ với điều kiện lọc theo trạng thái thanh toán
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
      // Trường hợp không có bộ lọc nào
      } else {
        // Truy vấn tất cả các bản ghi thanh toán
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

      // Chuyển đổi dữ liệu từ database sang định dạng BillingSummary
      // Xử lý các trường có thể là string hoặc number từ database
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
      // Xử lý lỗi khi lấy danh sách thanh toán
      console.error("Error fetching billings:", error)
      return res.status(500).json({
        success: false,
        message: (error as Error).message || "Lỗi máy chủ nội bộ",
      })
    }
  }

  // Xử lý yêu cầu tạo thanh toán mới
  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({ success: false, message: "Phương thức không được phép" })
  }

  // Lấy thông tin từ request body
  const { userId, serviceIds, dueDate, periodStart, periodEnd } = req.body as {
    userId: string
    serviceIds: number[]
    dueDate?: string
    periodStart?: string
    periodEnd?: string
  }

  // Kiểm tra tính hợp lệ của userId (phải là UUID)
  const userIdValidation = validateUUID(userId, "Mã người dùng")
  if (!userIdValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: userIdValidation.message,
    })
  }

  // Kiểm tra tính hợp lệ của danh sách dịch vụ (phải là mảng số)
  const serviceIdsValidation = validateNumberArray(serviceIds, "Danh sách dịch vụ")
  if (!serviceIdsValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: serviceIdsValidation.message,
    })
  }

  // Kiểm tra tính hợp lệ của các trường ngày tháng tùy chọn
  // Kiểm tra ngày đến hạn nếu có cung cấp
  if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
    const dueDateValidation = validateDate(dueDate, "Ngày đến hạn")
    if (!dueDateValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: dueDateValidation.message,
      })
    }
  }

  // Kiểm tra ngày bắt đầu kỳ nếu có cung cấp
  if (periodStart !== undefined && periodStart !== null && periodStart !== "") {
    const periodStartValidation = validateDate(periodStart, "Ngày bắt đầu kỳ")
    if (!periodStartValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: periodStartValidation.message,
      })
    }
  }

  // Kiểm tra ngày kết thúc kỳ nếu có cung cấp
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
    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    // Nếu có lỗi xảy ra, tất cả thay đổi sẽ được rollback
    const newBillingId = await db.begin(async (sql) => {
      // Tạo UUID mới cho billing_id
      const billingId = randomUUID()
      // Loại bỏ các service_id trùng lặp
      const uniqueServiceIds = [...new Set(serviceIds)]
      
      // Kiểm tra xem tất cả các dịch vụ có tồn tại trong database không
      const services = await sql`
        SELECT service_id FROM services WHERE service_id IN ${sql(uniqueServiceIds)}
      `

      // Nếu số lượng dịch vụ tìm được khác với số lượng yêu cầu, có dịch vụ không hợp lệ
      if (services.length !== uniqueServiceIds.length) {
        throw new Error("Một hoặc nhiều dịch vụ không hợp lệ.")
      }

      // Xử lý các giá trị ngày tháng
      // Nếu không có ngày đến hạn, mặc định là 15 ngày kể từ bây giờ
      const now = new Date()
      const parsedDueDate = dueDate ? new Date(dueDate) : new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      // Nếu không có ngày bắt đầu kỳ, mặc định là bây giờ
      const parsedPeriodStart = periodStart ? new Date(periodStart) : now
      // Nếu không có ngày kết thúc kỳ, mặc định là 30 ngày sau ngày bắt đầu
      const parsedPeriodEnd = periodEnd
        ? new Date(periodEnd)
        : new Date(parsedPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Tạo các bản ghi billing cho từng dịch vụ
      // Mỗi dịch vụ sẽ có một bản ghi riêng nhưng cùng billing_id
      const billingRecords = serviceIds.map((sid) => ({
        billing_id: billingId,
        user_id: userId,
        service_id: sid,
        billing_status: "unpaid", // Trạng thái mặc định là chưa thanh toán
        used_at: now,
        due_date: parsedDueDate,
        period_start: parsedPeriodStart,
        period_end: parsedPeriodEnd,
      }))

      // Chèn tất cả các bản ghi vào database
      await sql`
        INSERT INTO billings ${sql(billingRecords)}
      `

      return billingId
    })

    // Trả về ID của billing vừa tạo
    return res.status(201).json({
      success: true,
      message: "Tạo thanh toán thành công.",
      data: { billingId: newBillingId },
    })
  } catch (error) {
    // Xử lý lỗi khi tạo thanh toán
    console.error("Error creating billing:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message || "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}
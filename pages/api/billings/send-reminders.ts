import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { sendBillingReminder } from "@/lib/email"
import type { BillingItem } from "@/lib/email"

type ReminderType = "3days" | "7days" | "overdue"

type EligibleUser = {
  userId: string
  email: string
  fullName: string
  bills: BillingItem[]
}

/**
 * API gửi nhắc nhở thanh toán
 * GET /api/billings/send-reminders - Lấy danh sách người dùng đủ điều kiện nhận nhắc nhở thanh toán
 *   Query params:
 *     - reminderType: Loại nhắc nhở ('3days', '7days', hoặc 'overdue')
 * POST /api/billings/send-reminders - Gửi email nhắc nhở thanh toán cho người dùng đủ điều kiện
 *   Body:
 *     - userId: ID người dùng cần gửi nhắc nhở
 *     - reminderType: Loại nhắc nhở ('3days', '7days', hoặc 'overdue')
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<EligibleUser[] | { success: boolean }>>
) {
  // Xử lý yêu cầu lấy danh sách người dùng đủ điều kiện
  if (req.method === "GET") {
    // Lấy loại nhắc nhở từ query parameters
    const { reminderType } = req.query as { reminderType?: ReminderType }

    // Kiểm tra tính hợp lệ của loại nhắc nhở
    if (!reminderType || !["3days", "7days", "overdue"].includes(reminderType)) {
      return res.status(400).json({
        success: false,
        message: "Loại nhắc nhở không hợp lệ. Phải là '3days', '7days', hoặc 'overdue'",
      })
    }

    try {
      // Tính toán ngày đích dựa trên loại nhắc nhở
      const now = new Date()
      let targetDate: Date | null = null

      // Tính toán ngày đích dựa trên loại nhắc nhở
      switch (reminderType) {
        case "3days": {
          // Nhắc nhở 3 ngày trước ngày đến hạn
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 3)
          break
        }
        case "7days": {
          // Nhắc nhở 7 ngày trước ngày đến hạn
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 7)
          break
        }
        case "overdue": {
          // Nhắc nhở cho hóa đơn quá hạn (due_date < now)
          targetDate = null
          break
        }
      }

      // Lấy tất cả các hóa đơn chưa thanh toán phù hợp với tiêu chí
      // Nhóm theo billing_id để lấy các hóa đơn duy nhất với tổng tiền của chúng
      let billings: {
        billingId: string
        userId: string
        email: string
        fullName: string
        dueDate: string
        totalAmount: number
        daysUntilDue: number
      }[]

      // Xử lý trường hợp hóa đơn quá hạn
      if (reminderType === "overdue") {
        // Lấy các hóa đơn chưa thanh toán có ngày đến hạn < ngày hiện tại
        billings = await db<{
          billingId: string
          userId: string
          email: string
          fullName: string
          dueDate: string
          totalAmount: number
          daysUntilDue: number
        }[]>
        `
          SELECT 
            b.billing_id,
            b.user_id,
            u.email,
            u.full_name,
            MAX(b.due_date)::text as due_date,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            (MAX(b.due_date)::date - CURRENT_DATE)::integer as days_until_due
          FROM billings b
          JOIN users u ON u.user_id = b.user_id
          JOIN services s ON s.service_id = b.service_id
          WHERE b.billing_status = 'unpaid'
            AND b.due_date::date < CURRENT_DATE
          GROUP BY b.billing_id, b.user_id, u.email, u.full_name
          ORDER BY MAX(b.due_date)
        `
      } 
      // Xử lý trường hợp nhắc nhở trước ngày đến hạn (3 ngày hoặc 7 ngày)
      else if (targetDate) {
        const targetDateStr = targetDate.toISOString().split("T")[0]
        // Lấy các hóa đơn chưa thanh toán có ngày đến hạn = ngày đích
        billings = await db<{
          billingId: string
          userId: string
          email: string
          fullName: string
          dueDate: string
          totalAmount: number
          daysUntilDue: number
        }[]>
        `
          SELECT 
            b.billing_id,
            b.user_id,
            u.email,
            u.full_name,
            MAX(b.due_date)::text as due_date,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            (MAX(b.due_date)::date - CURRENT_DATE)::integer as days_until_due
          FROM billings b
          JOIN users u ON u.user_id = b.user_id
          JOIN services s ON s.service_id = b.service_id
          WHERE b.billing_status = 'unpaid'
            AND b.due_date::date = ${targetDateStr}::date
          GROUP BY b.billing_id, b.user_id, u.email, u.full_name
          ORDER BY MAX(b.due_date)
        `
      } else {
        return res.status(400).json({
          success: false,
          message: "Loại nhắc nhở không hợp lệ",
        })
      }

      // Nhóm hóa đơn theo người dùng
      // Mỗi người dùng có thể có nhiều hóa đơn
      const usersMap = new Map<string, EligibleUser>()

      for (const billing of billings) {
        const dueDate = new Date(billing.dueDate)
        const daysDiff = Number(billing.daysUntilDue)
        const isOverdue = daysDiff < 0 // Hóa đơn quá hạn nếu số ngày < 0

        // Tạo đối tượng BillingItem từ dữ liệu
        const billingItem: BillingItem = {
          billingId: billing.billingId,
          totalAmount: Number(billing.totalAmount),
          dueDate: billing.dueDate,
          daysUntilDue: daysDiff,
          isOverdue,
        }

        // Thêm người dùng vào map nếu chưa có
        if (!usersMap.has(billing.userId)) {
          usersMap.set(billing.userId, {
            userId: billing.userId,
            email: billing.email,
            fullName: billing.fullName,
            bills: [],
          })
        }

        // Thêm hóa đơn vào danh sách hóa đơn của người dùng
        usersMap.get(billing.userId)!.bills.push(billingItem)
      }

      const eligibleUsers = Array.from(usersMap.values())

      return res.status(200).json({
        success: true,
        message: `Tìm thấy ${eligibleUsers.length} người dùng có hóa đơn cần nhắc nhở`,
        data: eligibleUsers,
      })
    } catch (error) {
      console.error("Error fetching eligible users:", error)
      return res.status(500).json({
        success: false,
        message: (error as Error).message || "Lỗi máy chủ nội bộ khi tìm người dùng",
      })
    }
  } 
  // Xử lý yêu cầu gửi email nhắc nhở cho một người dùng cụ thể
  else if (req.method === "POST") {
    // Lấy userId và reminderType từ request body
    const { userId, reminderType } = req.body as { userId: string; reminderType: ReminderType }

    // Kiểm tra tính hợp lệ của userId và reminderType
    if (!userId || !reminderType || !["3days", "7days", "overdue"].includes(reminderType)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: userId và reminderType hợp lệ",
      })
    }

    try {
      // Tính toán ngày đích dựa trên loại nhắc nhở
      const now = new Date()
      let targetDate: Date | null = null

      // Tính toán ngày đích dựa trên loại nhắc nhở
      switch (reminderType) {
        case "3days": {
          // Nhắc nhở 3 ngày trước ngày đến hạn
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 3)
          break
        }
        case "7days": {
          // Nhắc nhở 7 ngày trước ngày đến hạn
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 7)
          break
        }
        case "overdue": {
          // Nhắc nhở cho hóa đơn quá hạn
          targetDate = null
          break
        }
      }

      // Lấy tất cả các hóa đơn chưa thanh toán của người dùng này phù hợp với tiêu chí
      let billings: {
        billingId: string
        dueDate: string
        totalAmount: number
        daysUntilDue: number
      }[]

      if (reminderType === "overdue") {
        billings = await db<{
          billingId: string
          dueDate: string
          totalAmount: number
          daysUntilDue: number
        }[]>
        `
          SELECT 
            b.billing_id,
            MAX(b.due_date)::text as due_date,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            (MAX(b.due_date)::date - CURRENT_DATE)::integer as days_until_due
          FROM billings b
          JOIN services s ON s.service_id = b.service_id
          WHERE b.user_id = ${userId}
            AND b.billing_status = 'unpaid'
            AND b.due_date::date < CURRENT_DATE
          GROUP BY b.billing_id
          ORDER BY MAX(b.due_date)
        `
      } else if (targetDate) {
        const targetDateStr = targetDate.toISOString().split("T")[0]
        billings = await db<{
          billingId: string
          dueDate: string
          totalAmount: number
          daysUntilDue: number
        }[]>
        `
          SELECT 
            b.billing_id,
            MAX(b.due_date)::text as due_date,
            SUM(s.price + (s.price * s.tax / 100)) as total_amount,
            (MAX(b.due_date)::date - CURRENT_DATE)::integer as days_until_due
          FROM billings b
          JOIN services s ON s.service_id = b.service_id
          WHERE b.user_id = ${userId}
            AND b.billing_status = 'unpaid'
            AND b.due_date::date = ${targetDateStr}::date
          GROUP BY b.billing_id
          ORDER BY MAX(b.due_date)
        `
      } else {
        return res.status(400).json({
          success: false,
          message: "Loại nhắc nhở không hợp lệ",
        })
      }

      // Kiểm tra xem có hóa đơn nào không
      if (billings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy hóa đơn nào cho người dùng này",
        })
      }

      // Lấy thông tin người dùng (email và tên)
      const userInfo = await db<{ email: string; fullName: string }[]>`
        SELECT email, full_name
        FROM users
        WHERE user_id = ${userId}
        LIMIT 1
      `

      // Kiểm tra xem người dùng có tồn tại không
      if (userInfo.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      const user = userInfo[0]

      // Chuẩn bị danh sách hóa đơn để gửi email
      const billingItems: BillingItem[] = billings.map((billing) => {
        const daysDiff = Number(billing.daysUntilDue)
        return {
          billingId: billing.billingId,
          totalAmount: Number(billing.totalAmount),
          dueDate: billing.dueDate,
          daysUntilDue: daysDiff,
          isOverdue: daysDiff < 0, // Hóa đơn quá hạn nếu số ngày < 0
        }
      })

      // Gửi email nhắc nhở thanh toán
      await sendBillingReminder(user.email, {
        fullName: user.fullName,
        bills: billingItems,
      })

      return res.status(200).json({
        success: true,
        message: `Đã gửi email nhắc nhở thành công cho ${user.fullName}`,
        data: { success: true },
      })
    } catch (error) {
      console.error("Error sending billing reminder:", error)
      return res.status(500).json({
        success: false,
        message: (error as Error).message || "Lỗi máy chủ nội bộ khi gửi email nhắc nhở",
      })
    }
  } 
  // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
  else {
    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }
}
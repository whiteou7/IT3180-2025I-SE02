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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<EligibleUser[] | { success: boolean }>>
) {
  if (req.method === "GET") {
    // Fetch eligible users with their bills
    const { reminderType } = req.query as { reminderType?: ReminderType }

    if (!reminderType || !["3days", "7days", "overdue"].includes(reminderType)) {
      return res.status(400).json({
        success: false,
        message: "Loại nhắc nhở không hợp lệ. Phải là '3days', '7days', hoặc 'overdue'",
      })
    }

    try {
      const now = new Date()
      let targetDate: Date | null = null

      // Calculate target date based on reminder type
      switch (reminderType) {
        case "3days": {
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 3)
          break
        }
        case "7days": {
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 7)
          break
        }
        case "overdue": {
          targetDate = null // For overdue, we check if due_date < now
          break
        }
      }

      // Get all unpaid billings matching the criteria
      // Group by billing_id to get unique billings with their totals
      let billings: {
        billingId: string
        userId: string
        email: string
        fullName: string
        dueDate: string
        totalAmount: number
        daysUntilDue: number
      }[]

      if (reminderType === "overdue") {
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
      } else if (targetDate) {
        const targetDateStr = targetDate.toISOString().split("T")[0]
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

      // Group billings by user
      const usersMap = new Map<string, EligibleUser>()

      for (const billing of billings) {
        const dueDate = new Date(billing.dueDate)
        const daysDiff = Number(billing.daysUntilDue)
        const isOverdue = daysDiff < 0

        const billingItem: BillingItem = {
          billingId: billing.billingId,
          totalAmount: Number(billing.totalAmount),
          dueDate: billing.dueDate,
          daysUntilDue: daysDiff,
          isOverdue,
        }

        if (!usersMap.has(billing.userId)) {
          usersMap.set(billing.userId, {
            userId: billing.userId,
            email: billing.email,
            fullName: billing.fullName,
            bills: [],
          })
        }

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
  } else if (req.method === "POST") {
    // Send email to a single selected user
    const { userId, reminderType } = req.body as { userId: string; reminderType: ReminderType }

    if (!userId || !reminderType || !["3days", "7days", "overdue"].includes(reminderType)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: userId và reminderType hợp lệ",
      })
    }

    try {
      const now = new Date()
      let targetDate: Date | null = null

      // Calculate target date based on reminder type
      switch (reminderType) {
        case "3days": {
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 3)
          break
        }
        case "7days": {
          targetDate = new Date(now)
          targetDate.setDate(now.getDate() + 7)
          break
        }
        case "overdue": {
          targetDate = null
          break
        }
      }

      // Get all unpaid billings for this user matching the criteria
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

      if (billings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy hóa đơn nào cho người dùng này",
        })
      }

      // Get user info
      const userInfo = await db<{ email: string; fullName: string }[]>`
        SELECT email, full_name
        FROM users
        WHERE user_id = ${userId}
        LIMIT 1
      `

      if (userInfo.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        })
      }

      const user = userInfo[0]

      // Prepare billing items
      const billingItems: BillingItem[] = billings.map((billing) => {
        const daysDiff = Number(billing.daysUntilDue)
        return {
          billingId: billing.billingId,
          totalAmount: Number(billing.totalAmount),
          dueDate: billing.dueDate,
          daysUntilDue: daysDiff,
          isOverdue: daysDiff < 0,
        }
      })

      // Send email
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
  } else {
    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }
}
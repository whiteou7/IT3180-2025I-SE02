import nodemailer from "nodemailer"

// Gmail transporter configuration
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email configuration is missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env")
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password
    },
  })
}

export type BillingItem = {
  billingId: string
  totalAmount: number
  dueDate: string
  daysUntilDue: number
  isOverdue: boolean
}

export type MultiBillingReminderData = {
  fullName: string
  bills: BillingItem[]
}

/**
 * Send a billing reminder email to a user with multiple bills
 */
export async function sendBillingReminder(
  recipientEmail: string,
  reminderData: MultiBillingReminderData
): Promise<void> {
  const transporter = createTransporter()

  const { fullName, bills } = reminderData

  if (bills.length === 0) {
    throw new Error("No bills to send reminder for")
  }

  // Calculate totals and determine urgency
  const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
  const hasOverdue = bills.some((bill) => bill.isOverdue)
  const minDaysUntilDue = Math.min(...bills.map((bill) => bill.daysUntilDue))

  let subject: string
  let urgencyText: string

  if (hasOverdue) {
    const overdueCount = bills.filter((bill) => bill.isOverdue).length
    subject = `⚠️ ${overdueCount} hóa đơn đã quá hạn - Cần thanh toán ngay`
    urgencyText = `Bạn có ${overdueCount} hóa đơn đã quá hạn và ${bills.length - overdueCount} hóa đơn sắp đến hạn. Vui lòng thanh toán ngay để tránh các khoản phí phát sinh.`
  } else if (minDaysUntilDue <= 3) {
    subject = `🔔 Nhắc nhở: ${bills.length} hóa đơn sắp đến hạn (${minDaysUntilDue} ngày)`
    urgencyText = `Bạn có ${bills.length} hóa đơn sẽ đến hạn trong ${minDaysUntilDue} ngày. Vui lòng thanh toán sớm.`
  } else {
    subject = `📧 Nhắc nhở: ${bills.length} hóa đơn sắp đến hạn (${minDaysUntilDue} ngày)`
    urgencyText = `Bạn có ${bills.length} hóa đơn sẽ đến hạn trong ${minDaysUntilDue} ngày.`
  }

  // Generate bills HTML
  const billsHtml = bills
    .map((bill) => {
      const dueDateFormatted = new Date(bill.dueDate).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const statusText = bill.isOverdue
        ? `Đã quá hạn ${Math.abs(bill.daysUntilDue)} ngày`
        : `Còn ${bill.daysUntilDue} ngày`

      return `
        <div class="billing-item ${bill.isOverdue ? "urgent" : ""}">
          <div class="billing-item-header">
            <span class="billing-id">Mã: ${bill.billingId}</span>
            <span class="billing-status ${bill.isOverdue ? "overdue" : ""}">${statusText}</span>
          </div>
          <div class="billing-item-details">
            <div class="billing-detail">
              <span class="label">Ngày đến hạn:</span>
              <span class="value">${dueDateFormatted}</span>
            </div>
            <div class="billing-detail">
              <span class="label">Tổng số tiền:</span>
              <span class="value amount">${bill.totalAmount.toLocaleString("vi-VN")} $</span>
            </div>
          </div>
        </div>
      `
    })
    .join("")

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }
        .billing-info {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #2563eb;
        }
        .billing-item {
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          border-left: 4px solid #2563eb;
          border: 1px solid #e5e7eb;
        }
        .billing-item.urgent {
          background-color: #fef2f2;
          border-left-color: #dc2626;
        }
        .billing-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .billing-id {
          font-weight: bold;
          color: #111827;
        }
        .billing-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #e5e7eb;
          color: #6b7280;
        }
        .billing-status.overdue {
          background-color: #fee2e2;
          color: #dc2626;
        }
        .billing-item-details {
          margin-top: 10px;
        }
        .billing-detail {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .billing-detail:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #6b7280;
          display: inline-block;
          width: 150px;
        }
        .value {
          color: #111827;
        }
        .amount {
          font-size: 18px;
          font-weight: bold;
          color: #dc2626;
        }
        .total-summary {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .total-amount {
          font-size: 28px;
          font-weight: bold;
          color: #dc2626;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Nhắc nhở thanh toán hóa đơn</h1>
      </div>
      <div class="content">
        <p>Xin chào <strong>${fullName}</strong>,</p>
        
        <p>${urgencyText}</p>
        
        <div class="billing-info">
          <h3 style="margin-top: 0; margin-bottom: 15px;">Danh sách hóa đơn:</h3>
          ${billsHtml}
          
          <div class="total-summary">
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Tổng cộng:</div>
            <div class="total-amount">${totalAmount.toLocaleString("vi-VN")} $</div>
          </div>
        </div>
        
        <p>Vui lòng đăng nhập vào hệ thống để thanh toán các hóa đơn của bạn.</p>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing" class="button">
            Xem và thanh toán
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Nếu bạn đã thanh toán, vui lòng bỏ qua email này.
        </p>
      </div>
      <div class="footer">
        <p>Đây là email tự động từ hệ thống quản lý căn hộ.</p>
        <p>Vui lòng không trả lời email này.</p>
      </div>
    </body>
    </html>
  `

  // Generate text content
  const billsText = bills
    .map((bill) => {
      const dueDateFormatted = new Date(bill.dueDate).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const statusText = bill.isOverdue
        ? `Đã quá hạn ${Math.abs(bill.daysUntilDue)} ngày`
        : `Còn ${bill.daysUntilDue} ngày`

      return `
- Mã hóa đơn: ${bill.billingId}
  Ngày đến hạn: ${dueDateFormatted} (${statusText})
  Tổng số tiền: ${bill.totalAmount.toLocaleString("vi-VN")} $`
    })
    .join("\n")

  const textContent = `
Nhắc nhở thanh toán hóa đơn

Xin chào ${fullName},

${urgencyText}

Danh sách hóa đơn:
${billsText}

Tổng cộng: ${totalAmount.toLocaleString("vi-VN")} $

Vui lòng đăng nhập vào hệ thống để thanh toán các hóa đơn của bạn.
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing

Nếu bạn đã thanh toán, vui lòng bỏ qua email này.

---
Đây là email tự động từ hệ thống quản lý căn hộ.
Vui lòng không trả lời email này.
  `

  await transporter.sendMail({
    from: `"Hệ thống Quản lý Căn hộ" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject,
    text: textContent,
    html: htmlContent,
  })
}

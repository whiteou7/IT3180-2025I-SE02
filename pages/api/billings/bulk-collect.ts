import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import { randomUUID } from "crypto"

type CollectRentBody = {
  type: "rent"
}

type CollectOtherFeeBody = {
  type: "other"
  name: string
  price: number
}

type BulkCollectBody = CollectRentBody | CollectOtherFeeBody

/**
 * API thu phí hàng loạt
 * POST /api/billings/bulk-collect - Thu phí hàng loạt (tiền nhà hoặc phí khác) từ tất cả người dùng có căn hộ
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ billingCount: number; serviceId: number }>>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ success: false, message: "Phương thức không được phép" })
  }

  try {
    // Lấy thông tin từ request body
    const body = req.body as BulkCollectBody

    // Xử lý thu tiền nhà
    if (body.type === "rent") {
      // Thu tiền nhà: lấy tất cả người dùng có căn hộ và phí hàng tháng của họ
      const usersWithApartments = await db<{ userId: string; monthlyFee: number }[]>`
        SELECT 
          u.user_id
          a.monthly_fee
        FROM users u
        INNER JOIN apartments a ON u.apartment_id = a.apartment_id
        WHERE u.apartment_id IS NOT NULL
      `

      // Kiểm tra xem có người dùng nào có căn hộ không
      if (usersWithApartments.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Không có cư dân nào có căn hộ để thu tiền nhà.",
          data: { billingCount: 0, serviceId: 0 },
        })
      }

      // Nhóm theo phí hàng tháng để tạo/lấy dịch vụ
      // Map: phí hàng tháng -> service_id
      const feeGroups = new Map<number, number>()
      // Lấy danh sách các mức phí duy nhất
      const uniqueFees = [...new Set(usersWithApartments.map((u) => u.monthlyFee))]

      // Kiểm tra dịch vụ đã tồn tại hoặc tạo mới
      // Mỗi mức phí sẽ có một service tương ứng
      for (const fee of uniqueFees) {
        const [existing] = await db<{ serviceId: number }[]>`
          SELECT service_id
          FROM services
          WHERE service_id = ${fee}
        `

        if (existing) {
          // Dịch vụ đã tồn tại, sử dụng service_id hiện có
          feeGroups.set(fee, existing.serviceId)
        } else {
          // Tạo dịch vụ mới với service_id = phí hàng tháng, tên = "monthly fee"
          await db`
            INSERT INTO services (service_id, service_name, price, description, tax, category, is_available)
            VALUES (${fee}, 'monthly fee', ${fee}, NULL, 0, 'other', FALSE)
          `
          feeGroups.set(fee, fee)
        }
      }

      // Tạo hóa đơn cho tất cả người dùng
      // Ngày đến hạn: 15 ngày kể từ bây giờ
      const now = new Date()
      const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      // Kỳ thanh toán: từ bây giờ đến 30 ngày sau
      const periodStart = now
      const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Tạo các bản ghi billing cho từng người dùng
      const billingRecords = usersWithApartments.map((user) => {
        const serviceId = feeGroups.get(user.monthlyFee)!
        const billingId = randomUUID()
        return {
          billing_id: billingId,
          user_id: user.userId,
          service_id: serviceId,
          billing_status: "unpaid", // Trạng thái mặc định là chưa thanh toán
          used_at: now,
          due_date: dueDate,
          period_start: periodStart,
          period_end: periodEnd,
        }
      })

      // Chèn tất cả các bản ghi billing vào database
      await db`
        INSERT INTO billings ${db(billingRecords)}
      `

      return res.status(201).json({
        success: true,
        message: `Đã tạo hóa đơn tiền nhà cho ${billingRecords.length} cư dân.`,
        data: { billingCount: billingRecords.length, serviceId: 0 },
      })
    } 
    // Xử lý thu phí khác (không phải tiền nhà)
    else if (body.type === "other") {
      // Lấy tên và giá từ request body
      const { name, price } = body as CollectOtherFeeBody

      // Kiểm tra tính hợp lệ của tên và giá
      if (!name || price === undefined || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Tên và giá phải được cung cấp, giá phải không âm.",
        })
      }

      // Tạo service ID ngẫu nhiên trong khoảng 999000-999999
      // Để tránh trùng với các service ID thông thường
      let serviceId: number
      let attempts = 0
      do {
        serviceId = Math.floor(Math.random() * (999999 - 999000 + 1)) + 999000
        attempts++
        // Giới hạn số lần thử để tránh vòng lặp vô hạn
        if (attempts > 100) {
          return res.status(500).json({
            success: false,
            message: "Không thể tạo ID dịch vụ duy nhất. Vui lòng thử lại.",
          })
        }
      } while (
        // Kiểm tra xem service ID đã tồn tại chưa
        await db<{ count: number }[]>`
          SELECT COUNT(*) AS count
          FROM services
          WHERE service_id = ${serviceId}
        `.then((result) => result[0]?.count > 0)
      )

      // Tạo dịch vụ mới với service_id cụ thể
      // PostgreSQL cho phép chèn giá trị cụ thể vào cột SERIAL
      await db`
        INSERT INTO services (service_id, service_name, price, description, tax, category, is_available)
        VALUES (${serviceId}, ${name}, ${price}, NULL, 0, 'other', FALSE)
      `

      // Lấy tất cả người dùng có căn hộ
      const usersWithApartments = await db<{ userId: string }[]>`
        SELECT user_id
        FROM users
        WHERE apartment_id IS NOT NULL
      `

      // Kiểm tra xem có người dùng nào có căn hộ không
      if (usersWithApartments.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Không có cư dân nào có căn hộ để thu phí.",
          data: { billingCount: 0, serviceId },
        })
      }

      // Tạo hóa đơn cho tất cả người dùng
      // Ngày đến hạn: 15 ngày kể từ bây giờ
      const now = new Date()
      const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      // Kỳ thanh toán: từ bây giờ đến 30 ngày sau
      const periodStart = now
      const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Tạo các bản ghi billing cho từng người dùng
      const billingRecords = usersWithApartments.map((user) => {
        const billingId = randomUUID()
        return {
          billing_id: billingId,
          user_id: user.userId,
          service_id: serviceId,
          billing_status: "unpaid", // Trạng thái mặc định là chưa thanh toán
          used_at: now,
          due_date: dueDate,
          period_start: periodStart,
          period_end: periodEnd,
        }
      })

      // Chèn tất cả các bản ghi billing vào database
      await db`
        INSERT INTO billings ${db(billingRecords)}
      `

      return res.status(201).json({
        success: true,
        message: `Đã tạo hóa đơn "${name}" cho ${billingRecords.length} cư dân.`,
        data: { billingCount: billingRecords.length, serviceId },
      })
    } 
    // Trả về lỗi nếu loại thu phí không hợp lệ
    else {
      return res.status(400).json({
        success: false,
        message: "Loại thu phí không hợp lệ.",
      })
    }
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in bulk collect:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message || "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

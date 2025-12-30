import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

/**
 * API hoàn tác hóa đơn
 * POST /api/billings/rollback - Xóa hóa đơn mới nhất của mỗi người dùng (bất kể loại hóa đơn)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ deletedCount: number }>>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ success: false, message: "Phương thức không được phép" })
  }

  try {
    // Lấy billing_id mới nhất của mỗi người dùng
    // Sử dụng DISTINCT ON để lấy một bản ghi duy nhất cho mỗi user_id
    // Sắp xếp theo used_at DESC để lấy bản ghi mới nhất
    const latestBillings = await db<{ billingId: string }[]>`
      SELECT DISTINCT ON (user_id) billing_id
      FROM billings
      ORDER BY user_id, used_at DESC
    `

    // Kiểm tra xem có hóa đơn nào để hoàn tác không
    if (latestBillings.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có hóa đơn nào để hoàn tác.",
        data: { deletedCount: 0 },
      })
    }

    // Lấy danh sách các billing_id cần xóa
    const billingIds = latestBillings.map((b) => b.billingId)

    // Xóa tất cả các hóa đơn có các ID này
    // Vì billing_id là TEXT và nhiều dòng có thể chia sẻ cùng một billing_id,
    // nên chúng ta xóa tất cả các dòng có các billing_id này
    const result = await db<{ billingId: string }[]>`
      DELETE FROM billings
      WHERE billing_id IN ${db(billingIds)}
      RETURNING billing_id
    `

    // Trả về số lượng hóa đơn đã xóa
    return res.status(200).json({
      success: true,
      message: `Đã hoàn tác ${result.length} hóa đơn.`,
      data: { deletedCount: result.length },
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in rollback:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message || "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

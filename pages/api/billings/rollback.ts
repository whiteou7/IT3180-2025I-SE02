import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"

/**
 * POST /api/billings/rollback
 * Delete the latest bill for each user (regardless of bill type)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ deletedCount: number }>>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ success: false, message: "Phương thức không được phép" })
  }

  try {
    // Get the latest billing_id for each user
    const latestBillings = await db<{ billingId: string }[]>`
      SELECT DISTINCT ON (user_id) billing_id
      FROM billings
      ORDER BY user_id, used_at DESC
    `

    if (latestBillings.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có hóa đơn nào để hoàn tác.",
        data: { deletedCount: 0 },
      })
    }

    const billingIds = latestBillings.map((b) => b.billingId)

    // Delete all billings with these IDs
    // Since billing_id is TEXT and multiple rows can share the same billing_id,
    // we delete all rows with these billing_ids
    const result = await db<{ billingId: string }[]>`
      DELETE FROM billings
      WHERE billing_id IN ${db(billingIds)}
      RETURNING billing_id
    `

    return res.status(200).json({
      success: true,
      message: `Đã hoàn tác ${result.length} hóa đơn.`,
      data: { deletedCount: result.length },
    })
  } catch (error) {
    console.error("Error in rollback:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message || "Có lỗi xảy ra. Vui lòng thử lại.",
    })
  }
}

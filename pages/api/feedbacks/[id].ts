import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Feedback } from "@/types/feedbacks"
import type { FeedbackStatus } from "@/types/enum"

function parseFeedbackId(idParam: string | string[] | undefined): string | null {
  if (!idParam) return null
  if (typeof idParam === "string") return idParam
  if (Array.isArray(idParam) && idParam.length > 0) return idParam[0]
  return null
}

/**
 * GET /api/feedbacks/[id] - Get a specific feedback
 * PATCH /api/feedbacks/[id] - Update feedback status (admin only)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Feedback | null>>
) {
  try {
    const feedbackId = parseFeedbackId(req.query.id)

    if (!feedbackId) {
      return res.status(400).json({ success: false, message: "Mã phản hồi là bắt buộc" })
    }

    if (req.method === "GET") {
      const [feedback] = await db<Feedback[]>`
        SELECT 
          feedback_id,
          f.user_id,
          content,
          tags,
          status,
          created_at,
          updated_at,
          full_name
        FROM feedbacks f
        JOIN users u ON f.user_id = u.user_id
        WHERE feedback_id = ${feedbackId}
        LIMIT 1;
      `

      if (!feedback) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi" })
      }

      return res.status(200).json({ success: true, message: "Tải phản hồi thành công", data: feedback })
    } else if (req.method === "PATCH") {
      const { status, tags } = req.body as {
        status?: FeedbackStatus;
        tags?: string[];
      }

      if (!status && !tags) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn ít nhất một nội dung cần cập nhật",
        })
      }

      if (status && tags) {
        await db`
          UPDATE feedbacks
          SET status = ${status}, tags = ${db.array(tags)}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      } else if (status) {
        await db`
          UPDATE feedbacks
          SET status = ${status}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      } else if (tags) {
        await db`
          UPDATE feedbacks
          SET tags = ${db.array(tags)}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      }

      // Fetch updated feedback
      const [updated] = await db<Feedback[]>`
        SELECT 
          feedback_id,
          f.user_id,
          content,
          tags,
          status,
          created_at,
          updated_at,
          full_name
        FROM feedbacks f
        JOIN users u ON f.user_id = u.user_id
        WHERE feedback_id = ${feedbackId}
        LIMIT 1;
      `

      return res.status(200).json({ success: true, message: "Cập nhật phản hồi thành công", data: updated })
    } else if (req.method === "DELETE") {
      const { userId } = req.body as {
        userId: string;
      }

      if (!userId) {
        return res.status(400).json({ success: false, message: "Mã người dùng là bắt buộc" })
      }

      // Check if feedback exists and user owns it
      const [existing] = await db<{ userId: string }[]>`
        SELECT user_id FROM feedbacks WHERE feedback_id = ${feedbackId} LIMIT 1;
      `

      if (!existing) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi" })
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ success: false, message: "Bạn chỉ có thể xóa phản hồi của chính mình" })
      }

      await db`DELETE FROM feedbacks WHERE feedback_id = ${feedbackId}`

      return res.status(200).json({ success: true, message: "Xóa phản hồi thành công", data: null })
    } else {
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }
  } catch (error) {
    console.error("Error in /api/feedbacks/[id]:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

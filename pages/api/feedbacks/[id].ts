import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Feedback } from "@/types/feedbacks"
import type { FeedbackStatus } from "@/types/enum"

/**
 * Hàm helper để parse feedback ID từ query parameters
 * Xử lý các trường hợp: undefined, string, hoặc array
 */
function parseFeedbackId(idParam: string | string[] | undefined): string | null {
  if (!idParam) return null
  if (typeof idParam === "string") return idParam
  if (Array.isArray(idParam) && idParam.length > 0) return idParam[0]
  return null
}

/**
 * API quản lý phản hồi theo ID
 * GET /api/feedbacks/[id] - Lấy thông tin một phản hồi cụ thể
 * PATCH /api/feedbacks/[id] - Cập nhật trạng thái phản hồi (chỉ dành cho admin)
 * DELETE /api/feedbacks/[id] - Xóa phản hồi (chỉ người sở hữu)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Feedback | null>>
) {
  try {
    // Parse feedback ID từ query parameters
    const feedbackId = parseFeedbackId(req.query.id)

    // Kiểm tra feedback ID có tồn tại không
    if (!feedbackId) {
      return res.status(400).json({ success: false, message: "Mã phản hồi là bắt buộc" })
    }

    // Xử lý yêu cầu lấy thông tin phản hồi
    if (req.method === "GET") {
      // Tìm phản hồi theo ID, kết hợp với bảng users để lấy tên người dùng
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

      // Kiểm tra xem phản hồi có tồn tại không
      if (!feedback) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi" })
      }

      return res.status(200).json({ success: true, message: "Tải phản hồi thành công", data: feedback })
    } 
    // Xử lý yêu cầu cập nhật phản hồi
    else if (req.method === "PATCH") {
      // Lấy thông tin cập nhật từ request body
      const { status, tags } = req.body as {
        status?: FeedbackStatus;
        tags?: string[];
      }

      // Kiểm tra ít nhất một trường phải được cung cấp để cập nhật
      if (!status && !tags) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn ít nhất một nội dung cần cập nhật",
        })
      }

      // Cập nhật phản hồi dựa trên các trường được cung cấp
      // Có thể cập nhật cả status và tags, hoặc chỉ một trong hai
      if (status && tags) {
        // Cập nhật cả trạng thái và tags
        await db`
          UPDATE feedbacks
          SET status = ${status}, tags = ${db.array(tags)}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      } else if (status) {
        // Chỉ cập nhật trạng thái
        await db`
          UPDATE feedbacks
          SET status = ${status}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      } else if (tags) {
        // Chỉ cập nhật tags
        await db`
          UPDATE feedbacks
          SET tags = ${db.array(tags)}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      }

      // Lấy lại phản hồi đã cập nhật
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
    } 
    // Xử lý yêu cầu xóa phản hồi
    else if (req.method === "DELETE") {
      // Lấy userId từ request body
      const { userId } = req.body as {
        userId: string;
      }

      // Kiểm tra userId có tồn tại không
      if (!userId) {
        return res.status(400).json({ success: false, message: "Mã người dùng là bắt buộc" })
      }

      // Kiểm tra xem phản hồi có tồn tại và người dùng có sở hữu nó không
      const [existing] = await db<{ userId: string }[]>`
        SELECT user_id FROM feedbacks WHERE feedback_id = ${feedbackId} LIMIT 1;
      `

      if (!existing) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi" })
      }

      // Kiểm tra quyền sở hữu: chỉ người tạo phản hồi mới có thể xóa
      if (existing.userId !== userId) {
        return res.status(403).json({ success: false, message: "Bạn chỉ có thể xóa phản hồi của chính mình" })
      }

      // Xóa phản hồi khỏi database
      await db`DELETE FROM feedbacks WHERE feedback_id = ${feedbackId}`

      return res.status(200).json({ success: true, message: "Xóa phản hồi thành công", data: null })
    } 
    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    else {
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }
  } catch (error) {
    console.error("Error in /api/feedbacks/[id]:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Feedback } from "@/types/feedbacks"
import {
  validateString,
  validateUUID,
  validateStringArray,
} from "@/lib/validation"

/**
 * API quản lý phản hồi
 * GET /api/feedbacks - Lấy danh sách phản hồi (tất cả cho admin, chỉ của mình cho cư dân)
 * POST /api/feedbacks - Tạo phản hồi mới
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Feedback[] | Feedback>>
) {
  try {
    // Xử lý yêu cầu lấy danh sách phản hồi
    if (req.method === "GET") {
      // Lấy các tham số từ query, xử lý trường hợp mảng
      const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId
      const role = Array.isArray(req.query.role) ? req.query.role[0] : req.query.role
      const statusFilter = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status

      let feedbacks: Feedback[]

      // Lọc theo người dùng nếu không phải admin
      // Người dùng thường chỉ có thể xem phản hồi của chính mình
      if (role !== "admin" && userId) {
        // Nếu có bộ lọc trạng thái
        if (statusFilter && statusFilter !== "all") {
          // Lấy phản hồi của người dùng với trạng thái cụ thể
          feedbacks = await db<Feedback[]>`
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
            WHERE f.user_id = ${userId} AND status = ${statusFilter}
            ORDER BY created_at DESC;
          `
        } else {
          // Lấy tất cả phản hồi của người dùng
          feedbacks = await db<Feedback[]>`
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
            WHERE f.user_id = ${userId}
            ORDER BY created_at DESC;
          `
        }
      } else {
        // Admin có thể xem tất cả phản hồi
        if (statusFilter && statusFilter !== "all") {
          // Lấy tất cả phản hồi với trạng thái cụ thể
          feedbacks = await db<Feedback[]>`
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
            WHERE status = ${statusFilter}
            ORDER BY created_at DESC;
          `
        } else {
          // Lấy tất cả phản hồi
          feedbacks = await db<Feedback[]>`
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
            ORDER BY created_at DESC;
          `
        }
      }

      return res.status(200).json({ success: true, message: "Tải danh sách phản hồi thành công", data: feedbacks })
    // Xử lý yêu cầu tạo phản hồi mới
    } else if (req.method === "POST") {
      // Lấy thông tin phản hồi từ request body
      const { content, userId, tags } = req.body as {
        content: string;
        userId: string;
        tags?: string[];
      }

      // Kiểm tra tính hợp lệ của nội dung phản hồi (không được rỗng)
      const contentValidation = validateString(content, "Nội dung phản hồi")
      if (!contentValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: contentValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của userId (phải là UUID)
      const userIdValidation = validateUUID(userId, "Mã người dùng")
      if (!userIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: userIdValidation.message,
        })
      }

      // Kiểm tra tính hợp lệ của tags nếu có cung cấp
      if (tags !== undefined && tags !== null) {
        const tagsValidation = validateStringArray(tags, "Thẻ")
        if (!tagsValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: tagsValidation.message,
          })
        }
      }

      // Thêm phản hồi mới vào database
      // Sử dụng db.array() để chuyển mảng tags thành định dạng PostgreSQL array
      const [row] = await db<{ feedbackId: string }[]>`
        INSERT INTO feedbacks (user_id, content, tags)
        VALUES (${userId}, ${content}, ${tags ? db.array(tags) : db.array([])})
        RETURNING feedback_id
      `

      // Lấy lại phản hồi vừa tạo kèm thông tin người dùng (full_name)
      // Để trả về đầy đủ thông tin cho client
      const [created] = await db<Feedback[]>`
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
        WHERE feedback_id = ${row.feedbackId}
        LIMIT 1;
      `

      return res.status(201).json({ success: true, message: "Tạo phản hồi thành công", data: created })
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }
  } catch (error) {
    console.error("Error in /api/feedbacks:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

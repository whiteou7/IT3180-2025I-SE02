import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Post } from "@/types/posts"
import type { PostCategory } from "@/types/enum"
import { validateUUID, validateString } from "@/lib/validation"

/**
 * Hàm helper để parse post ID từ query parameters
 * Xử lý các trường hợp: undefined, string, hoặc array
 */
function parsePostId(idParam: string | string[] | undefined): string | null {
  if (!idParam) return null
  if (typeof idParam === "string") return idParam
  if (Array.isArray(idParam) && idParam.length > 0) return idParam[0]
  return null
}

/**
 * API quản lý bài viết theo ID
 * GET /api/posts/[id] - Lấy thông tin một bài viết cụ thể
 * PATCH /api/posts/[id] - Cập nhật bài viết (chỉ người sở hữu)
 * DELETE /api/posts/[id] - Xóa bài viết (chỉ người sở hữu)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Post | null>>
) {
  try {
    // Parse post ID từ query parameters
    const postId = parsePostId(req.query.id)

    // Kiểm tra post ID có tồn tại không
    if (!postId) {
      return res.status(400).json({ success: false, message: "Thiếu mã bài viết" })
    }

    // Xử lý yêu cầu lấy thông tin bài viết
    if (req.method === "GET") {
      // Tìm bài viết theo ID, kết hợp với bảng users để lấy tên người dùng
      const [post] = await db<Post[]>`
        SELECT post_id, p.user_id, content, created_at, full_name, category, title
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE post_id = ${postId}
        LIMIT 1;
      `

      // Kiểm tra xem bài viết có tồn tại không
      if (!post) {
        return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" })
      }

      return res.status(200).json({
        success: true,
        message: "Tải bài viết thành công",
        data: post,
      })
    } 
    // Xử lý yêu cầu cập nhật bài viết
    else if (req.method === "PATCH") {
      // Lấy thông tin cập nhật từ request body
      const { userId, title, content, category } = req.body as {
        userId: string;
        title?: string;
        content?: string;
        category?: PostCategory;
      }

      // Kiểm tra tính hợp lệ của userId (phải là UUID)
      const userIdValidation = validateUUID(userId, "Mã người dùng")
      if (!userIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: userIdValidation.message || "Mã người dùng không hợp lệ.",
        })
      }

      // Kiểm tra tính hợp lệ của các trường tùy chọn nếu có cung cấp
      // Kiểm tra nội dung nếu có cung cấp
      if (content !== undefined && content !== null && content !== "") {
        const contentValidation = validateString(content, "Nội dung bài viết")
        if (!contentValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: contentValidation.message || "Nội dung bài viết không hợp lệ.",
          })
        }
      }

      // Kiểm tra tiêu đề nếu có cung cấp
      if (title !== undefined && title !== null && title !== "") {
        const titleValidation = validateString(title, "Tiêu đề")
        if (!titleValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: titleValidation.message || "Tiêu đề không hợp lệ.",
          })
        }
      }

      // Kiểm tra xem bài viết có tồn tại và người dùng có sở hữu nó không
      const [existing] = await db<{ userId: string }[]>`
        SELECT user_id FROM posts WHERE post_id = ${postId} LIMIT 1;
      `

      if (!existing) {
        return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" })
      }

      // Kiểm tra quyền sở hữu: chỉ người tạo bài viết mới có thể chỉnh sửa
      if (existing.userId !== userId) {
        return res.status(403).json({ success: false, message: "Bạn chỉ có thể chỉnh sửa bài viết của chính mình" })
      }

      // Xây dựng truy vấn cập nhật - chỉ cập nhật các trường được cung cấp
      // Sử dụng COALESCE để chỉ cập nhật các trường có giá trị (không null)
      await db`
        UPDATE posts 
        SET 
          title = COALESCE(${title ?? null}, title),
          content = COALESCE(${content ?? null}, content),
          category = COALESCE(${category ?? null}, category)
        WHERE post_id = ${postId}
      `

      // Lấy lại bài viết đã cập nhật
      const [updated] = await db<Post[]>`
        SELECT post_id, p.user_id, content, created_at, full_name, category, title
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE post_id = ${postId}
        LIMIT 1;
      `

      return res.status(200).json({
        success: true,
        message: "Cập nhật bài viết thành công",
        data: updated,
      })
    } 
    // Xử lý yêu cầu xóa bài viết
    else if (req.method === "DELETE") {
      // Lấy userId từ request body
      const { userId } = req.body as {
        userId: string;
      }

      // Kiểm tra tính hợp lệ của userId (phải là UUID)
      const userIdValidation = validateUUID(userId, "Mã người dùng")
      if (!userIdValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: userIdValidation.message || "Mã người dùng không hợp lệ.",
        })
      }

      // Kiểm tra xem bài viết có tồn tại và người dùng có sở hữu nó không
      const [existing] = await db<{ userId: string }[]>`
        SELECT user_id FROM posts WHERE post_id = ${postId} LIMIT 1;
      `

      if (!existing) {
        return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" })
      }

      // Kiểm tra quyền sở hữu: chỉ người tạo bài viết mới có thể xóa
      if (existing.userId !== userId) {
        return res.status(403).json({ success: false, message: "Bạn chỉ có thể xóa bài viết của chính mình" })
      }

      // Xóa bài viết khỏi database
      await db`DELETE FROM posts WHERE post_id = ${postId}`

      return res.status(200).json({ success: true, message: "Xóa bài viết thành công", data: null })
    } 
    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    else {
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Phương thức ${req.method} không được phép` })
    }
  } catch (error) {
    console.error("Error in /api/posts/[id]:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Post } from "@/types/posts"
import type { PostCategory } from "@/types/enum"
import {
  validateString,
  validateUUID,
} from "@/lib/validation"

/**
 * API quản lý bài viết
 * GET /api/posts - Lấy danh sách tất cả bài viết kèm thông tin người dùng
 * POST /api/posts - Tạo bài viết mới
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Post[] | Post>>
) {
  try {
    // Xử lý yêu cầu lấy danh sách bài viết
    if (req.method === "GET") {
      // Lấy tham số lọc theo danh mục từ query, xử lý trường hợp mảng
      const categoryFilter = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category
      
      let posts: Post[]
      
      // Nếu có bộ lọc danh mục và không phải "all", lọc theo danh mục
      if (categoryFilter && categoryFilter !== "all") {
        // Lấy bài viết theo danh mục, kết hợp với bảng users để lấy tên người dùng
        // Sắp xếp theo thời gian tạo mới nhất
        posts = await db<Post[]>`
          SELECT post_id, p.user_id, content, created_at, full_name, category, title
          FROM 
            posts p
          JOIN
            users u
          ON
            p.user_id = u.user_id
          WHERE category = ${categoryFilter}
          ORDER BY created_at DESC;
        `
      } else {
        // Lấy tất cả bài viết, không lọc theo danh mục
        posts = await db<Post[]>`
          SELECT post_id, p.user_id, content, created_at, full_name, category, title
          FROM 
            posts p
          JOIN
            users u
          ON
            p.user_id = u.user_id
          ORDER BY created_at DESC;
        `
      }

      return res.status(200).json({
        success: true,
        message: "Tải danh sách bài viết thành công",
        data: posts,
      })
    } 
    // Xử lý yêu cầu tạo bài viết mới
    else if (req.method === "POST") {
      // Lấy thông tin bài viết từ request body
      const { content, userId, category, title } = req.body as {
        content: string;
        userId: string;
        category?: PostCategory;
        title?: string;
      }

      // Kiểm tra tính hợp lệ của nội dung bài viết (không được rỗng)
      const contentValidation = validateString(content, "Nội dung bài viết")
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

      // Kiểm tra tính hợp lệ của tiêu đề nếu có cung cấp
      if (title !== undefined && title !== null && title !== "") {
        const titleValidation = validateString(title, "Tiêu đề")
        if (!titleValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: titleValidation.message,
          })
        }
      }

      // Thêm bài viết mới vào database
      // Category mặc định là "general" nếu không được chỉ định
      const [row] = await db<{ postId: string }[]>`
        INSERT INTO posts (user_id, content, category, title)
        VALUES (${userId}, ${content}, ${category ?? "general"}, ${title ?? null})
        RETURNING post_id
      `

      // Lấy lại bài viết vừa tạo kèm thông tin người dùng (full_name)
      // Để trả về đầy đủ thông tin cho client
      const [created] = await db<Post[]>`
        SELECT post_id, p.user_id, content, created_at, full_name, category, title
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE post_id = ${row.postId}
        LIMIT 1;
      `

      return res.status(201).json({
        success: true,
        message: "Tạo bài viết thành công",
        data: created,
      })
    } 
    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    else {
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).json({
        success: false,
        message: `Phương thức ${req.method} không được phép`,
      })
    }
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/posts:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

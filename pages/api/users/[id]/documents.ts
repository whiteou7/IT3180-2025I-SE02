import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/storage"
import type { APIBody } from "@/types/api"

export type Document = {
  name: string
  path: string
}

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * API quản lý tài liệu của người dùng
 * GET /api/users/[id]/documents - Liệt kê tất cả tài liệu của một người dùng
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Document[] | { message: string }>>
) {
  // Lấy userId từ query parameters
  const { id: userId } = req.query

  // Kiểm tra userId có tồn tại không
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  try {
    // Xử lý yêu cầu lấy danh sách tài liệu
    if (req.method === "GET") {
      // Liệt kê tất cả các file trong thư mục của người dùng từ Supabase Storage
      const { data, error } = await supabase.storage
        .from("users")
        .list(`${userId}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        })

      // Xử lý lỗi từ Supabase Storage
      if (error) {
        console.error("Error listing documents:", error)
        return res.status(500).json({
          success: false,
          message: error.message || "Không thể tải danh sách tài liệu",
        })
      }

      // Lọc các file PDF và chuyển đổi sang định dạng Document
      // Chỉ lấy các file có đuôi .pdf (không phân biệt hoa thường)
      const documents: Document[] = (data || [])
        .filter((file) => file.name.toLowerCase().endsWith(".pdf"))
        .map((file) => ({
          name: file.name,
          path: `${userId}/${file.name}`,
        }))

      return res.status(200).json({
        success: true,
        message: "Tải danh sách tài liệu thành công",
        data: documents,
      })
    }

    // Trả về lỗi nếu phương thức HTTP không được hỗ trợ
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/documents:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

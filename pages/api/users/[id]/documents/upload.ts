import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/storage"
import type { APIBody } from "@/types/api"
import formidable from "formidable"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * API tải lên tài liệu
 * POST /api/users/[id]/documents/upload - Tải lên tài liệu cho người dùng
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ path: string }>>
) {
  // Lấy userId từ query parameters
  const { id: userId } = req.query

  // Kiểm tra userId có tồn tại và là string không
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Cấu hình formidable để xử lý form data
    // Giới hạn kích thước file tối đa 10MB
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    })

    // Parse form data từ request
    const [, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    // Kiểm tra file có được cung cấp không
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn tệp để tải lên",
      })
    }

    // Kiểm tra loại file (chỉ cho phép PDF)
    if (!file.originalFilename?.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({
        success: false,
        message: "Chỉ cho phép tệp PDF",
      })
    }

    // Đọc file buffer từ file tạm thời
    const fileBuffer = fs.readFileSync(file.filepath)
    const fileName = file.originalFilename || `document-${Date.now()}.pdf`
    const filePath = `${userId}/${fileName}`

    // Tải lên file lên Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("users")
      .upload(filePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false, // Không ghi đè file nếu đã tồn tại
      })

    // Xóa file tạm thời sau khi đã đọc
    fs.unlinkSync(file.filepath)

    if (uploadError) {
      console.error("Error uploading document:", uploadError)
      return res.status(500).json({
        success: false,
        message: uploadError.message || "Không thể tải lên tài liệu",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Tải lên tài liệu thành công",
      data: { path: filePath },
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/documents/upload:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

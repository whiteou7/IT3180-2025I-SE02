import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/storage"

/**
 * API tải/xem tài liệu
 * GET /api/users/[id]/documents/[filename] - Tải xuống hoặc xem một tài liệu
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | { success: false; message: string }>
) {
  // Lấy userId và filename từ query parameters
  const { id: userId, filename } = req.query

  // Kiểm tra userId có tồn tại và là string không
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  // Kiểm tra filename có tồn tại và là string không
  if (!filename || typeof filename !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu tên tệp",
    })
  }

  // Chỉ chấp nhận phương thức GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Tạo đường dẫn file trong Supabase Storage
    const filePath = `${userId}/${filename}`

    // Tải file từ Supabase Storage
    const { data, error } = await supabase.storage
      .from("users")
      .download(filePath)

    // Xử lý lỗi từ Supabase
    if (error) {
      console.error("Error downloading document:", error)
      return res.status(404).json({
        success: false,
        message: error.message || "Không tìm thấy tài liệu",
      })
    }

    // Chuyển đổi blob thành buffer
    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Thiết lập headers cho việc xem/tải PDF
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename}"`
    )
    res.setHeader("Content-Length", buffer.length)

    // Trả về buffer PDF
    return res.status(200).send(buffer)
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/users/[id]/documents/[filename]:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

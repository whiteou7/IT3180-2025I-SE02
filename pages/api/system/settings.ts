import type { NextApiRequest, NextApiResponse } from "next"
import type { APIBody } from "@/types/api"

type SystemSettings = {
  previewMode: boolean
  databaseUrl: string
  storageUrl: string
  storageKey: string
}

/**
 * API quản lý cài đặt hệ thống
 * GET /api/system/settings - Lấy cài đặt hệ thống (chỉ dành cho Admin)
 * Trả về các biến môi trường cần thiết cho trang cài đặt
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<SystemSettings>>
) {
  // Chỉ chấp nhận phương thức GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Đọc chế độ preview từ biến môi trường
    const previewMode = process.env.PREVIEW_MODE === "true"

    // Lấy URL cơ sở dữ liệu
    // Ưu tiên DATABASE_URL, nếu không có thì dùng NEXT_PUBLIC_DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL || ""

    // Lấy URL lưu trữ (Supabase)
    // Ưu tiên SUPABASE_URL, nếu không có thì dùng NEXT_PUBLIC_SUPABASE_URL
    const storageUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""

    // Lấy khóa lưu trữ (Supabase)
    // Ưu tiên SUPABASE_KEY, nếu không có thì dùng NEXT_PUBLIC_SUPABASE_KEY
    const storageKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || ""

    return res.status(200).json({
      success: true,
      message: "Tải cài đặt hệ thống thành công",
      data: {
        previewMode,
        databaseUrl,
        storageUrl,
        storageKey,
      },
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/system/settings:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

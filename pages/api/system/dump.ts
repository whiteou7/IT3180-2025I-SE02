import type { NextApiRequest, NextApiResponse } from "next"
import type { APIBody } from "@/types/api"

type DumpOptions = {
  format: "sql" | "csv" | "json"
  includeSchema: boolean
  includeData: boolean
  tables?: string[]
}

/**
 * API tạo lệnh dump database
 * POST /api/system/dump - Tạo lệnh bash để dump database
 * Chỉ dành cho Admin
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ command: string; filename: string }>>
) {
  // Chỉ chấp nhận phương thức POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Lấy các tùy chọn dump từ request body
    const options = req.body as DumpOptions

    // Kiểm tra ít nhất một trong hai tùy chọn (schema hoặc data) phải được chọn
    if (!options.includeSchema && !options.includeData) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một mục để xuất (cấu trúc hoặc dữ liệu).",
      })
    }

    // Lấy URL database từ biến môi trường
    const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL || ""
    
    // Kiểm tra database URL có tồn tại không
    if (!databaseUrl) {
      return res.status(400).json({
        success: false,
        message: "Chưa cấu hình địa chỉ kết nối dữ liệu.",
      })
    }

    // Phân tích URL database để lấy thông tin kết nối
    let dbUrl: URL
    try {
      dbUrl = new URL(databaseUrl)
    } catch {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ kết nối không đúng định dạng.",
      })
    }

    // Trích xuất các tham số kết nối từ URL
    const username = dbUrl.username || "postgres"
    const password = dbUrl.password || ""
    const host = dbUrl.hostname || "localhost"
    const port = dbUrl.port || "5432"
    const database = dbUrl.pathname?.slice(1) || "postgres" // Xóa dấu / ở đầu

    // Escape mật khẩu cho shell (thay dấu nháy đơn bằng '\'')
    const escapedPassword = password.replace(/'/g, "'\\''")

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0]
    const filename = `dump-${timestamp}.${options.format === "sql" ? "sql" : "sql"}` // pg_dump xuất ra định dạng SQL

    // Xây dựng lệnh pg_dump
    const commandParts: string[] = []

    // Thêm các tùy chọn kết nối
    // Sử dụng biến môi trường PGPASSWORD để tránh mật khẩu xuất hiện trong lịch sử lệnh
    commandParts.push(`PGPASSWORD='${escapedPassword}' pg_dump`)
    commandParts.push(`-h ${host}`)
    commandParts.push(`-p ${port}`)
    commandParts.push(`-U ${username}`)
    commandParts.push(`-d ${database}`)

    // Thêm các tùy chọn dump
    if (options.includeSchema && !options.includeData) {
      // Chỉ xuất cấu trúc (schema)
      commandParts.push("--schema-only")
    } else if (!options.includeSchema && options.includeData) {
      // Chỉ xuất dữ liệu
      commandParts.push("--data-only")
    }

    // Thêm bộ lọc bảng nếu được chỉ định
    if (options.tables && options.tables.length > 0) {
      options.tables.forEach((table) => {
        commandParts.push(`-t ${table}`)
      })
    }

    // Thêm tùy chọn định dạng (custom format để nén tốt hơn)
    if (options.format === "json" || options.format === "csv") {
      // Lưu ý: pg_dump không trực tiếp xuất JSON/CSV, nhưng có thể dùng custom format
      // Đối với CSV/JSON, người dùng cần sử dụng psql hoặc các công cụ khác
      commandParts.push("-Fc") // Custom format (đã nén)
    } else {
      commandParts.push("-Fp") // Plain SQL format
    }

    // Thêm cờ verbose để có output chi tiết hơn
    commandParts.push("-v")

    // Chuyển hướng output vào file
    const fullCommand = `${commandParts.join(" \\\n  ")} > ${filename}`

    return res.status(200).json({
      success: true,
      message: "Đã tạo lệnh xuất dữ liệu thành công",
      data: {
        command: fullCommand,
        filename,
      },
    })
  } catch (error) {
    // Xử lý lỗi chung
    console.error("Error in /api/system/dump:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

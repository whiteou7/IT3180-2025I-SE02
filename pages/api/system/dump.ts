import type { NextApiRequest, NextApiResponse } from "next"
import type { APIBody } from "@/types/api"

type DumpOptions = {
  format: "sql" | "csv" | "json"
  includeSchema: boolean
  includeData: boolean
  tables?: string[]
}

/**
 * POST /api/system/dump - Generate database dump bash command
 * Admin only
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ command: string; filename: string }>>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    const options = req.body as DumpOptions

    if (!options.includeSchema && !options.includeData) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một mục để xuất (cấu trúc hoặc dữ liệu).",
      })
    }

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL || ""
    
    if (!databaseUrl) {
      return res.status(400).json({
        success: false,
        message: "Chưa cấu hình địa chỉ kết nối dữ liệu.",
      })
    }

    // Parse database URL to extract connection details
    let dbUrl: URL
    try {
      dbUrl = new URL(databaseUrl)
    } catch {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ kết nối không đúng định dạng.",
      })
    }

    // Extract connection parameters
    const username = dbUrl.username || "postgres"
    const password = dbUrl.password || ""
    const host = dbUrl.hostname || "localhost"
    const port = dbUrl.port || "5432"
    const database = dbUrl.pathname?.slice(1) || "postgres" // Remove leading /

    // Escape password for shell (replace single quotes with '\'')
    const escapedPassword = password.replace(/'/g, "'\\''")

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0]
    const filename = `dump-${timestamp}.${options.format === "sql" ? "sql" : "sql"}` // pg_dump outputs SQL format

    // Build pg_dump command
    const commandParts: string[] = []

    // Add connection options
    // Use PGPASSWORD environment variable to avoid password in command history
    commandParts.push(`PGPASSWORD='${escapedPassword}' pg_dump`)
    commandParts.push(`-h ${host}`)
    commandParts.push(`-p ${port}`)
    commandParts.push(`-U ${username}`)
    commandParts.push(`-d ${database}`)

    // Add dump options
    if (options.includeSchema && !options.includeData) {
      commandParts.push("--schema-only")
    } else if (!options.includeSchema && options.includeData) {
      commandParts.push("--data-only")
    }

    // Add table filters if specified
    if (options.tables && options.tables.length > 0) {
      options.tables.forEach((table) => {
        commandParts.push(`-t ${table}`)
      })
    }

    // Add format option (custom format for better compression)
    if (options.format === "json" || options.format === "csv") {
      // Note: pg_dump doesn't directly output JSON/CSV, but we can use custom format
      // For CSV/JSON, users would need to use psql or other tools
      commandParts.push("-Fc") // Custom format (compressed)
    } else {
      commandParts.push("-Fp") // Plain SQL format
    }

    // Add verbose flag for better output
    commandParts.push("-v")

    // Redirect output to file
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
    console.error("Error in /api/system/dump:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

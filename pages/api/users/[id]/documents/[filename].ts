import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/storage"

/**
 * GET /api/users/[id]/documents/[filename] - Download/view a document
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | { success: false; message: string }>
) {
  const { id: userId, filename } = req.query

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  if (!filename || typeof filename !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu tên tệp",
    })
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    const filePath = `${userId}/${filename}`

    // Download from Supabase
    const { data, error } = await supabase.storage
      .from("users")
      .download(filePath)

    if (error) {
      console.error("Error downloading document:", error)
      return res.status(404).json({
        success: false,
        message: error.message || "Không tìm thấy tài liệu",
      })
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Set headers for PDF viewing/downloading
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename}"`
    )
    res.setHeader("Content-Length", buffer.length)

    return res.status(200).send(buffer)
  } catch (error) {
    console.error("Error in /api/users/[id]/documents/[filename]:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

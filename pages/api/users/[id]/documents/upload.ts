import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/storage"
import type { APIBody } from "@/types/api"
import formidable from "formidable"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false,
  },
}

/**
 * POST /api/users/[id]/documents/upload - Upload a document for a user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ path: string }>>
) {
  const { id: userId } = req.query

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã người dùng",
    })
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    })

    const [, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn tệp để tải lên",
      })
    }

    // Validate file type (PDF only)
    if (!file.originalFilename?.toLowerCase().endsWith(".pdf")) {
      return res.status(400).json({
        success: false,
        message: "Chỉ cho phép tệp PDF",
      })
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath)
    const fileName = file.originalFilename || `document-${Date.now()}.pdf`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("users")
      .upload(filePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      })

    // Clean up temp file
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
    console.error("Error in /api/users/[id]/documents/upload:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

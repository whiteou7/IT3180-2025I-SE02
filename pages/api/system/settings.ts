import type { NextApiRequest, NextApiResponse } from "next"
import type { APIBody } from "@/types/api"

type SystemSettings = {
  previewMode: boolean
  databaseUrl: string
  storageUrl: string
  storageKey: string
}

/**
 * GET /api/system/settings - Get system settings (Admin only)
 * Returns environment variables needed for the settings page
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<SystemSettings>>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  }

  try {
    // Read preview mode from environment variable
    const previewMode = process.env.PREVIEW_MODE === "true"

    // Get database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL || ""

    // Get storage URL
    const storageUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""

    // Get storage key
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
    console.error("Error in /api/system/settings:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

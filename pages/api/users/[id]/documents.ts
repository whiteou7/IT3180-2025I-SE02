import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/storage"
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
 * GET /api/users/[id]/documents - List all documents for a user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Document[] | { message: string }>>
) {
  const { id: userId } = req.query

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    })
  }

  try {
    if (req.method === "GET") {
      // List all files in the user's folder
      const { data, error } = await supabase.storage
        .from("users")
        .list(`${userId}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        })

      if (error) {
        console.error("Error listing documents:", error)
        return res.status(500).json({
          success: false,
          message: error.message || "Failed to list documents",
        })
      }

      // Filter for PDF files and convert to Document format
      const documents: Document[] = (data || [])
        .filter((file) => file.name.toLowerCase().endsWith(".pdf"))
        .map((file) => ({
          name: file.name,
          path: `${userId}/${file.name}`,
        }))

      return res.status(200).json({
        success: true,
        message: "Documents fetched successfully",
        data: documents,
      })
    }

    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  } catch (error) {
    console.error("Error in /api/users/[id]/documents:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

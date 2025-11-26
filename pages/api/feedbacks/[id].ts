import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Feedback } from "@/types/feedbacks"
import type { FeedbackStatus } from "@/types/enum"

function parseFeedbackId(idParam: string | string[] | undefined): string | null {
  if (!idParam) return null
  if (typeof idParam === "string") return idParam
  if (Array.isArray(idParam) && idParam.length > 0) return idParam[0]
  return null
}

/**
 * GET /api/feedbacks/[id] - Get a specific feedback
 * PATCH /api/feedbacks/[id] - Update feedback status (admin only)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Feedback | null>>
) {
  try {
    const feedbackId = parseFeedbackId(req.query.id)

    if (!feedbackId) {
      return res.status(400).json({ success: false, message: "Feedback ID is required" })
    }

    if (req.method === "GET") {
      const [feedback] = await db<Feedback[]>`
        SELECT 
          feedback_id,
          f.user_id,
          content,
          tags,
          status,
          created_at,
          updated_at,
          full_name
        FROM feedbacks f
        JOIN users u ON f.user_id = u.user_id
        WHERE feedback_id = ${feedbackId}
        LIMIT 1;
      `

      if (!feedback) {
        return res.status(404).json({ success: false, message: "Feedback not found" })
      }

      return res.status(200).json({ success: true, message: "Feedback fetched successfully", data: feedback })
    } else if (req.method === "PATCH") {
      const { status, tags } = req.body as {
        status?: FeedbackStatus;
        tags?: string[];
      }

      if (!status && !tags) {
        return res.status(400).json({ success: false, message: "At least one field (status or tags) must be provided" })
      }

      if (status && tags) {
        await db`
          UPDATE feedbacks
          SET status = ${status}, tags = ${db.array(tags)}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      } else if (status) {
        await db`
          UPDATE feedbacks
          SET status = ${status}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      } else if (tags) {
        await db`
          UPDATE feedbacks
          SET tags = ${db.array(tags)}, updated_at = CURRENT_TIMESTAMP
          WHERE feedback_id = ${feedbackId}
        `
      }

      // Fetch updated feedback
      const [updated] = await db<Feedback[]>`
        SELECT 
          feedback_id,
          f.user_id,
          content,
          tags,
          status,
          created_at,
          updated_at,
          full_name
        FROM feedbacks f
        JOIN users u ON f.user_id = u.user_id
        WHERE feedback_id = ${feedbackId}
        LIMIT 1;
      `

      return res.status(200).json({ success: true, message: "Feedback updated successfully", data: updated })
    } else if (req.method === "DELETE") {
      const { userId } = req.body as {
        userId: string;
      }

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" })
      }

      // Check if feedback exists and user owns it
      const [existing] = await db<{ userId: string }[]>`
        SELECT user_id FROM feedbacks WHERE feedback_id = ${feedbackId} LIMIT 1;
      `

      if (!existing) {
        return res.status(404).json({ success: false, message: "Feedback not found" })
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ success: false, message: "You can only delete your own feedbacks" })
      }

      await db`DELETE FROM feedbacks WHERE feedback_id = ${feedbackId}`

      return res.status(200).json({ success: true, message: "Feedback deleted successfully", data: null })
    } else {
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("Error in /api/feedbacks/[id]:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}


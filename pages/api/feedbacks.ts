import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Feedback } from "@/types/feedbacks"
import type { FeedbackStatus } from "@/types/enum"

/**
 * GET /api/feedbacks - Retrieve feedbacks (all for admin, own for residents)
 * POST /api/feedbacks - Create a new feedback
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Feedback[] | Feedback>>
) {
  try {
    if (req.method === "GET") {
      const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId
      const role = Array.isArray(req.query.role) ? req.query.role[0] : req.query.role
      const statusFilter = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status

      let feedbacks: Feedback[]

      // Filter by user if not admin
      if (role !== "admin" && userId) {
        if (statusFilter && statusFilter !== "all") {
          feedbacks = await db<Feedback[]>`
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
            WHERE f.user_id = ${userId} AND status = ${statusFilter}
            ORDER BY created_at DESC;
          `
        } else {
          feedbacks = await db<Feedback[]>`
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
            WHERE f.user_id = ${userId}
            ORDER BY created_at DESC;
          `
        }
      } else {
        // Admin can see all
        if (statusFilter && statusFilter !== "all") {
          feedbacks = await db<Feedback[]>`
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
            WHERE status = ${statusFilter}
            ORDER BY created_at DESC;
          `
        } else {
          feedbacks = await db<Feedback[]>`
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
            ORDER BY created_at DESC;
          `
        }
      }

      return res.status(200).json({ success: true, message: "Feedbacks fetched successfully", data: feedbacks })
    } else if (req.method === "POST") {
      const { content, userId, tags } = req.body as {
        content: string;
        userId: string;
        tags?: string[];
      }

      if (!content || typeof content !== "string") {
        return res.status(400).json({ success: false, message: "`content` is required and must be a string" })
      }

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ success: false, message: "`userId` is required and must be a string" })
      }

      // Insert feedback
      const [row] = await db<{ feedbackId: string }[]>`
        INSERT INTO feedbacks (user_id, content, tags)
        VALUES (${userId}, ${content}, ${tags ? db.array(tags) : db.array([])})
        RETURNING feedback_id
      `

      // Fetch the created feedback joined with user to return full_name
      const [created] = await db<Feedback[]>`
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
        WHERE feedback_id = ${row.feedbackId}
        LIMIT 1;
      `

      return res.status(201).json({ success: true, message: "Feedback created", data: created })
    } else {
      res.setHeader("Allow", ["GET", "POST"])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("Error in /api/feedbacks:", error)
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}


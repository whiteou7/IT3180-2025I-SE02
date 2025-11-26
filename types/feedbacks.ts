import type { FeedbackStatus } from "./enum"

export type Feedback = {
  feedbackId: string
  userId: string
  fullName: string
  content: string
  tags?: string[]
  status: FeedbackStatus
  createdAt: string
  updatedAt: string
}

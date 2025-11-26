import type { PostCategory } from "./enum"

export type Post = {
  fullName: string
  postId: string
  userId: string
  content: string
  createdAt: string
  category?: PostCategory
  title?: string
}
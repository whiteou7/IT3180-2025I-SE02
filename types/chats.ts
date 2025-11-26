import type { User } from "./users"

export type Chat = {
  chatId: string
  user1Id: string
  user2Id: string
  createdAt: string
  updatedAt: string
  // Populated fields
  otherUser?: User
  lastMessage?: Message
  unreadCount?: number
}

export type Message = {
  messageId: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
  readAt: string | null
  // Populated fields
  sender?: User
}

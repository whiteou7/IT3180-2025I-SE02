import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Chat } from "@/types/chats"
import type { User } from "@/types/users"
import type { UserRole } from "@/types/enum"

/**
 * GET /api/chats - Get all chats for the current user
 * POST /api/chats - Create a new chat conversation
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Chat[] | Chat>>
) {
  try {
    if (req.method === "GET") {
      const { userId } = req.query

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        })
      }

      // Get all chats where user is either user1 or user2
      const chats = await db<Chat[]>`
        SELECT 
          c.chat_id,
          c.user1_id,
          c.user2_id,
          c.created_at,
          c.updated_at
        FROM chats c
        WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
        ORDER BY c.updated_at DESC
      `

      // For each chat, get the other user and last message
      const chatsWithDetails = await Promise.all(
        chats.map(async (chat) => {
          const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id

          // Get other user details
          const [otherUser] = await db<User[]>`
            SELECT 
              user_id,
              email,
              full_name,
              role,
              year_of_birth,
              gender,
              phone_number,
              apartment_id
            FROM users
            WHERE user_id = ${otherUserId}
            LIMIT 1
          `

          // Get last message
          const [lastMessage] = await db<{
            messageId: string
            chatId: string
            senderId: string
            content: string
            createdAt: string
            readAt: string | null
          }[]>`
            SELECT message_id, chat_id, sender_id, content, created_at, read_at
            FROM messages
            WHERE chat_id = ${chat.chatId}
            ORDER BY created_at DESC
            LIMIT 1
          `

          // Get unread count
          const [unreadResult] = await db<{ count: number }[]>`
            SELECT COUNT(*) as count
            FROM messages
            WHERE chat_id = ${chat.chatId}
              AND sender_id != ${userId}
              AND read_at IS NULL
          `

          return {
            ...chat,
            otherUser: otherUser || undefined,
            lastMessage: lastMessage
              ? {
                messageId: lastMessage.messageId,
                chatId: lastMessage.chatId,
                senderId: lastMessage.senderId,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                readAt: lastMessage.readAt,
              }
              : undefined,
            unreadCount: Number(unreadResult?.count || 0),
          }
        })
      )

      return res.status(200).json({
        success: true,
        message: "Chats fetched successfully",
        data: chatsWithDetails,
      })
    }

    if (req.method === "POST") {
      const { userId, otherUserId } = req.body as {
        userId: string
        otherUserId: string
      }

      if (!userId || !otherUserId) {
        return res.status(400).json({
          success: false,
          message: "User ID and other user ID are required",
        })
      }

      if (userId === otherUserId) {
        return res.status(400).json({
          success: false,
          message: "Cannot create chat with yourself",
        })
      }

      // Check if users exist
      const [user1] = await db<{ userId: string; role: UserRole }[]>`
        SELECT user_id, role FROM users WHERE user_id = ${userId} LIMIT 1
      `
      const [user2] = await db<{ userId: string; role: UserRole }[]>`
        SELECT user_id, role FROM users WHERE user_id = ${otherUserId} LIMIT 1
      `

      if (!user1 || !user2) {
        return res.status(404).json({
          success: false,
          message: "One or both users not found",
        })
      }

      // Check permissions: tenant, police, accountant can only chat with admin
      // Admin can chat with anyone
      if (user1.role !== "admin") {
        if (user2.role !== "admin") {
          return res.status(403).json({
            success: false,
            message: "You can only chat with admin users",
          })
        }
      }

      // Check if chat already exists (order doesn't matter)
      const [existingChat] = await db<Chat[]>`
        SELECT chat_id, user1_id, user2_id, created_at, updated_at
        FROM chats
        WHERE (user1_id = ${userId} AND user2_id = ${otherUserId})
           OR (user1_id = ${otherUserId} AND user2_id = ${userId})
        LIMIT 1
      `

      if (existingChat) {
        return res.status(200).json({
          success: true,
          message: "Chat already exists",
          data: existingChat,
        })
      }

      // Create new chat (always put smaller user_id first for consistency)
      const [user1Id, user2Id] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId]

      const [newChat] = await db<Chat[]>`
        INSERT INTO chats (user1_id, user2_id)
        VALUES (${user1Id}, ${user2Id})
        RETURNING chat_id, user1_id, user2_id, created_at, updated_at
      `

      // Get other user details
      const otherUserIdForResponse = newChat.user1Id === userId ? newChat.user2Id : newChat.user1Id
      const [otherUser] = await db<User[]>`
        SELECT 
          user_id,
          email,
          full_name,
          role,
          year_of_birth,
          gender,
          phone_number,
          apartment_id
        FROM users
        WHERE user_id = ${otherUserIdForResponse}
        LIMIT 1
      `

      const chatWithDetails: Chat = {
        ...newChat,
        otherUser: otherUser || undefined,
      }

      return res.status(201).json({
        success: true,
        message: "Chat created successfully",
        data: chatWithDetails,
      })
    }

    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  } catch (error) {
    console.error("Error in /api/chats:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

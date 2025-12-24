import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Message } from "@/types/chats"
import type { User } from "@/types/users"

/**
 * GET /api/chats/[chatId]/messages - Get all messages for a chat
 * POST /api/chats/[chatId]/messages - Send a new message
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Message[] | Message>>
) {
  const { chatId } = req.query

  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu mã cuộc trò chuyện",
    })
  }

  try {
    if (req.method === "GET") {
      const { userId } = req.query

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Thiếu mã người dùng",
        })
      }

      // Verify user is part of this chat
      const [chat] = await db<{ user1Id: string; user2Id: string }[]>`
        SELECT user1_id, user2_id
        FROM chats
        WHERE chat_id = ${chatId}
        LIMIT 1
      `

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cuộc trò chuyện",
        })
      }

      if (chat.user1Id !== userId && chat.user2Id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem cuộc trò chuyện này",
        })
      }

      // Get all messages with sender details
      const messages = await db<Message[]>`
        SELECT 
          m.message_id,
          m.chat_id,
          m.sender_id,
          m.content,
          m.created_at,
          m.read_at
        FROM messages m
        WHERE m.chat_id = ${chatId}
        ORDER BY m.created_at ASC
      `

      // Populate sender information
      const messagesWithSenders = await Promise.all(
        messages.map(async (message) => {
          const [sender] = await db<User[]>`
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
            WHERE user_id = ${message.senderId}
            LIMIT 1
          `

          return {
            ...message,
            sender: sender || undefined,
          }
        })
      )

      // Mark messages as read (only messages sent by the other user)
      await db`
        UPDATE messages
        SET read_at = CURRENT_TIMESTAMP
        WHERE chat_id = ${chatId}
          AND sender_id != ${userId}
          AND read_at IS NULL
      `

      // Update chat updated_at
      await db`
        UPDATE chats
        SET updated_at = CURRENT_TIMESTAMP
        WHERE chat_id = ${chatId}
      `

      return res.status(200).json({
        success: true,
        message: "Tải tin nhắn thành công",
        data: messagesWithSenders,
      })
    }

    if (req.method === "POST") {
      const { userId, content } = req.body as {
        userId: string
        content: string
      }

      if (!userId || !content) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin người dùng hoặc nội dung tin nhắn",
        })
      }

      if (typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nội dung tin nhắn không được để trống",
        })
      }

      // Verify user is part of this chat
      const [chat] = await db<{ user1Id: string; user2Id: string }[]>`
        SELECT user1_id, user2_id
        FROM chats
        WHERE chat_id = ${chatId}
        LIMIT 1
      `

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cuộc trò chuyện",
        })
      }

      if (chat.user1Id !== userId && chat.user2Id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem cuộc trò chuyện này",
        })
      }

      // Create message
      const [newMessage] = await db<Message[]>`
        INSERT INTO messages (chat_id, sender_id, content)
        VALUES (${chatId}, ${userId}, ${content.trim()})
        RETURNING message_id, chat_id, sender_id, content, created_at, read_at
      `

      // Update chat updated_at
      await db`
        UPDATE chats
        SET updated_at = CURRENT_TIMESTAMP
        WHERE chat_id = ${chatId}
      `

      // Get sender information
      const [sender] = await db<User[]>`
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
        WHERE user_id = ${userId}
        LIMIT 1
      `

      const messageWithSender: Message = {
        ...newMessage,
        sender: sender || undefined,
      }

      return res.status(201).json({
        success: true,
        message: "Gửi tin nhắn thành công",
        data: messageWithSender,
      })
    }

    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    console.error("Error in /api/chats/[chatId]/messages:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

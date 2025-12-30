import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/db"
import type { APIBody } from "@/types/api"
import type { Chat } from "@/types/chats"
import type { User } from "@/types/users"
import type { UserRole } from "@/types/enum"

/**
 * API quản lý cuộc trò chuyện
 * GET /api/chats - Lấy tất cả cuộc trò chuyện của người dùng hiện tại
 * POST /api/chats - Tạo cuộc trò chuyện mới
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<Chat[] | Chat>>
) {
  try {
    // Xử lý yêu cầu lấy danh sách cuộc trò chuyện
    if (req.method === "GET") {
      // Lấy userId từ query parameters
      const { userId } = req.query

      // Kiểm tra userId có tồn tại và là string không
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Thiếu mã người dùng",
        })
      }

      // Lấy tất cả cuộc trò chuyện mà người dùng là user1 hoặc user2
      // Sắp xếp theo thời gian cập nhật mới nhất
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

      // Với mỗi cuộc trò chuyện, lấy thông tin người dùng còn lại và tin nhắn cuối cùng
      // Sử dụng Promise.all để thực hiện song song các truy vấn
      const chatsWithDetails = await Promise.all(
        chats.map(async (chat) => {
          // Xác định ID của người dùng còn lại trong cuộc trò chuyện
          const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id

          // Lấy thông tin chi tiết của người dùng còn lại
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

          // Lấy tin nhắn cuối cùng trong cuộc trò chuyện
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

          // Đếm số tin nhắn chưa đọc (của người dùng khác gửi cho mình)
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
        message: "Tải danh sách cuộc trò chuyện thành công",
        data: chatsWithDetails,
      })
    }

    // Xử lý yêu cầu tạo cuộc trò chuyện mới
    if (req.method === "POST") {
      // Lấy thông tin từ request body
      const { userId, otherUserId } = req.body as {
        userId: string
        otherUserId: string
      }

      // Kiểm tra cả hai userId đều có giá trị
      if (!userId || !otherUserId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin người dùng",
        })
      }

      // Kiểm tra không được tự tạo cuộc trò chuyện với chính mình
      if (userId === otherUserId) {
        return res.status(400).json({
          success: false,
          message: "Bạn không thể tự tạo cuộc trò chuyện với chính mình",
        })
      }

      // Kiểm tra xem cả hai người dùng có tồn tại không
      const [user1] = await db<{ userId: string; role: UserRole }[]>`
        SELECT user_id, role FROM users WHERE user_id = ${userId} LIMIT 1
      `
      const [user2] = await db<{ userId: string; role: UserRole }[]>`
        SELECT user_id, role FROM users WHERE user_id = ${otherUserId} LIMIT 1
      `

      if (!user1 || !user2) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy một trong hai người dùng",
        })
      }

      // Kiểm tra quyền: tenant, police, accountant chỉ có thể trò chuyện với admin
      // Admin có thể trò chuyện với bất kỳ ai
      if (user1.role !== "admin") {
        if (user2.role !== "admin") {
          return res.status(403).json({
            success: false,
            message: "Bạn chỉ có thể trò chuyện với quản trị viên",
          })
        }
      }

      // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa (thứ tự user1_id và user2_id không quan trọng)
      const [existingChat] = await db<Chat[]>`
        SELECT chat_id, user1_id, user2_id, created_at, updated_at
        FROM chats
        WHERE (user1_id = ${userId} AND user2_id = ${otherUserId})
           OR (user1_id = ${otherUserId} AND user2_id = ${userId})
        LIMIT 1
      `

      // Nếu cuộc trò chuyện đã tồn tại, trả về thông tin cuộc trò chuyện đó
      if (existingChat) {
        return res.status(200).json({
          success: true,
          message: "Cuộc trò chuyện đã tồn tại",
          data: existingChat,
        })
      }

      // Tạo cuộc trò chuyện mới
      // Luôn đặt user_id nhỏ hơn làm user1_id để đảm bảo tính nhất quán
      const [user1Id, user2Id] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId]

      const [newChat] = await db<Chat[]>`
        INSERT INTO chats (user1_id, user2_id)
        VALUES (${user1Id}, ${user2Id})
        RETURNING chat_id, user1_id, user2_id, created_at, updated_at
      `

      // Lấy thông tin chi tiết của người dùng còn lại để trả về
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
        message: "Tạo cuộc trò chuyện thành công",
        data: chatWithDetails,
      })
    }

    res.setHeader("Allow", ["GET", "POST"])
    return res.status(405).json({
      success: false,
      message: `Phương thức ${req.method} không được phép`,
    })
  } catch (error) {
    console.error("Error in /api/chats:", error)
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    })
  }
}

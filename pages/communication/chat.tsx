import { useCallback, useEffect, useRef, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import { Send, MessageCircle, UserPlus, ArrowLeft } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { AuthGate } from "@/components/auth/auth-gate"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useUserStore } from "@/store/userStore"
import type { Chat, Message } from "@/types/chats"
import type { User } from "@/types/users"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const { userId } = useUserStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageContent, setMessageContent] = useState("")
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchChats = useCallback(async () => {
    if (!userId) return

    setIsLoadingChats(true)
    try {
      const response = await ofetch<{ success: boolean; data: Chat[]; message?: string }>(
        "/api/chats",
        {
          query: { userId },
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to load chats")
      }

      setChats(response.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load chats")
    } finally {
      setIsLoadingChats(false)
    }
  }, [userId])

  const fetchMessages = useCallback(
    async (chatId: string, isBackgroundRefresh = false) => {
      if (!userId) return

      // Only show loading state on initial load, not during background refreshes
      if (!isBackgroundRefresh) {
        setIsLoadingMessages(true)
      }
      try {
        const response = await ofetch<{ success: boolean; data: Message[]; message?: string }>(
          `/api/chats/${chatId}/messages`,
          {
            query: { userId },
            ignoreResponseError: true,
          }
        )

        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to load messages")
        }

        setMessages(response.data)
      } catch (error) {
        console.error(error)
        // Only show error toast on initial load, not during background refreshes
        if (!isBackgroundRefresh) {
          toast.error("Failed to load messages")
        }
      } finally {
        if (!isBackgroundRefresh) {
          setIsLoadingMessages(false)
        }
      }
    },
    [userId]
  )

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  useEffect(() => {
    if (selectedChat) {
      // Initial load - show loading state
      fetchMessages(selectedChat.chatId, false)
      // Poll for new messages every 3 seconds - background refresh, no loading state
      const interval = setInterval(() => {
        fetchMessages(selectedChat.chatId, true)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedChat, fetchMessages])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSearchUsers = useCallback(
    async (query: string) => {
      if (!userId || !query.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await ofetch<{ success: boolean; data: User[]; message?: string }>(
          "/api/users/search",
          {
            query: { q: query, userId },
            ignoreResponseError: true,
          }
        )

        if (response?.success) {
          setSearchResults(response.data)
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to search users")
      } finally {
        setIsSearching(false)
      }
    },
    [userId]
  )

  // Debounce search query
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("")
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearchUsers(searchQuery)
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery, isSearchOpen, handleSearchUsers])

  const handleCreateChat = useCallback(
    async (otherUserId: string) => {
      if (!userId) return

      try {
        const response = await ofetch<{ success: boolean; data: Chat; message?: string }>(
          "/api/chats",
          {
            method: "POST",
            body: {
              userId,
              otherUserId,
            },
            ignoreResponseError: true,
          }
        )

        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to create chat")
        }

        toast.success("Chat created successfully")
        setIsSearchOpen(false)
        setSearchQuery("")
        setSearchResults([])
        await fetchChats()
        setSelectedChat(response.data)
      } catch (error) {
        console.error(error)
        toast.error((error as Error).message || "Failed to create chat")
      }
    },
    [userId, fetchChats]
  )

  const handleSendMessage = useCallback(async () => {
    if (!selectedChat || !userId || !messageContent.trim()) return

    setIsSendingMessage(true)
    try {
      const response = await ofetch<{ success: boolean; data: Message; message?: string }>(
        `/api/chats/${selectedChat.chatId}/messages`,
        {
          method: "POST",
          body: {
            userId,
            content: messageContent,
          },
          ignoreResponseError: true,
        }
      )

      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to send message")
      }

      setMessageContent("")
      await fetchMessages(selectedChat.chatId, true) // Background refresh after sending
      await fetchChats() // Refresh chat list to update last message
    } catch (error) {
      console.error(error)
      toast.error("Failed to send message")
    } finally {
      setIsSendingMessage(false)
    }
  }, [selectedChat, userId, messageContent, fetchMessages, fetchChats])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AuthGate isAuthenticated={!!userId}>
      <Head>
        <title>Private Chat - Apartment Management System</title>
      </Head>
      <div className="flex h-screen flex-col gap-4 p-4 pt-20">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/communication/chat">Communication</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Private Chat</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-1 gap-2 overflow-hidden md:gap-4">
          {/* Chat List Sidebar */}
          <Card
            className={cn(
              "flex w-full flex-col border md:w-80",
              selectedChat && "hidden md:flex"
            )}
          >
            <div className="flex items-center justify-between border-b p-3 md:p-4">
              <h2 className="text-base font-semibold md:text-lg">Conversations</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSearchOpen(true)}
                className="h-8 w-8 p-0"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {isLoadingChats ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground text-sm">Loading conversations...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Start a chat
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {chats.map((chat) => {
                    const otherUser = chat.otherUser
                    if (!otherUser) return null

                    return (
                      <div
                        key={chat.chatId}
                        onClick={() => setSelectedChat(chat)}
                        className={cn(
                          "group relative flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent mx-2 mb-2 p-4 transition-all hover:border-border hover:bg-accent/50",
                          selectedChat?.chatId === chat.chatId && "border-border bg-accent shadow-sm"
                        )}
                      >
                        <Avatar className="ring-2 ring-background ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                            {getInitials(otherUser.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold text-sm">{otherUser.fullName}</p>
                            {chat.unreadCount && chat.unreadCount > 0 && (
                              <Badge variant="default" className="h-5 min-w-5 shrink-0 px-1.5 text-xs font-semibold">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Messages Area */}
          <Card
            className={cn(
              "flex flex-1 flex-col border",
              !selectedChat && "hidden md:flex"
            )}
          >
            {selectedChat ? (
              <>
                <div className="flex items-center gap-3 border-b p-3 md:p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar>
                    <AvatarFallback>
                      {selectedChat.otherUser
                        ? getInitials(selectedChat.otherUser.fullName)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm md:text-base">
                      {selectedChat.otherUser?.fullName || "Unknown User"}
                    </p>
                    <p className="truncate text-muted-foreground text-xs md:text-sm">
                      {selectedChat.otherUser?.role || ""}
                    </p>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="flex flex-col gap-3 p-3 md:gap-4 md:p-4">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center p-8">
                        <p className="text-muted-foreground text-sm">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center p-8">
                        <p className="text-muted-foreground text-sm">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwnMessage = message.senderId === userId
                        return (
                          <div
                            key={message.messageId}
                            className={cn(
                              "flex",
                              isOwnMessage ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[85%] rounded-lg px-3 py-2 md:max-w-[70%] md:px-4",
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              {!isOwnMessage && (
                                <p className="mb-1 text-xs font-medium opacity-70">
                                  {message.sender?.fullName || "Unknown"}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <p
                                className={cn(
                                  "mt-1 text-xs opacity-70",
                                  isOwnMessage ? "text-right" : "text-left"
                                )}
                              >
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-3 md:p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={isSendingMessage}
                      className="text-sm md:text-base"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || isSendingMessage}
                      size="icon"
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Start a new chat
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Search Users Dialog */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Search Users</DialogTitle>
              <DialogDescription>Find a user to start a conversation with</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search by name..."
                  value={searchQuery}
                  onValueChange={(value) => {
                    setSearchQuery(value)
                  }}
                />
                <CommandList>
                  {isSearching ? (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-muted-foreground text-sm">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 && searchQuery.trim() ? (
                    <CommandEmpty>No users found</CommandEmpty>
                  ) : searchResults.length > 0 ? (
                    <CommandGroup>
                      {searchResults.map((user) => (
                        <CommandItem
                          key={user.userId}
                          value={user.fullName}
                          onSelect={() => handleCreateChat(user.userId)}
                          className="flex items-center gap-3"
                        >
                          <Avatar>
                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-muted-foreground text-sm">{user.role}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null}
                </CommandList>
              </Command>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGate>
  )
}

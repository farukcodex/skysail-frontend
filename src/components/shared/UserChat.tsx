"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Paperclip,
  Smile,
  Send,
  AlertCircle,
  Check,
  CheckCheck,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/api";
import EmojiPicker from "emoji-picker-react";
import { getEchoInstance } from "@/lib/echo";
import { getUser } from "@/lib/auth";

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string | null;
  file_path?: string | null;
  file_type?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_url?: string | null;
  is_read: boolean;
  is_edited?: boolean;
  created_at: string;
};

export function UserChat({ role }: { role: "client" | "vendor" }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<any>(null);
  const [adminInfo, setAdminInfo] = useState<{
    name: string;
    avatar: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef<number>(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const scrollInfoRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);

  const markAsRead = async (senderId: number) => {
    try {
      await apiFetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: senderId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (pageNum: number = 1) => {
    if (isLoadingRef.current && pageNum !== 1) return;
    isLoadingRef.current = true;
    try {
      setLoadingMessages(true);
      const res = await apiFetch(`/api/messages?page=${pageNum}`);
      if (res.ok) {
        const data = await res.json();
        const newMessages = (data.data || data).reverse();

        if (pageNum === 1) {
          setMessages(newMessages);
        } else {
          if (chatContainerRef.current) {
            scrollInfoRef.current = {
              scrollHeight: chatContainerRef.current.scrollHeight,
              scrollTop: chatContainerRef.current.scrollTop,
            };
          }

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNew = newMessages.filter(
              (m: Message) => !existingIds.has(m.id),
            );
            return [...uniqueNew, ...prev];
          });
        }

        if (data.admin_info) {
          setAdminInfo(data.admin_info);
        }

        setHasMore(data.current_page < data.last_page);
        setPage(data.current_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
      setLoadingMessages(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      setPage(1);
      fetchMessages(1);
      markAsRead(1); // default admin sender is 1

      const echo = getEchoInstance();
      if (echo) {
        echo
          .private(`messages.${currentUser.id}`)
          .listen("MessageSent", (e: { message: Message }) => {
            let isNearBottom = false;
            if (chatContainerRef.current) {
              const { scrollHeight, scrollTop, clientHeight } =
                chatContainerRef.current;
              isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
            }

            setMessages((prev) => {
              if (prev.find((m) => m.id === e.message.id)) return prev;
              return [...prev, e.message];
            });

            if (isNearBottom) {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }

            if (e.message.sender_id === 1) {
              // 1 = Admin
              markAsRead(1);
            }
          })
          .listen(".MessagesRead", (e: { readerId: number }) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.receiver_id === e.readerId ? { ...m, is_read: true } : m,
              ),
            );
          })
          .listen("MessageUpdated", (e: { message: Message }) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === e.message.id ? e.message : m)),
            );
          })
          .listen(
            "MessageDeleted",
            (e: {
              messageId: number;
              senderId: number;
              receiverId: number;
            }) => {
              setMessages((prev) => prev.filter((m) => m.id !== e.messageId));
            },
          )
          .listen(".UserTyping", (e: { senderId: number }) => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          });
      }
    }

    return () => {
      if (currentUser) {
        const echo = getEchoInstance();
        if (echo) {
          echo.leave(`messages.${currentUser.id}`);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (page === 1 && !scrollInfoRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, page]);

  useLayoutEffect(() => {
    if (scrollInfoRef.current && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const { scrollHeight: prevScrollHeight, scrollTop: prevScrollTop } =
        scrollInfoRef.current;

      container.scrollTop =
        prevScrollTop + (container.scrollHeight - prevScrollHeight);
      scrollInfoRef.current = null;
    }
  }, [messages]);

  useEffect(() => {
    if (loadingMessages && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, [loadingMessages]);

  useEffect(() => {
    if (isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isTyping]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      if (
        chatContainerRef.current.scrollTop < 10 &&
        hasMore &&
        !loadingMessages &&
        !isLoadingRef.current
      ) {
        fetchMessages(page + 1);
      }
    }
  };

  const handleImageLoad = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView();
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("receiver_id", "1");
      if (input.trim()) formData.append("message", input.trim());
      if (selectedFile) formData.append("file", selectedFile);

      const res = await apiFetch("/api/messages", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        setSelectedFile(null);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        console.error("Failed to send message");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    const now = Date.now();
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      apiFetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // default admin receiver is 1 for vendors
        body: JSON.stringify({ receiver_id: 1 }),
      }).catch((err) => console.error("Typing emit failed", err));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-135px)] bg-background">
      {/* Admin info card */}
      <div className="px-6 pt-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-background px-5 py-4">
          <div className="flex items-center gap-3">
            {loading && !adminInfo ? (
              <>
                <div className="w-10 h-10 rounded-full bg-secondary animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-secondary animate-pulse rounded" />
                  <div className="h-3 w-32 bg-secondary animate-pulse rounded" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={adminInfo?.avatar || undefined} alt={adminInfo?.name || "Admin"} />
                  <AvatarFallback className="text-sm font-semibold bg-secondary text-foreground">
                    {adminInfo?.name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">
                    {adminInfo?.name || "Loading..."} (Admin)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SkySail Operations
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-12 py-6 flex flex-col gap-4"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            {loadingMessages && page > 1 && (
              <div className="flex justify-center py-3">
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#C49A3C]/10 to-[#A46909]/10 rounded-full border border-[#C49A3C]/20">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#C49A3C] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#B48122] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#A46909] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <span className="text-xs font-medium bg-gradient-to-r from-[#C49A3C] to-[#A46909] bg-clip-text text-transparent ml-1">
                    Loading older messages...
                  </span>
                </div>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  No messages yet
                </span>
              </div>
            ) : !hasMore && !loading && !loadingMessages ? (
              <div className="flex justify-center py-4">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                  Start of conversation
                </span>
              </div>
            ) : null}

            {messages.map((msg) =>
              msg.sender_id !== user?.id ? (
                <div key={msg.id} className="flex items-end gap-2 max-w-[75%]">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={adminInfo?.avatar || undefined} alt={adminInfo?.name || "Admin"} />
                    <AvatarFallback className="text-xs font-semibold bg-secondary text-foreground">
                      {adminInfo?.name?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    {msg.file_url && msg.file_type?.startsWith("image/") && (
                      <div className="mb-2 max-w-[200px] overflow-hidden rounded-xl border border-border bg-secondary/20 min-h-[100px]">
                        <img
                          src={msg.file_url}
                          alt="attachment"
                          className="w-full h-auto object-cover"
                          onLoad={handleImageLoad}
                        />
                      </div>
                    )}
                    {msg.file_url && !msg.file_type?.startsWith("image/") && (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-2 flex items-center gap-2 p-2 rounded-xl border border-border bg-secondary/50 text-xs hover:bg-secondary transition-colors max-w-[200px]"
                      >
                        <Paperclip size={14} className="shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium">
                            {msg.file_name}
                          </span>
                          {msg.file_size && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatBytes(msg.file_size)}
                            </span>
                          )}
                        </div>
                      </a>
                    )}
                    {msg.message && (
                      <div className="rounded-2xl rounded-tl-sm bg-background border border-border px-4 py-3 text-sm break-all whitespace-pre-wrap">
                        {msg.message}
                        {msg.is_edited && (
                          <span className="text-[10px] text-muted-foreground ml-2 italic">
                            (edited)
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="flex items-end gap-2 max-w-[75%] self-end flex-row-reverse"
                >
                  <div className="min-w-0">
                    {msg.file_url && msg.file_type?.startsWith("image/") && (
                      <div className="mb-2 max-w-[200px] overflow-hidden rounded-xl border border-primary/20 bg-primary/5 min-h-[100px]">
                        <img
                          src={msg.file_url}
                          alt="attachment"
                          className="w-full h-auto object-cover"
                          onLoad={handleImageLoad}
                        />
                      </div>
                    )}
                    {msg.file_url && !msg.file_type?.startsWith("image/") && (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-2 flex items-center gap-2 p-2 rounded-xl border border-primary/20 bg-primary/10 text-xs hover:bg-primary/20 transition-colors max-w-[200px] text-foreground"
                      >
                        <Paperclip size={14} className="shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium">
                            {msg.file_name}
                          </span>
                          {msg.file_size && (
                            <span className="text-[10px] text-primary/70">
                              {formatBytes(msg.file_size)}
                            </span>
                          )}
                        </div>
                      </a>
                    )}
                    {msg.message && (
                      <div className="rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-3 text-sm break-all whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1 mr-1">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.is_read ? (
                        <CheckCheck size={14} className="text-blue-500" />
                      ) : (
                        <Check size={14} />
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
            {isTyping && (
              <div className="flex items-center gap-2 max-w-[75%] px-4 md:px-12 pb-2">
                <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse delay-150" />
                  <span className="ml-1">Admin is typing...</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-12 pb-6">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 max-w-[300px]">
            <div className="flex items-center gap-2 p-2 rounded-xl border border-border bg-secondary/30 text-xs w-full">
              <Paperclip size={14} className="shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate font-medium">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-2 hover:text-destructive shrink-0"
              >
                &times;
              </button>
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-background px-4 py-3 flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to SkySail Admin..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Smile size={18} />
            </button>
            {showEmojiPicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEmojiPicker(false)}
                />
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-auto sm:left-auto sm:bottom-12 sm:right-0 sm:translate-x-0 sm:translate-y-0 z-50 origin-center sm:origin-bottom-right scale-90 sm:scale-100">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="absolute -top-3 -right-2 h-7 px-3 flex items-center gap-1 bg-background hover:bg-secondary border border-border rounded-full text-foreground shadow-sm z-10 transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Close
                      </span>
                      <X size={14} strokeWidth={3} />
                    </button>
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        setInput((prev) => prev + emojiData.emoji)
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleSend}
            type="button"
            className="flex items-center justify-center size-9 rounded-xl bg-foreground text-background hover:opacity-80 transition-opacity shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-muted-foreground">
            Secure channel encrypted for SkySail internal use.
          </p>
        </div>
      </div>
    </div>
  );
}

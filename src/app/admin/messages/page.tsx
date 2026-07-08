"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Paperclip,
  Smile,
  Send,
  Search,
  Check,
  CheckCheck,
  ArrowLeft,
  X,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getEchoInstance } from "@/lib/echo";
import { getUser } from "@/lib/auth";
import EmojiPicker from "emoji-picker-react";

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

type Vendor = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  designation: string;
  lastMessage?: {
    message: string | null;
    created_at: string;
    is_read: boolean;
    sender_id: number;
  };
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "Architect":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Designer":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "Builder":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  }
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function AdminMessagesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastTypingSent = useRef<number>(0);
  const selectedVendorIdRef = useRef<number | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const scrollInfoRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);

  const [vendorPage, setVendorPage] = useState(1);
  const [vendorSearch, setVendorSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"vendors" | "clients">("vendors");
  const [hasMoreVendors, setHasMoreVendors] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const vendorListRef = useRef<HTMLDivElement>(null);

  const fetchVendors = async (
    pageNum: number = 1,
    searchQuery: string = vendorSearch,
    tab: "vendors" | "clients" = activeTab,
  ) => {
    try {
      setLoadingVendors(true);
      const endpoint = tab === "clients" ? "clients" : "vendors";
      const res = await apiFetch(
        `/api/admin/${endpoint}?page=${pageNum}&search=${encodeURIComponent(searchQuery)}`,
      );
      if (res.ok) {
        const data = await res.json();
        const newVendors = data.data || data;

        if (pageNum === 1) {
          setVendors(newVendors);
        } else {
          setVendors((prev) => {
            const existingIds = new Set(prev.map((v) => v.id));
            const uniqueNew = newVendors.filter(
              (v: Vendor) => !existingIds.has(v.id),
            );
            return [...prev, ...uniqueNew];
          });
        }

        if (data.current_page !== undefined) {
          setHasMoreVendors(data.current_page < data.last_page);
          setVendorPage(data.current_page);
        }
      }
    } catch (e) {
      console.error("Failed to fetch vendors", e);
    } finally {
      setLoadingVendors(false);
    }
  };

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVendors(1, vendorSearch, activeTab);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [vendorSearch, activeTab]);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);

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

            // Append message only if it belongs to the currently selected vendor thread
            setMessages((prev) => {
              if (prev.find((m) => m.id === e.message.id)) return prev;
              return [...prev, e.message];
            });

            if (isNearBottom) {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }

            if (Number(e.message.sender_id) === selectedVendorIdRef.current) {
              markAsRead(e.message.sender_id);
            }

            setVendors((prevVendors) => {
              const vId =
                Number(e.message.sender_id) === currentUser.id
                  ? Number(e.message.receiver_id)
                  : Number(e.message.sender_id);
              return prevVendors.map((v) =>
                v.id === vId
                  ? {
                      ...v,
                      lastMessage: {
                        message: e.message.message,
                        created_at: e.message.created_at,
                        is_read: e.message.is_read,
                        sender_id: e.message.sender_id,
                      },
                    }
                  : v,
              );
            });
          })
          .listen(".MessagesRead", (e: { readerId: number }) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.receiver_id === e.readerId ? { ...m, is_read: true } : m,
              ),
            );
            setVendors((prevVendors) =>
              prevVendors.map((v) =>
                v.id === e.readerId &&
                v.lastMessage &&
                v.lastMessage.sender_id !== e.readerId
                  ? { ...v, lastMessage: { ...v.lastMessage, is_read: true } }
                  : v,
              ),
            );
          })
          .listen("MessageUpdated", (e: { message: Message }) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === e.message.id ? e.message : m)),
            );
            setVendors((prevVendors) =>
              prevVendors.map((v) =>
                v.lastMessage &&
                v.lastMessage.sender_id === e.message.sender_id &&
                v.lastMessage.created_at === e.message.created_at
                  ? {
                      ...v,
                      lastMessage: {
                        ...v.lastMessage,
                        message: e.message.message,
                      },
                    }
                  : v,
              ),
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
            setTypingUsers((prev) => ({ ...prev, [e.senderId]: true }));
            setTimeout(() => {
              setTypingUsers((prev) => ({ ...prev, [e.senderId]: false }));
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

  const fetchMessages = async (
    vendorId: number,
    pageNum: number = 1,
    tab: "vendors" | "clients" = activeTab,
  ) => {
    try {
      setLoadingMessages(true);
      const param = tab === "clients" ? "client_id" : "vendor_id";
      const res = await apiFetch(
        `/api/messages?${param}=${vendorId}&page=${pageNum}`,
      );
      if (res.ok) {
        const data = await res.json();
        const newMessages = (data.data || data).reverse(); // handle if not paginated yet by some chance

        if (pageNum === 1) {
          setMessages(newMessages);
          // scroll to bottom on initial load
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
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

        setHasMore(data.current_page < data.last_page);
        setPage(data.current_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleUnsend = async (id: number) => {
    try {
      const res = await apiFetch(`/api/messages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    selectedVendorIdRef.current = vendor.id;
    setPage(1);
    setHasMore(false);
    fetchMessages(vendor.id, 1, activeTab);
    markAsRead(vendor.id);
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      if (
        chatContainerRef.current.scrollTop < 10 &&
        hasMore &&
        !loadingMessages &&
        selectedVendor
      ) {
        fetchMessages(selectedVendor.id, page + 1, activeTab);
      }
    }
  };

  const handleVendorScroll = () => {
    if (vendorListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = vendorListRef.current;
      if (
        scrollHeight - scrollTop - clientHeight < 50 &&
        hasMoreVendors &&
        !loadingVendors
      ) {
        fetchVendors(vendorPage + 1);
      }
    }
  };

  useEffect(() => {
    if (page === 1 && !scrollInfoRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers, page]);

  useLayoutEffect(() => {
    if (page > 1 && scrollInfoRef.current && chatContainerRef.current) {
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
    if (selectedVendor && typingUsers[selectedVendor.id]) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [typingUsers, selectedVendor]);

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
    if ((!input.trim() && !selectedFile) || !selectedVendor) return;

    if (editingMessage) {
      try {
        const res = await apiFetch(`/api/messages/${editingMessage.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input.trim() }),
        });
        if (res.ok) {
          const updatedMsg = await res.json();
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
          );
          setInput("");
          setEditingMessage(null);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append("receiver_id", selectedVendor.id.toString());
      if (input.trim()) formData.append("message", input.trim());
      if (selectedFile) formData.append("file", selectedFile);

      const res = await apiFetch("/api/messages", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setVendors((prevVendors) =>
          prevVendors.map((v) =>
            v.id === selectedVendor.id
              ? {
                  ...v,
                  lastMessage: {
                    message: newMsg.message,
                    created_at: newMsg.created_at,
                    is_read: newMsg.is_read,
                    sender_id: newMsg.sender_id,
                  },
                }
              : v,
          ),
        );
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
    if (!selectedVendor) return;

    const now = Date.now();
    if (now - lastTypingSent.current > 2000) {
      lastTypingSent.current = now;
      apiFetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: selectedVendor.id }),
      }).catch((err) => console.error("Typing emit failed", err));
    }
  };

  // Filter messages to show only the ones relevant to the selected vendor
  const displayedMessages = messages.filter(
    (m) =>
      Number(m.sender_id) === selectedVendor?.id ||
      Number(m.receiver_id) === selectedVendor?.id,
  );

  return (
    <div className="flex h-[calc(100dvh-135px)] bg-background overflow-hidden">
      {/* Sidebar - Vendors List */}
      <div
        className={`w-full md:w-80 shrink-0 border-r border-border flex-col h-full ${selectedVendor ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold mb-4">Messages</h2>

          <div className="flex bg-secondary/50 rounded-lg p-1 mb-4">
            <button
              onClick={() => {
                setActiveTab("vendors");
                setPage(1);
              }}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${activeTab === "vendors" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Vendors
            </button>
            <button
              onClick={() => {
                setActiveTab("clients");
                setPage(1);
              }}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${activeTab === "clients" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Clients
            </button>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder={
                activeTab === "clients"
                  ? "Search clients..."
                  : "Search vendors..."
              }
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              className="w-full bg-secondary/50 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto"
          ref={vendorListRef}
          onScroll={handleVendorScroll}
        >
          {vendors.map((vendor) => (
            <button
              key={vendor.id}
              onClick={() => handleSelectVendor(vendor)}
              className={`w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors ${selectedVendor?.id === vendor.id ? "bg-secondary/50" : ""}`}
            >
              <Image
                src={
                  vendor.avatar ||
                  `https://api.dicebear.com/9.x/avataaars/png?seed=${vendor.firstName}&size=40&backgroundColor=b6e3f4`
                }
                alt={`${vendor.firstName} ${vendor.lastName}`}
                width={40}
                height={40}
                className="rounded-full shrink-0"
                unoptimized
              />
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <p className="text-sm font-semibold truncate">
                      {vendor.firstName} {vendor.lastName}
                    </p>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md shrink-0 ${getRoleColor(vendor.designation)}`}
                    >
                      {vendor.designation || "Client"}
                    </span>
                  </div>
                  {vendor.lastMessage && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(
                        vendor.lastMessage.created_at,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate mb-1">
                  {vendor.email}
                </p>
                {typingUsers[vendor.id] ? (
                  <p className="text-xs text-blue-500 italic font-medium animate-pulse">
                    Typing...
                  </p>
                ) : vendor.lastMessage ? (
                  <p
                    className={`text-xs truncate ${!vendor.lastMessage.is_read && vendor.lastMessage.sender_id === vendor.id ? "font-bold text-foreground" : "text-muted-foreground"}`}
                  >
                    {vendor.lastMessage.sender_id === user?.id && "You: "}
                    {vendor.lastMessage.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No messages yet
                  </p>
                )}
              </div>
            </button>
          ))}
          {loadingVendors && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedVendor ? (
        <div
          className={`flex-1 flex flex-col w-full h-full ${selectedVendor ? "flex" : "hidden md:flex"}`}
        >
          {/* Header */}
          <div className="px-4 md:px-6 py-4 border-b border-border flex items-center gap-3 bg-background/95 backdrop-blur z-10 sticky top-0">
            <button
              className="md:hidden p-2 -ml-2 rounded-full hover:bg-secondary text-muted-foreground shrink-0"
              onClick={() => setSelectedVendor(null)}
            >
              <ArrowLeft size={20} />
            </button>
            <Image
              src={
                selectedVendor.avatar ||
                `https://api.dicebear.com/9.x/avataaars/png?seed=${selectedVendor.firstName}&size=40&backgroundColor=b6e3f4`
              }
              alt={`${selectedVendor.firstName} ${selectedVendor.lastName}`}
              width={40}
              height={40}
              className="rounded-full shrink-0"
              unoptimized
            />
            <div>
              <p className="text-sm font-bold">
                {selectedVendor.firstName} {selectedVendor.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {activeTab === "clients" ? "Client" : "Vendor"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-4"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {loading && page === 1 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
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
                {displayedMessages.length === 0 ? (
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

                {displayedMessages.map((msg) =>
                  msg.sender_id !== user?.id ? (
                    <div
                      key={msg.id}
                      className="flex items-end gap-2 max-w-[75%]"
                    >
                      <Image
                        src={
                          selectedVendor.avatar ||
                          `https://api.dicebear.com/9.x/avataaars/png?seed=${selectedVendor.firstName}&size=32&backgroundColor=b6e3f4`
                        }
                        alt={`${selectedVendor.firstName} ${selectedVendor.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full shrink-0"
                        unoptimized
                      />
                      <div className="min-w-0">
                        {msg.file_url &&
                          msg.file_type?.startsWith("image/") && (
                            <div className="mb-2 max-w-[200px] overflow-hidden rounded-xl border border-border bg-secondary/20 min-h-[100px]">
                              <img
                                src={msg.file_url}
                                alt="attachment"
                                className="w-full h-auto object-cover"
                                onLoad={handleImageLoad}
                              />
                            </div>
                          )}
                        {msg.file_url &&
                          !msg.file_type?.startsWith("image/") && (
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
                      className="flex items-end gap-2 max-w-[75%] self-end flex-row-reverse relative group"
                    >
                      <div className="min-w-0">
                        {msg.file_url &&
                          msg.file_type?.startsWith("image/") && (
                            <div className="mb-2 max-w-[200px] overflow-hidden rounded-xl border border-primary/20 bg-primary/5 min-h-[100px]">
                              <img
                                src={msg.file_url}
                                alt="attachment"
                                className="w-full h-auto object-cover"
                                onLoad={handleImageLoad}
                              />
                            </div>
                          )}
                        {msg.file_url &&
                          !msg.file_type?.startsWith("image/") && (
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
                          <div
                            className={`rounded-2xl rounded-tr-sm px-4 py-3 text-sm break-all whitespace-pre-wrap ${msg.is_edited ? "bg-amber-600 text-white" : "bg-foreground text-background"}`}
                          >
                            {msg.message}
                            {msg.is_edited && (
                              <span className="text-[10px] opacity-70 ml-2 italic">
                                (edited)
                              </span>
                            )}
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

                      {/* Action Menu */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
                        <button
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === msg.id ? null : msg.id,
                            )
                          }
                          className="p-1 hover:bg-secondary rounded-full text-muted-foreground"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openDropdownId === msg.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute right-0 bottom-full mb-1 bg-background border border-border rounded-lg shadow-lg py-1 z-50 w-32">
                              {!msg.file_url && (
                                <button
                                  onClick={() => {
                                    setEditingMessage(msg);
                                    setInput(msg.message || "");
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleUnsend(msg.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-secondary text-destructive flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Unsend
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ),
                )}
                {typingUsers[selectedVendor.id] && (
                  <div className="flex items-center gap-2 max-w-[75%] px-6 pb-2">
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse delay-75" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse delay-150" />
                      <span className="ml-1">
                        {selectedVendor.firstName} is typing...
                      </span>
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 pb-4">
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
                placeholder={
                  editingMessage
                    ? "Edit message..."
                    : `Message ${selectedVendor.firstName}...`
                }
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
              {editingMessage && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMessage(null);
                    setInput("");
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={handleSend}
                type="button"
                className="flex items-center justify-center size-9 rounded-xl bg-foreground text-background hover:opacity-80 transition-opacity shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-muted-foreground">
          <div className="bg-secondary/50 p-4 rounded-full mb-4">
            <Search size={32} />
          </div>
          <p>Select a vendor to start messaging</p>
        </div>
      )}
    </div>
  );
}

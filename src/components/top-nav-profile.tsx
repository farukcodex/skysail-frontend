"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellIcon, MessageSquare } from "lucide-react";
import { getUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { getEchoInstance } from "@/lib/echo";

export function TopNavProfile({ defaultRole, messagesLink, hideMessages }: { defaultRole: string, messagesLink: string, hideMessages?: boolean }) {
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);

    const fetchUnread = async () => {
      try {
        const res = await apiFetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };
    
    fetchUnread();

    const echo = getEchoInstance();
    if (currentUser && echo) {
      const channel = echo.private(`messages.${currentUser.id}`);
      channel.listen("MessageSent", (e: any) => {
        setUnreadCount((prev) => prev + 1);
      });
      return () => {
        channel.stopListening("MessageSent");
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-3 border-l border-border pl-4">
      <div className="text-right">
        <Link
          href="/profile"
          className="text-sm font-bold bg-linear-to-r from-[#C49A3C] to-[#A46909] bg-clip-text text-transparent"
        >
          {user?.name || user?.firstName ? (user?.name || `${user.firstName} ${user.lastName || ''}`) : "User"}
        </Link>
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
          {defaultRole}
        </p>
      </div>
      
      <div className="flex items-center gap-4 ml-2">
        {!hideMessages && (
          <div className="relative hover:text-[#C49A3C] transition-colors">
            <Link href={messagesLink}>
              <MessageSquare size={18} />
            </Link>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex items-center justify-center size-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}
        
        <div className="relative hover:text-[#C49A3C] transition-colors">
          <Link href="/notifications">
            <BellIcon size={18} />
          </Link>
          <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500 ring-2 ring-background" />
        </div>
      </div>
    </div>
  );
}

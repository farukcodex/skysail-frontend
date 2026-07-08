"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellIcon, MessageSquare, Loader2 } from "lucide-react";
import { getUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { getEchoInstance } from "@/lib/echo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNavProfile({ defaultRole, messagesLink, hideMessages }: { defaultRole: string, messagesLink: string, hideMessages?: boolean }) {
  const [user, setUser] = useState<any>(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [notifsOpen, setNotifsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  useEffect(() => {
    if (messagesOpen) {
      setMessagesLoading(true);
      apiFetch("/api/messages/recent")
        .then((res) => res.json())
        .then((data) => {
          setRecentMessages(Array.isArray(data) ? data : []);
          setMessagesLoading(false);
        })
        .catch(() => setMessagesLoading(false));
    }
  }, [messagesOpen]);

  useEffect(() => {
    if (notifsOpen) {
      setNotifsLoading(true);
      apiFetch("/api/notifications?per_page=5")
        .then((res) => res.json())
        .then((data) => {
          setRecentNotifications(data.data || []);
          setNotifsLoading(false);
        })
        .catch(() => setNotifsLoading(false));
    }
  }, [notifsOpen]);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);

    const fetchUnread = async () => {
      try {
        const res = await apiFetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadMsgCount(data.count || 0);
        }
        
        const notifRes = await apiFetch("/api/notifications/unread-count");
        if (notifRes.ok) {
          const data = await notifRes.json();
          setUnreadNotifCount(data.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread counts", err);
      }
    };
    
    fetchUnread();

    const echo = getEchoInstance();
    if (currentUser && echo) {
      const channel = echo.private(`messages.${currentUser.id}`);
      channel.listen("MessageSent", (e: any) => {
        setUnreadMsgCount((prev) => prev + 1);
      });
      
      const notifChannel = echo.private(`App.Models.User.${currentUser.id}`);
      notifChannel.notification((notification: any) => {
        setUnreadNotifCount((prev) => prev + 1);
      });

      return () => {
        channel.stopListening("MessageSent");
        echo.leave(`App.Models.User.${currentUser.id}`);
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-3 border-l border-border pl-4">
      <div className="text-right">
        <Link
          href="/settings"
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
          <Popover open={messagesOpen} onOpenChange={setMessagesOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="relative hover:text-[#C49A3C] transition-colors outline-none">
                <MessageSquare size={18} />
                {unreadMsgCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex items-center justify-center size-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-background">
                    {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border border-border shadow-lg">
              <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-bold">Recent Messages</p>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {messagesLoading ? (
                  <div className="flex justify-center py-6 text-muted-foreground"><Loader2 size={16} className="animate-spin" /></div>
                ) : recentMessages.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">No recent messages</div>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {recentMessages.map((msg: any) => (
                      <Link key={msg.id} href={messagesLink} className="flex items-start gap-3 p-3 hover:bg-secondary/30 transition-colors" onClick={() => setMessagesOpen(false)}>
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={msg.other_user?.avatar} />
                          <AvatarFallback className="text-xs">{msg.other_user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold truncate">{msg.other_user?.name || "Unknown"}</span>
                            <span className="text-[9px] text-muted-foreground shrink-0">{new Date(msg.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{msg.message}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-border bg-background">
                <Link href={messagesLink} onClick={() => setMessagesOpen(false)} className="block w-full text-center text-xs font-semibold py-2 rounded-md hover:bg-secondary transition-colors text-[#C49A3C]">
                  View all messages
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Popover open={notifsOpen} onOpenChange={setNotifsOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="relative hover:text-[#C49A3C] transition-colors outline-none">
              <BellIcon size={18} />
              {unreadNotifCount > 0 && (
                <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500 ring-2 ring-background" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border border-border shadow-lg">
            <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-bold">Notifications</p>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifsLoading ? (
                <div className="flex justify-center py-6 text-muted-foreground"><Loader2 size={16} className="animate-spin" /></div>
              ) : recentNotifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">No new notifications</div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {recentNotifications.map((notif: any) => (
                    <Link key={notif.id} href="/notifications" className="flex flex-col p-3 hover:bg-secondary/30 transition-colors" onClick={() => setNotifsOpen(false)}>
                      <p className="text-xs font-semibold">{notif.data?.title || "Notification"}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{notif.data?.body || notif.data?.message}</p>
                      <p className="text-[9px] text-muted-foreground mt-1.5">{new Date(notif.created_at).toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 border-t border-border bg-background">
              <Link href="/notifications" onClick={() => setNotifsOpen(false)} className="block w-full text-center text-xs font-semibold py-2 rounded-md hover:bg-secondary transition-colors text-[#C49A3C]">
                View all notifications
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

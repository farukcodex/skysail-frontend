"use client";

import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ViewNotificationModal } from "@/components/shared/ViewNotificationModal";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

type NotifType = "risk" | "decision" | "event" | "general" | string;

interface DatabaseNotification {
  id: string;
  data: {
    type?: NotifType;
    title?: string;
    body?: string;
    message?: string;
    action?: { label: string; url?: string };
    badge?: string;
  };
  read_at: string | null;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageNumbers(page: number, totalPages: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return pages;
}

function groupItems(items: DatabaseNotification[]): { label: string; items: DatabaseNotification[] }[] {
  const map = new Map<string, DatabaseNotification[]>();
  for (const n of items) {
    const date = parseISO(n.created_at);
    let group = "Earlier";
    if (isToday(date)) {
      group = "Today";
    } else if (isYesterday(date)) {
      group = "Yesterday";
    } else {
      group = format(date, "MMMM d, yyyy");
    }

    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(n);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function actionStyle(type: NotifType) {
  if (type === "risk")
    return "px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-80 transition-opacity";
  return "px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewNotification, setViewNotification] = useState<DatabaseNotification | null>(null);
  const router = useRouter();

  const fetchNotifications = async (p: number) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/notifications?page=${p}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setTotalPages(data.last_page || 1);
        setTotalItems(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await apiFetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        );
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const groups = groupItems(notifications);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
            <p className="text-sm text-muted-foreground mt-1">All notifications</p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCircle2 size={16} />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Grouped notifications */}
        <div className="flex flex-col gap-6 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-muted-foreground animate-pulse">Loading notifications...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-muted-foreground" size={24} />
              </div>
              <p className="font-medium">You're all caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No new notifications right now.</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-muted-foreground px-1">
                  {group.label}
                </p>
                <div className="rounded-2xl border border-border overflow-hidden flex flex-col divide-y divide-border">
                  {group.items.map((n) => {
                    const isUnread = !n.read_at;
                    const type = n.data.type || "general";
                    return (
                      <div
                        key={n.id}
                        className={`flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors cursor-pointer ${
                          isUnread ? "bg-secondary/10" : ""
                        }`}
                        onClick={() => {
                          setViewNotification(n);
                        }}
                      >
                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          {/* Badge + age row */}
                          {n.data.badge && (
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className="text-[9px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded"
                                style={{ borderColor: GOLD, color: GOLD }}
                              >
                                {n.data.badge}
                              </span>
                            </div>
                          )}
                          <p className={`text-sm leading-snug ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                            {n.data.title}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {n.data.body || n.data.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="shrink-0 px-3 py-1.5 rounded-full border border-border text-foreground text-xs font-semibold hover:bg-secondary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewNotification(n);
                            }}
                          >
                            View
                          </button>
                          {isUnread && (
                            <button
                              type="button"
                              className="shrink-0 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors flex items-center gap-1.5 border border-border"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(n.id);
                              }}
                            >
                              <CheckCircle2 size={14} />
                              Mark as read
                            </button>
                          )}
                          {n.data.action && (
                            <button
                              type="button"
                              className={`shrink-0 ${actionStyle(type)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isUnread) {
                                  handleMarkAsRead(n.id);
                                }
                                if (n.data.action?.url) {
                                  router.push(n.data.action.url);
                                }
                              }}
                            >
                              {n.data.action.label}
                            </button>
                          )}
                          {/* Unread dot indicator */}
                          {isUnread && (
                            <div className="shrink-0 size-2 rounded-full bg-red-500 ml-1" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-border pt-6 mt-auto">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">{totalItems}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
              </button>

              {pageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis separator
                    key={`ellipsis-${i}`}
                    className="px-1 text-xs text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className="size-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
                    style={
                      page === p
                        ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD }
                        : {}
                    }
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ViewNotificationModal
        isOpen={!!viewNotification}
        onClose={() => setViewNotification(null)}
        notification={viewNotification}
        onMarkAsRead={(id) => {
          handleMarkAsRead(id);
          setViewNotification((prev) => prev ? { ...prev, read_at: new Date().toISOString() } : null);
        }}
      />
    </div>
  );
}

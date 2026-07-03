"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

type NotifType = "risk" | "decision" | "event" | "general";

interface Notif {
  id: number;
  group: string;
  type: NotifType;
  badge?: string;
  age?: string;
  title: string;
  body: string;
  action?: { label: string };
}

const ALL_NOTIFS: Notif[] = [
  {
    id: 1,
    group: "Today",
    type: "risk",
    title: "Lumber delivery delayed — Henderson Residence.",
    body: "8-day delay flagged due to supply chain logistics. Impacts framing phase.",
    action: { label: "View Risk" },
  },
  {
    id: 2,
    group: "Today",
    type: "decision",
    badge: "PENDING DECISION",
    age: "1d ago",
    title: "Client Decision Overdue: Kitchen tile selection",
    body: "Bob Henderson. 2 days past due. Potential impact on tiling schedule.",
    action: { label: "Send Reminder" },
  },
  {
    id: 3,
    group: "Today",
    type: "event",
    title: "Upcoming Site Walkthrough: Henderson Site",
    body: "Scheduled for May 27, 10:00 AM. Stakeholders notified.",
  },
  ...Array.from({ length: 29 }, (_, i) => ({
    id: i + 4,
    group: i < 5 ? "Today" : i < 12 ? "Yesterday" : "Earlier",
    type: (["risk", "decision", "event", "general"] as NotifType[])[i % 4],
    badge: i % 4 === 1 ? "PENDING DECISION" : undefined,
    age: i % 4 === 1 ? `${i + 1}d ago` : undefined,
    title:
      i % 3 === 0
        ? "Lumber delivery delayed — Henderson Residence."
        : i % 3 === 1
          ? "Client Decision Overdue: Kitchen tile selection"
          : "Upcoming Site Walkthrough: Henderson Site",
    body:
      i % 3 === 0
        ? "8-day delay flagged due to supply chain logistics. Impacts framing phase."
        : i % 3 === 1
          ? "Bob Henderson. 2 days past due. Potential impact on tiling schedule."
          : "Scheduled for May 27, 10:00 AM. Stakeholders notified.",
    action:
      i % 3 === 0
        ? { label: "View Risk" }
        : i % 3 === 1
          ? { label: "Send Reminder" }
          : undefined,
  })),
];

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

function groupItems(items: Notif[]): { label: string; items: Notif[] }[] {
  const map = new Map<string, Notif[]>();
  for (const n of items) {
    if (!map.has(n.group)) map.set(n.group, []);
    map.get(n.group)!.push(n);
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

  const totalPages = Math.ceil(ALL_NOTIFS.length / PAGE_SIZE);
  const pageNotifs = ALL_NOTIFS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const groups = groupItems(pageNotifs);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">All notifications</p>
        </div>

        {/* Grouped notifications */}
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-muted-foreground px-1">
                {group.label}
              </p>
              <div className="rounded-2xl border border-border overflow-hidden flex flex-col divide-y divide-border">
                {group.items.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors"
                  >
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {/* Badge + age row */}
                      {n.badge && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-[9px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded"
                            style={{ borderColor: GOLD, color: GOLD }}
                          >
                            {n.badge}
                          </span>
                          {n.age && (
                            <span className="text-[10px] text-muted-foreground">
                              {n.age}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm font-bold leading-snug">{n.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.body}
                      </p>
                    </div>

                    {/* Action */}
                    {n.action && (
                      <button
                        type="button"
                        className={`shrink-0 ${actionStyle(n.type)}`}
                      >
                        {n.action.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, ALL_NOTIFS.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{ALL_NOTIFS.length}</span>
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
      </div>
    </div>
  );
}

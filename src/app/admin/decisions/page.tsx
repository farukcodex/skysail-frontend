"use client";

import { AlertTriangle, Camera, ChevronDown, ChevronLeft, ChevronRight, Eye, Send } from "lucide-react";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

const CLIENT_PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Alice Mercer — The Mercer Custom Build",
  "Tom Larsen — The Larsen Pool & Addition",
];

const URGENCY_OPTIONS = ["Normal", "High", "Critical"];

type DecisionStatus = "overdue" | "approved" | "pending" | "no-response";

interface Decision {
  id: number;
  title: string;
  dueDate: string;
  status: DecisionStatus;
}

const INITIAL_DECISIONS: Decision[] = [
  { id: 1, title: "Kitchen tile selection", dueDate: "Overdue", status: "overdue" },
  { id: 2, title: "Kitchen tile selection", dueDate: "May 29", status: "approved" },
  { id: 3, title: "Window casing profile", dueDate: "May 29", status: "pending" },
  { id: 4, title: "Kitchen tile selection", dueDate: "May 29", status: "approved" },
  { id: 5, title: "Kitchen tile selection", dueDate: "May 29", status: "approved" },
  { id: 6, title: "Kitchen tile selection", dueDate: "May 29", status: "approved" },
  ...Array.from({ length: 26 }, (_, i) => ({
    id: i + 7,
    title: "Kitchen tile selection",
    dueDate: "May 29",
    status: "approved" as DecisionStatus,
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

function StatusBadge({ status }: { status: DecisionStatus }) {
  if (status === "approved")
    return (
      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-green-100 text-green-600">
        Approved
      </span>
    );
  if (status === "pending")
    return (
      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-500">
        Pending
      </span>
    );
  if (status === "no-response")
    return (
      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-secondary text-muted-foreground">
        No response
      </span>
    );
  return null;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DecisionsPage() {
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [decisions, setDecisions] = useState(INITIAL_DECISIONS);
  const [page, setPage] = useState(1);

  // form state
  const [decTitle, setDecTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState(URGENCY_OPTIONS[0]);
  const [notify, setNotify] = useState(true);

  const totalPages = Math.ceil(decisions.length / PAGE_SIZE);
  const pageDecisions = decisions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleAssign() {
    if (!decTitle.trim()) return;
    setDecisions((prev) => [
      {
        id: Date.now(),
        title: decTitle,
        dueDate: dueDate || "TBD",
        status: "pending",
      },
      ...prev,
    ]);
    setDecTitle("");
    setDescription("");
    setDueDate("");
    setUrgency(URGENCY_OPTIONS[0]);
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decision Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign and monitor client decisions for ongoing residential projects.
          </p>
        </div>

        {/* Client / Project selector */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Client / Project
          </p>
          <div className="relative">
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            >
              {CLIENT_PROJECTS.map((cp) => (
                <option key={cp} value={cp}>{cp}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — Decision table */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            {/* Panel title */}
            <div className="px-5 py-4 flex items-center gap-2">
              <span className="text-sm font-bold">Henderson Residence</span>
              <span className="text-sm text-muted-foreground font-normal">/ Milestones</span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_110px_130px_60px] px-5 py-2 border-y border-border bg-secondary/30">
              {["DECISION", "DUE DATE", "STATUS", "ACTIONS"].map((h) => (
                <p key={h} className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y divide-border">
              {pageDecisions.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-[1fr_110px_130px_60px] px-5 py-4 items-center hover:bg-secondary/20 transition-colors"
                >
                  <p className="text-sm font-semibold pr-2">{d.title}</p>

                  {/* Due date */}
                  {d.status === "overdue" ? (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <AlertTriangle size={13} />
                      <span className="text-xs font-semibold">Overdue</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{d.dueDate}</p>
                  )}

                  {/* Status */}
                  <div>
                    {d.status === "overdue" ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-secondary text-muted-foreground">
                        No response
                      </span>
                    ) : (
                      <StatusBadge status={d.status} />
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    type="button"
                    aria-label="View decision"
                    className="flex items-center justify-center size-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Eye size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border mt-auto">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, decisions.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">{decisions.length}</span>
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

          {/* RIGHT — Create new decision form */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Create new decision</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Decision title */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Decision Title
                </p>
                <input
                  type="text"
                  value={decTitle}
                  onChange={(e) => setDecTitle(e.target.value)}
                  placeholder="e.g., Cabinetry Finish"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Description / Instructions
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed requirements for the client..."
                  rows={3}
                  className="w-full border-b border-border pb-3 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Due date + Urgency row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Due Date
                  </p>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="mm/dd/yyyy"
                    className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Urgency
                  </p>
                  <div className="relative">
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full appearance-none border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none pr-6"
                    >
                      {URGENCY_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-3/4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Attach media */}
              <button
                type="button"
                className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 py-8 hover:bg-secondary/30 transition-colors"
              >
                <div
                  className="size-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${GOLD}22` }}
                >
                  <Camera size={18} style={{ color: GOLD }} />
                </div>
                <p className="text-sm font-semibold">Attach media (photos)</p>
                <p className="text-xs text-muted-foreground">
                  High-fidelity RAW or 4K files preferred for client portals
                </p>
              </button>

              {/* Push notification toggle */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send push notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notify}
                  onClick={() => setNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ backgroundColor: notify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span
                    className="inline-block size-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: notify ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </button>
              </div>

              {/* Assign button */}
              <button
                type="button"
                onClick={handleAssign}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                ASSIGN DECISION
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

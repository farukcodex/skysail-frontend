"use client";

import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const CLIENT_PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Alice Mercer — The Mercer Custom Build",
  "Tom Larsen — The Larsen Pool & Addition",
];

const BODY =
  "The primary lumber supplier has notified us of an 8-day delay due to transport issues. This may push the framing completion from June 12 to June 20. We are monitoring closely and exploring alternative suppliers. No budget impact expected at this stage.";

type RiskStatus = "active" | "monitor" | "resolved";

interface Risk {
  id: number;
  title: string;
  date: string;
  body: string;
  status: RiskStatus;
}

const INITIAL_RISKS: Risk[] = [
  { id: 1, title: "Lumber delivery delayed — Henderson Residence", date: "May 22", body: BODY, status: "active" },
  { id: 2, title: "Lumber delivery delayed — Henderson Residence", date: "May 22", body: BODY, status: "monitor" },
  { id: 3, title: "Lumber delivery delayed — Henderson Residence", date: "May 22", body: BODY, status: "monitor" },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: i + 4,
    title: "Foundation survey discrepancy",
    date: "May 22",
    body: BODY,
    status: "resolved" as RiskStatus,
  })),
  ...Array.from({ length: 22 }, (_, i) => ({
    id: i + 11,
    title: "Foundation survey discrepancy",
    date: "May 22",
    body: BODY,
    status: "resolved" as RiskStatus,
  })),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

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

function ResolveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-bold tracking-wide hover:opacity-80 transition-opacity"
    >
      RESOLVE
    </button>
  );
}

function StatusBadge({ status }: { status: RiskStatus }) {
  if (status === "active")
    return (
      <span className="shrink-0 px-3 py-1.5 rounded-full border border-border text-[11px] font-bold tracking-wide text-muted-foreground">
        ACTIVE
      </span>
    );
  if (status === "monitor")
    return (
      <span className="shrink-0 px-3 py-1.5 rounded-full border border-border text-[11px] font-bold tracking-wide text-muted-foreground">
        MONITOR
      </span>
    );
  return null;
}

function RiskCard({
  risk,
  onResolve,
}: {
  risk: Risk;
  onResolve: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-bold leading-snug">{risk.title}</p>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={11} />
            <span className="text-[11px]">{risk.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ResolveButton onClick={() => onResolve(risk.id)} />
          <StatusBadge status={risk.status} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{risk.body}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RisksPage() {
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [risks, setRisks] = useState(INITIAL_RISKS);
  const [page, setPage] = useState(1);

  // form
  const [riskTitle, setRiskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notify, setNotify] = useState(true);

  function handleResolve(id: number) {
    setRisks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)),
    );
  }

  function handleAdd() {
    if (!riskTitle.trim()) return;
    setRisks((prev) => [
      { id: Date.now(), title: riskTitle, date: "Today", body: description, status: "active" },
      ...prev,
    ]);
    setRiskTitle("");
    setDescription("");
    setPage(1);
  }

  const active = risks.filter((r) => r.status !== "resolved");
  const resolved = risks.filter((r) => r.status === "resolved");
  const allPageable = [...active, ...resolved];
  const totalPages = Math.ceil(allPageable.length / PAGE_SIZE);
  const pageItems = allPageable.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageActive = pageItems.filter((r) => r.status !== "resolved");
  const pageResolved = pageItems.filter((r) => r.status === "resolved");

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk &amp; Issue Oversight</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Flag, monitor, and resolve project risks
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
          {/* LEFT — risk list */}
          <div className="flex flex-col gap-6">
            {/* Active risks */}
            {pageActive.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-1">
                  Active Risks
                </p>
                <div className="rounded-2xl border border-border p-4 flex flex-col gap-3">
                  {pageActive.map((r) => (
                    <RiskCard key={r.id} risk={r} onResolve={handleResolve} />
                  ))}
                </div>
              </div>
            )}

            {/* Resolved risks */}
            {pageResolved.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-1">
                  Resolved Risks
                </p>
                <div className="rounded-2xl border border-border p-4 flex flex-col gap-3">
                  {pageResolved.map((r) => (
                    <RiskCard key={r.id} risk={r} onResolve={handleResolve} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, allPageable.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">{allPageable.length}</span>
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

          {/* RIGHT — Flag new risk form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Flag New Risk</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Risk title */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Risk Title
                </p>
                <input
                  type="text"
                  value={riskTitle}
                  onChange={(e) => setRiskTitle(e.target.value)}
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
                  rows={5}
                  className="w-full border-b border-border pb-3 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

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

              {/* Add button */}
              <button
                type="button"
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                ADD
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

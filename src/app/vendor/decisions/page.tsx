"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ImagePlus,
  Info,
} from "lucide-react";

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

type DecisionStatus = "OVERDUE" | "APPROVED" | "PENDING" | "NORESPONSE";

interface Decision {
  id: number;
  title: string;
  dueDate: string;
  clientStatus: DecisionStatus;
  adminStatus: DecisionStatus;
}

const ALL_DECISIONS: Decision[] = [
  {
    id: 1,
    title: "Kitchen tile selection",
    dueDate: "",
    clientStatus: "OVERDUE",
    adminStatus: "PENDING",
  },
  {
    id: 2,
    title: "Kitchen tile selection",
    dueDate: "May 29",
    clientStatus: "APPROVED",
    adminStatus: "APPROVED",
  },
  {
    id: 3,
    title: "Window casing profile",
    dueDate: "May 29",
    clientStatus: "PENDING",
    adminStatus: "PENDING",
  },
  {
    id: 4,
    title: "Kitchen tile selection",
    dueDate: "May 29",
    clientStatus: "APPROVED",
    adminStatus: "APPROVED",
  },
  {
    id: 5,
    title: "Kitchen tile selection",
    dueDate: "May 29",
    clientStatus: "APPROVED",
    adminStatus: "APPROVED",
  },
  {
    id: 6,
    title: "Kitchen tile selection",
    dueDate: "May 29",
    clientStatus: "APPROVED",
    adminStatus: "APPROVED",
  },
  ...Array.from({ length: 26 }, (_, i) => ({
    id: i + 7,
    title: "Kitchen tile selection",
    dueDate: "May 29",
    clientStatus: "APPROVED" as DecisionStatus,
    adminStatus: "APPROVED" as DecisionStatus,
  })),
];

function StatusBadge({ status, date }: { status: DecisionStatus; date?: string }) {
  if (status === "OVERDUE") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
        <AlertTriangle size={12} />
        Overdue
      </span>
    );
  }
  if (status === "APPROVED") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
        APPROVED
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
        PENDING
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
      NO RESPONSE
    </span>
  );
}

export default function VendorDecisionsPage() {
  const [page, setPage] = useState(1);
  const [notifyToggle, setNotifyToggle] = useState(false);
  const totalPages = Math.ceil(ALL_DECISIONS.length / PAGE_SIZE);
  const pageDecisions = ALL_DECISIONS.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function pageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="font-bold">All </span>
          <span className="text-muted-foreground font-normal">decisions</span>
        </h1>

        {/* Info banner */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-200">
          <Info size={16} className="shrink-0" />
          <span>
            When you create a decision, submit it for admin review. It will
            update on the client portal only after admin confirms it.
          </span>
        </div>

        {/* CLIENT/PROJECT dropdown */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="vendor-decision-project"
            className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground whitespace-nowrap"
          >
            Client / Project
          </label>
          <select
            id="vendor-decision-project"
            className="rounded-xl bg-secondary/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
          >
            <option>Bob Henderson — The Henderson Residence</option>
          </select>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: decision table */}
          <div className="rounded-2xl border border-border bg-background overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">
                Henderson Residence / Milestones
              </p>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-4 py-3">
                      Decision
                    </th>
                    <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-4 py-3">
                      Due Date
                    </th>
                    <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-4 py-3">
                      Client Status
                    </th>
                    <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-4 py-3">
                      Admin Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageDecisions.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-xs">
                        {d.title}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {d.dueDate || (
                          <span className="text-red-500 flex items-center gap-1 text-xs">
                            <AlertTriangle size={11} /> Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.clientStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.adminStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, ALL_DECISIONS.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {ALL_DECISIONS.length}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                {pageNumbers().map((p, i) =>
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
                          ? {
                              backgroundColor: GOLD,
                              color: "#fff",
                              borderColor: GOLD,
                            }
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
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: create form */}
          <div className="rounded-2xl border border-border bg-background px-6 py-5 flex flex-col gap-5">
            <p className="text-sm font-semibold">Create new decision</p>

            {/* Decision title */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="decision-title"
                className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
              >
                Decision Title
              </label>
              <input
                id="decision-title"
                type="text"
                placeholder="e.g., Cabinetry Finish"
                className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="decision-desc"
                className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
              >
                Description / Instructions
              </label>
              <textarea
                id="decision-desc"
                rows={3}
                placeholder="Detailed requirements for the client..."
                className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition resize-none"
              />
            </div>

            {/* Due date + Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="decision-due"
                  className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  Due Date
                </label>
                <input
                  id="decision-due"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="decision-urgency"
                  className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  Urgency
                </label>
                <select
                  id="decision-urgency"
                  className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>

            {/* Media dropzone */}
            <div className="rounded-xl border-2 border-dashed border-border px-4 py-6 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[#C49A3C]/50 transition-colors">
              <ImagePlus size={24} className="text-muted-foreground" />
              <p className="text-sm font-bold">Attach media (photos)</p>
              <p className="text-xs text-muted-foreground">
                High-fidelity RAW or 4K files preferred for client portals
              </p>
            </div>

            {/* Push notification toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="push-notify"
                className="text-sm font-medium cursor-pointer"
              >
                Send push notification?
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={notifyToggle}
                onClick={() => setNotifyToggle((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notifyToggle ? "bg-foreground" : "bg-border"
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-background shadow transition-transform ${
                    notifyToggle ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            >
              ASSIGN DECISION ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

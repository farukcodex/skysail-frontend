"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ImagePlus,
} from "lucide-react";

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

type DocStatus = "PENDING" | "APPROVED";

interface Doc {
  id: number;
  name: string;
  size: string;
  status: DocStatus;
  note: string;
}

const ALL_DOCS: Doc[] = [
  {
    id: 1,
    name: "Living room mood board v2",
    size: "4.2 MB",
    status: "PENDING",
    note: "Updated to reflect client preference for warmer tones as discussed",
  },
  {
    id: 2,
    name: "Living room mood board v2",
    size: "4.2 MB",
    status: "APPROVED",
    note: "Updated to reflect client preference for warmer tones as discussed",
  },
  {
    id: 3,
    name: "Living room mood board v2",
    size: "4.2 MB",
    status: "PENDING",
    note: "Updated to reflect client preference for warmer tones as discussed",
  },
  ...Array.from({ length: 29 }, (_, i) => ({
    id: i + 4,
    name: "Living room mood board v2",
    size: "4.2 MB",
    status: (i % 2 === 0 ? "APPROVED" : "PENDING") as DocStatus,
    note: "Updated to reflect client preference for warmer tones as discussed",
  })),
];

type FilterTab = "All" | "Pending" | "Approved";
const TABS: FilterTab[] = ["All", "Pending", "Approved"];

export default function VendorDocumentsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filtered =
    activeTab === "All"
      ? ALL_DOCS
      : ALL_DOCS.filter((d) =>
          activeTab === "Pending" ? d.status === "PENDING" : d.status === "APPROVED",
        );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageDocs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab);
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="font-bold">All </span>
          <span className="text-muted-foreground font-normal">documents</span>
        </h1>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: document list */}
          <div className="rounded-2xl border border-border bg-background overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className="relative px-5 py-3 text-sm font-semibold transition-colors"
                  style={{ color: activeTab === tab ? GOLD : "" }}
                >
                  {tab}
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 origin-left"
                    style={{
                      background: GOLD,
                      transform:
                        activeTab === tab ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Doc list */}
            <div className="flex flex-col divide-y divide-border flex-1">
              {pageDocs.map((doc, i) => (
                <div key={doc.id} className="px-5 py-4 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 size-9 rounded-lg bg-secondary flex items-center justify-center">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">
                        {doc.name}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {doc.size}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`inline-block size-1.5 rounded-full ${
                          doc.status === "PENDING"
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          doc.status === "PENDING"
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {doc.status === "PENDING" ? "PENDING REVIEW" : "APPROVED"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                      &ldquo;{doc.note}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        className="text-xs font-semibold hover:opacity-60 transition-opacity"
                        style={{ color: GOLD }}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {i === 2 ? "Cancel" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length}
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
                {pageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis separator
                      key={`ellipsis-${idx}`}
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

          {/* Right: upload form */}
          <div className="rounded-2xl border border-border bg-background px-6 py-5 flex flex-col gap-5">
            <p className="text-sm font-semibold">Upload document</p>

            {/* Document type + title */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="doc-type"
                  className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  Document Type
                </label>
                <select
                  id="doc-type"
                  className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                >
                  <option>Mood board</option>
                  <option>Contract</option>
                  <option>Plan</option>
                  <option>Report</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="doc-title"
                  className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  Document Title
                </label>
                <input
                  id="doc-title"
                  type="text"
                  className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                />
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="doc-note"
                className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
              >
                Note to Admin{" "}
                <span className="normal-case text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="doc-note"
                rows={3}
                placeholder="Briefly explain changes or context for approval..."
                className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition resize-none"
              />
            </div>

            {/* Dropzone */}
            <div className="rounded-xl border-2 border-dashed border-border px-4 py-8 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[#C49A3C]/50 transition-colors">
              <ImagePlus size={24} className="text-muted-foreground" />
              <p className="text-sm font-bold">
                Click to choose file or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Allowed formats: PDF, DWG, JPG, PNG
              </p>
              <p className="text-xs text-muted-foreground">
                Size limit: max 50MB
              </p>
            </div>

            {/* Submit */}
            <button
              type="button"
              className="w-full py-3.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            >
              SUBMIT FOR REVIEW ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

const CLIENT_PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Alice Mercer — The Mercer Custom Build",
  "Tom Larsen — The Larsen Pool & Addition",
];

const CATEGORIES = [
  "Plans & drawings",
  "Contracts",
  "Permits",
  "Invoices",
  "Photos",
  "Reports",
];

interface Doc {
  id: number;
  name: string;
  category: string;
  size: string;
  date: string;
}

const ALL_DOCS: Doc[] = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  name: "Construction contract — signed",
  category: "CONTRACTS",
  size: "2.1 MB",
  date: "JAN 10",
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageNumbers(
  page: number,
  totalPages: number,
): (number | "...")[] {
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

// ─── PDF Icon ─────────────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <div className="shrink-0 w-10 h-12 relative flex items-center justify-center">
      <div className="absolute inset-0 bg-muted rounded-md border border-border" />
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-t-background border-l-[10px] border-l-transparent" />
      <span className="relative text-[9px] font-bold text-red-500 tracking-wide mt-2">
        PDF
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [docName, setDocName] = useState("");
  const [notify, setNotify] = useState(true);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(ALL_DOCS.length / PAGE_SIZE);
  const pageDocs = ALL_DOCS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Document management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and organise files
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
                <option key={cp} value={cp}>
                  {cp}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — Document list */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4">
              <p className="text-sm font-semibold">All documents</p>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {pageDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                >
                  <PdfIcon />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{doc.name}</p>
                    <p className="text-[10px] font-bold tracking-wider mt-0.5">
                      <span style={{ color: GOLD }}>{doc.category}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        &bull; {doc.size} &bull; {doc.date}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      aria-label="Delete document"
                      className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Download document"
                      className="size-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Upload size={15} className="rotate-180" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border mt-auto">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, ALL_DOCS.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {ALL_DOCS.length}
                </span>
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
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Upload form */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Upload document</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Category selection */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Category Selection
                </p>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-transparent border-b border-border pb-3 pr-8 text-sm font-medium focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-1 top-1/2 -translate-y-3/4 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              {/* Document name */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Document Name
                </p>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Document name"
                  className="w-full bg-transparent border-b border-border pb-3 text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Drag-and-drop zone */}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                }}
                className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 py-10 transition-colors"
                style={{
                  borderColor: dragging ? GOLD : undefined,
                  backgroundColor: dragging ? `${GOLD}11` : undefined,
                }}
              >
                <UploadCloud
                  size={28}
                  className="text-muted-foreground"
                  style={{ color: dragging ? GOLD : undefined }}
                />
                <p className="text-sm font-semibold">
                  Drag-and-drop file upload zone
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Maximum file size 50MB
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
                    style={{
                      transform: notify
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>

              {/* Upload button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                UPLOAD DOCUMENT
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

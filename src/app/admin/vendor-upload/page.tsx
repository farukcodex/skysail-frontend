"use client";

import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const VENDOR_TABS = ["Architect", "Designer", "Builder", "General Vendor"] as const;
type VendorTab = (typeof VENDOR_TABS)[number];

const DOC_FILTER_TABS = ["All", "Pending", "Approved"] as const;
type DocFilterTab = (typeof DOC_FILTER_TABS)[number];

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

interface DocUploader {
  name: string;
  role: string;
  avatar: string;
}

interface VendorDoc {
  id: number;
  name: string;
  size: string;
  status: "pending" | "approved";
  note: string;
  uploader: DocUploader;
}

interface MilestoneRow {
  id: number;
  phase: number;
  phaseName: string;
  completion: number;
  status: "complete" | "inprogress" | "upcoming";
  targetDate: string;
  assignedVendor: { name: string; role: string };
}

const UPLOADER: DocUploader = {
  name: "Bob Henderson",
  role: "Interior designer",
  avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=40&backgroundColor=b6e3f4",
};

const DOCS: VendorDoc[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: "Living room mood board v2",
  size: "4.2 MB",
  status: i % 2 === 0 ? "pending" : "approved",
  note: "\"Updated to reflect client preference for warmer tones as discussed\"",
  uploader: UPLOADER,
}));

const MILESTONES: MilestoneRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  phase: 1,
  phaseName: "Site prep & demolition",
  completion: 100,
  status: "complete",
  targetDate: "Apr 28",
  assignedVendor: { name: "Bob Henderson", role: "Interior designer" },
}));

const PROJECTS = ["The Henderson Residence", "The Sterling Penthouse", "Ocean View Villa"];

function PdfIcon({ pending }: { pending: boolean }) {
  return (
    <div className="size-9 shrink-0 relative">
      <div className="absolute inset-0 bg-gray-100 dark:bg-muted rounded-sm border border-border" />
      <div
        className="absolute top-0 right-0 size-3 bg-background"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1 rounded-sm leading-tight py-px">
        PDF
      </div>
      {pending && (
        <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-background" />
      )}
    </div>
  );
}

function DocCard({ doc }: { doc: VendorDoc }) {
  const isPending = doc.status === "pending";
  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <PdfIcon pending={isPending} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate">{doc.name}</p>
            <span className="text-xs text-muted-foreground shrink-0">{doc.size}</span>
          </div>
          <div className="mt-1">
            {isPending ? (
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-500">
                ● Pending Review
              </span>
            ) : (
              <span className="text-[10px] font-bold tracking-widest uppercase text-green-500">
                ● Approved
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Uploded by</p>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full overflow-hidden bg-muted shrink-0">
            <Image
              src={doc.uploader.avatar}
              alt={doc.uploader.name}
              width={32}
              height={32}
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">{doc.uploader.name}</p>
            <p className="text-xs text-muted-foreground">{doc.uploader.role}</p>
          </div>
          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="bg-secondary/50 rounded-lg px-3 py-2">
        <p className="text-xs text-muted-foreground leading-relaxed">{doc.note}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
        >
          <CheckCircle2 size={14} />
          Approve
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <X size={14} />
          Reject
        </button>
      </div>
    </div>
  );
}

function DocPreviewCard({ doc }: { doc: VendorDoc }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden flex flex-col">
      {doc.status === "pending" && (
        <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 px-4 py-2 flex items-center gap-2">
          <span className="text-amber-500 text-xs">⚠</span>
          <span className="text-xs font-bold text-red-500 tracking-wider uppercase">Overdue by 2 days</span>
        </div>
      )}
      <div className="aspect-[4/3] bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-muted dark:to-muted/60">
          <div className="w-full h-full bg-[url('https://placehold.co/400x300/cccccc/999999?text=')] bg-cover bg-center opacity-60" />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <p className="text-base font-bold leading-snug">Primary kitchen tile selection</p>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Uploaded by</p>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full overflow-hidden bg-muted shrink-0">
              <Image
                src={doc.uploader.avatar}
                alt={doc.uploader.name}
                width={28}
                height={28}
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">{doc.uploader.name}</p>
              <p className="text-xs text-muted-foreground">{doc.uploader.role}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          The tile contractor needs your selection to proceed with installation.
        </p>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 size={13} />
            Approve
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <X size={13} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestoneTable() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(MILESTONES.length / PAGE_SIZE);
  const rows = MILESTONES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <p className="text-sm font-bold">
          Henderson Residence{" "}
          <span className="text-muted-foreground font-normal">/ Milestones status</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Phase", "Phase Name", "Completion %", "Status", "Target Date", "Assigned vendor", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-4 text-muted-foreground text-sm">
                  {String(m.phase).padStart(2, "0")}
                </td>
                <td className="px-5 py-4 font-medium whitespace-nowrap">{m.phaseName}</td>
                <td className="px-5 py-4 font-semibold">{m.completion}%</td>
                <td className="px-5 py-4">
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 text-xs font-bold">
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{m.targetDate}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <p className="text-sm font-bold leading-tight">{m.assignedVendor.name}</p>
                  <p className="text-xs text-muted-foreground">{m.assignedVendor.role}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 size={12} />
                      Approve
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, MILESTONES.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{MILESTONES.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorUploadPage() {
  const [activeVendorTab, setActiveVendorTab] = useState<VendorTab>("Architect");
  const [activeDocTab, setActiveDocTab] = useState<DocFilterTab>("All");
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [docPage, setDocPage] = useState(1);

  const filteredDocs = DOCS.filter((d) => {
    if (activeDocTab === "Pending") return d.status === "pending";
    if (activeDocTab === "Approved") return d.status === "approved";
    return true;
  });
  const docTotalPages = Math.ceil(filteredDocs.length / PAGE_SIZE);
  const pageDocs = filteredDocs.slice((docPage - 1) * PAGE_SIZE, docPage * PAGE_SIZE);
  const previewDocs = DOCS.filter((d) => d.status === "pending").slice(0, 2);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight">
          Vendor{" "}
          <span className="text-muted-foreground font-normal">Upload</span>
        </h1>

        {/* Project selector */}
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
            Project
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectDropdown((v) => !v)}
              className="w-full sm:w-80 flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              {selectedProject}
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {showProjectDropdown && (
              <div className="absolute top-full mt-1 left-0 w-full sm:w-80 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                {PROJECTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedProject(p);
                      setShowProjectDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors"
                    style={{ fontWeight: selectedProject === p ? 700 : 400 }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vendor type tabs */}
        <div className="relative flex gap-0 border-b border-border">
          {VENDOR_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveVendorTab(tab)}
              className="relative px-4 pb-3 text-sm font-medium transition-colors z-10"
              style={{
                color: activeVendorTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {tab}
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 origin-left"
                style={{
                  backgroundColor: "var(--foreground)",
                  transform: activeVendorTab === tab ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Two-column: doc list + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: documents list */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            {/* Doc filter tabs */}
            <div className="relative flex gap-0 border-b border-border px-4">
              {DOC_FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveDocTab(tab);
                    setDocPage(1);
                  }}
                  className="relative px-4 py-3 text-sm font-medium transition-colors z-10"
                  style={{
                    color: activeDocTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {tab}
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 origin-left"
                    style={{
                      backgroundColor: "var(--foreground)",
                      transform: activeDocTab === tab ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </button>
              ))}
            </div>

            <p className="px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
              All documents
            </p>

            <div className="flex flex-col gap-3 p-4">
              {pageDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </div>

            {/* Doc pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-auto">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredDocs.length === 0 ? 0 : (docPage - 1) * PAGE_SIZE + 1}–{Math.min(docPage * PAGE_SIZE, filteredDocs.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filteredDocs.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={docPage === 1}
                  onClick={() => setDocPage((p) => p - 1)}
                  className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={12} />
                </button>
                {Array.from({ length: Math.min(docTotalPages, 4) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDocPage(p)}
                    className="size-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
                    style={
                      docPage === p
                        ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD }
                        : {}
                    }
                  >
                    {p}
                  </button>
                ))}
                {docTotalPages > 4 && (
                  <>
                    <span className="px-1 text-xs text-muted-foreground">...</span>
                    <button
                      type="button"
                      onClick={() => setDocPage(docTotalPages)}
                      className="size-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
                      style={
                        docPage === docTotalPages
                          ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD }
                          : {}
                      }
                    >
                      {docTotalPages}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={docPage === docTotalPages || docTotalPages === 0}
                  onClick={() => setDocPage((p) => p + 1)}
                  className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: preview cards */}
          <div className="flex flex-col gap-4">
            {previewDocs.map((doc) => (
              <DocPreviewCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>

        {/* Milestones table */}
        <MilestoneTable />
      </div>
    </div>
  );
}

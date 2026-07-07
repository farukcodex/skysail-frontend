"use client";

import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectCombobox } from "../updates/ProjectCombobox";

// ─── Data ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const GOLD = "#C49A3C";

type RiskStatus = "active" | "monitoring" | "resolved";

interface Risk {
  id: number;
  project_id: number;
  project_name: string;
  title: string;
  date: string;
  body: string;
  status: RiskStatus;
}

interface Project {
  id: number;
  name: string;
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

function RiskCard({
  risk,
  onStatusChange,
}: {
  risk: Risk;
  onStatusChange: (id: number, status: RiskStatus) => void;
}) {
  const getStatusColor = (status: RiskStatus) => {
    if (status === "active") return "text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50";
    if (status === "monitoring") return "text-[#C49A3C] bg-[#C49A3C]/10 border border-[#C49A3C]/20";
    return "text-green-600 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50";
  };

  return (
    <div className="rounded-2xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-bold leading-snug">{risk.title}</p>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold text-[#C49A3C]">{risk.project_name}</span>
            <span>&bull;</span>
            <Calendar size={11} />
            <span className="text-[11px]">{risk.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 shrink-0 pl-3 pr-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase cursor-pointer focus:outline-none transition-opacity hover:opacity-80 ${getStatusColor(risk.status)}`}
              >
                {risk.status}
                <ChevronDown size={14} className="opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem 
                onClick={() => onStatusChange(risk.id, "active")}
                className="text-[11px] font-bold tracking-widest uppercase cursor-pointer"
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(risk.id, "monitoring")}
                className="text-[11px] font-bold tracking-widest uppercase cursor-pointer"
              >
                Monitoring
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(risk.id, "resolved")}
                className="text-[11px] font-bold tracking-widest uppercase cursor-pointer"
              >
                Resolved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{risk.body}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RisksPage() {
  const [clientProjectId, setClientProjectId] = useState<string>("");
  const [formProjectId, setFormProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form
  const [riskTitle, setRiskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RiskStatus>("active");
  const [notify, setNotify] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [risksRes, projRes] = await Promise.all([
        apiFetch("/api/risks" + (clientProjectId ? `?project_id=${clientProjectId}` : "")),
        apiFetch("/api/projects?all=1")
      ]);
      if (risksRes.ok) {
        const data = await risksRes.json();
        setRisks(data.data || []);
      }
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [clientProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(id: number, newStatus: RiskStatus) {
    try {
      const res = await apiFetch(`/api/admin/risks/${id}/status`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success("Risk status updated");
        fetchData();
      } else {
        toast.error("Failed to update risk status");
      }
    } catch {
      toast.error("Error updating risk status");
    }
  }

  async function handleAdd() {
    if (!riskTitle.trim()) {
      toast.error("Risk title is required");
      return;
    }
    if (!formProjectId) {
      toast.error("Please select a project");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: formProjectId,
          title: riskTitle,
          description: description,
          status: status,
        })
      });
      if (res.ok) {
        toast.success("Risk added successfully");
        setRiskTitle("");
        setDescription("");
        setStatus("active");
        setFormProjectId("");
        setPage(1);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to add risk");
      }
    } catch {
      toast.error("Error adding risk");
    } finally {
      setIsSubmitting(false);
    }
  }

  const active = risks.filter((r) => r.status !== "resolved");
  const resolved = risks.filter((r) => r.status === "resolved");
  const allPageable = [...active, ...resolved];
  const totalPages = Math.ceil(allPageable.length / PAGE_SIZE) || 1;
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
          <div className="relative max-w-md w-full">
            <ProjectCombobox
              projects={projects as any}
              value={clientProjectId || "all"}
              onChange={(val) => { setClientProjectId(val === "all" ? "" : val); setPage(1); }}
            />
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — risk list */}
          <div className="flex flex-col gap-6">
            {isLoading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
            ) : risks.length === 0 ? (
               <div className="border border-border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground">
                 <p className="text-sm font-medium">No risks found.</p>
               </div>
            ) : (
              <>
                {/* Active risks */}
                {pageActive.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-1">
                      Active Risks
                    </p>
                    <div className="rounded-2xl border border-border p-4 flex flex-col gap-3">
                      {pageActive.map((r) => (
                        <RiskCard key={r.id} risk={r} onStatusChange={handleStatusChange} />
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
                        <RiskCard key={r.id} risk={r} onStatusChange={handleStatusChange} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {allPageable.length > PAGE_SIZE && (
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
              </>
            )}
          </div>

          {/* RIGHT — Flag new risk form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Flag New Risk</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 w-full">
                <ProjectCombobox
                  projects={projects as any}
                  value={formProjectId}
                  onChange={(val) => setFormProjectId(val === "all" ? "" : val)}
                  label="Project"
                />
              </div>

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

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Initial Status
                </p>
                <Select value={status} onValueChange={(val) => setStatus(val as RiskStatus)}>
                  <SelectTrigger className="w-full border-0 border-b border-border bg-transparent rounded-none px-0 pb-3 h-auto focus-visible:ring-0 focus-visible:border-[#C49A3C]/40 text-sm">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "ADD"}
                {!isSubmitting && <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

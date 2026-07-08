"use client";

import { CheckCircle2, ChevronDown, Info, Loader2, Clock, SlidersHorizontal } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "upcoming" | "in-progress" | "pending_review" | "completed";

interface Milestone {
  id: number;
  project_id: number;
  project_name: string;
  phase: number;
  name: string;
  completion_percent: number;
  status: Status;
  target_date: string | null;
  document_url?: string | null;
  document_title?: string | null;
}

function MiniPdfIcon() {
  return (
    <div className="size-7 shrink-0 relative">
      <div className="absolute inset-0 bg-gray-100 dark:bg-muted rounded-sm border border-border" />
      <div
        className="absolute top-0 right-0 size-2 bg-background"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[6px] font-bold px-0.5 rounded-sm leading-tight py-px">
        PDF
      </div>
    </div>
  );
}

export default function VendorMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [updatingMilestone, setUpdatingMilestone] = useState<Milestone | null>(null);
  const [customPercent, setCustomPercent] = useState<number>(0);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMilestones = async () => {
    try {
      const res = await apiFetch(`/api/vendor/milestones`);
      const data = await res.json();
      if (res.ok) {
        setMilestones(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const projects = useMemo(() => {
    const map = new Map<number, string>();
    milestones.forEach(m => {
      if (!map.has(m.project_id)) map.set(m.project_id, m.project_name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [milestones]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

    // Removed legacy handleSubmitComplete since it's merged into handleUpdateProgress

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingMilestone) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("completion_percent", customPercent.toString());
      if (documentFile) {
        formData.append("document", documentFile);
      }
      if (note) {
        formData.append("note", note);
      }
      // Laravel handles PUT with file via POST + _method=PUT
      formData.append("_method", "PUT");

      const res = await apiFetch(`/api/vendor/milestones/${updatingMilestone.id}/progress`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        toast.success("Progress submitted for review!");
        fetchMilestones();
        setUpdatingMilestone(null);
        setDocumentFile(null);
        setNote("");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update progress.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name || "Select Project";
  const displayedMilestones = milestones.filter(m => m.project_id === selectedProjectId);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            My Milestones — Designer
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Milestones assigned to you by SkySail admin
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-200">
          <Info size={16} className="shrink-0" />
          <span>
            When you complete a milestone, submit it for admin review. It will
            update on the client portal only after admin confirms it.
          </span>
        </div>

        {/* CLIENT/PROJECT dropdown */}
        {isLoading ? (
          <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-muted-foreground mt-10">You have no assigned milestones.</div>
        ) : (
          <>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                Client / Project
              </p>
              <div className="relative max-w-sm">
                <button
                  type="button"
                  onClick={() => setShowDropdown((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  {selectedProjectName}
                  <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                </button>
                {showDropdown && (
                  <div className="absolute top-full mt-1 left-0 w-full bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors truncate"
                        style={{ fontWeight: selectedProjectId === p.id ? 700 : 400 }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3 w-12">
                        #
                      </th>
                      <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3">
                        Milestone Description
                      </th>
                      <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3 w-36">
                        Target Date
                      </th>
                      <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3 w-40">
                        Progress
                      </th>
                      <th className="text-right text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3 w-44">
                        Status / Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedMilestones.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                      >
                        <td className="px-5 py-5 text-xs font-bold text-muted-foreground">
                          {String(m.phase).padStart(2, "0")}
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-sm font-bold">{m.name}</p>
                          {m.document_url && (
                            <a href={m.document_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-2 group">
                              <MiniPdfIcon />
                              <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[150px]" title={m.document_title || "Attached Document"}>
                                {m.document_title || "Attached Document"}
                              </span>
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-xs font-semibold">{m.target_date || "TBD"}</p>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-semibold">
                              {m.completion_percent}%
                            </span>
                            <div className="h-1.5 rounded-full bg-border w-32">
                              <div
                                className="h-full rounded-full bg-foreground transition-all duration-300"
                                style={{ width: `${m.completion_percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-col items-end gap-2">
                            {m.status === "completed" ? (
                              <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                                <CheckCircle2 size={14} />
                                CONFIRMED
                              </span>
                            ) : m.status === "pending_review" ? (
                              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                                <Clock size={14} className="animate-spin" />
                                PENDING REVIEW
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setUpdatingMilestone(m);
                                  setCustomPercent(m.completion_percent);
                                  setDocumentFile(null);
                                  setNote("");
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                                style={{
                                  background: "linear-gradient(to right, #865B15, #C49A3C)",
                                }}
                              >
                                <SlidersHorizontal size={14} />
                                UPDATE PROGRESS
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {displayedMilestones.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                          No milestones for this project.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Modals */}
      {updatingMilestone && (
        <ModalShell
          id="update-progress"
          title="Update Milestone Progress"
          onClose={() => setUpdatingMilestone(null)}
        >
          <form onSubmit={handleUpdateProgress} className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {updatingMilestone.name}
              </h2>
              <div className="flex items-end justify-center gap-1 mb-4">
                <input
                  type="number"
                  min={updatingMilestone.completion_percent}
                  max="100"
                  value={customPercent}
                  onChange={(e) => setCustomPercent(parseInt(e.target.value) || updatingMilestone.completion_percent)}
                  className="w-24 text-center text-4xl font-bold border-b-2 border-transparent hover:border-border focus:border-amber-500 bg-transparent focus:outline-none transition-colors"
                />
                <span className="text-2xl font-bold text-muted-foreground pb-1">%</span>
              </div>
              <input 
                type="range"
                min={updatingMilestone.completion_percent}
                max="100"
                value={customPercent}
                onChange={(e) => setCustomPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs text-muted-foreground mt-3">
                Drag the slider or type a custom percentage. You cannot decrease progress below {updatingMilestone.completion_percent}%.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 border-t border-border pt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  {customPercent === 100 ? "Attach Document (Required for 100%)" : "Attach Document (Optional)"}
                </label>
                <input 
                  type="file" 
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-secondary/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Note to Admin (Optional)
                </label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Attached the invoice for this phase..."
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 bg-secondary/30 min-h-20"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || customPercent <= updatingMilestone.completion_percent || (customPercent === 100 && !documentFile)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              SUBMIT FOR APPROVAL
            </button>
          </form>
        </ModalShell>
      )}
    </div>
  );
}

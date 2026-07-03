"use client";

import { ChevronDown, Pencil, Send, Plus, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Field } from "@/components/shared/Field";
import { VendorCombobox } from "./VendorCombobox";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

type Status = "complete" | "completed" | "in-progress" | "not-started" | "upcoming" | "pending_review";

interface Project {
  id: number;
  name: string;
  vendors: { id: number; name: string; email?: string; avatar?: string }[];
}

interface Milestone {
  id: number;
  project_id: number;
  project_name: string;
  phase: number;
  name: string;
  completion_percent: number;
  status: Status;
  target_date: string | null;
  assigned_to: number | null;
  assignee_name: string | null;
  assignee_email: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: Status }) {
  if (status === "complete" || status === "completed")
    return (
      <span className="text-xs font-semibold text-green-500">Completed</span>
    );
  if (status === "pending_review")
    return (
      <span className="text-xs font-semibold text-amber-500">Pending Review</span>
    );
  if (status === "in-progress")
    return (
      <span className="text-xs font-semibold" style={{ color: GOLD }}>
        In progress
      </span>
    );
  return (
    <span className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
      Upcoming / Not Started
    </span>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function CreateMilestoneModal({ projectId, vendors, onClose, onSuccess }: { projectId: number, vendors: {id: number, name: string}[], onClose: () => void, onSuccess: () => void }) {
  const [phase, setPhase] = useState("");
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/admin/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          phase: parseInt(phase),
          name: name,
          target_date: targetDate || null,
          assigned_to: assignedTo ? parseInt(assignedTo) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Milestone created.");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to create milestone");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell id="create-milestone" title="Create Milestone" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Phase Number" type="number" id="milestone-phase" value={phase} onChange={e => setPhase(e.target.value)} required />
        <Field label="Milestone Name" id="milestone-name" value={name} onChange={e => setName(e.target.value)} required />
        <Field label="Target Date" type="date" id="milestone-date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        
        <VendorCombobox 
          vendors={vendors as any}
          value={assignedTo}
          onChange={setAssignedTo}
        />

        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Create
        </button>
      </form>
    </ModalShell>
  );
}


// ─── Page ────────────────────────────────────────────────────────────────────

export default function MilestonesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // right-panel form state
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [completion, setCompletion] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [initialVendorLabel, setInitialVendorLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [globalRequests, setGlobalRequests] = useState<Milestone[]>([]);
  const [isFetchingRequests, setIsFetchingRequests] = useState(true);

  useEffect(() => {
    // Fetch projects to populate dropdown
    apiFetch(`/api/admin/projects?all=1`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setProjects(data.data);
          setSelectedProjectId(data.data[0].id);
        } else {
          setIsLoading(false);
        }
      })
      .catch(console.error);
  }, []);

  const fetchMilestones = useCallback(async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/milestones?project_id=${selectedProjectId}`);
      const data = await res.json();
      if (res.ok) {
        setMilestones(data.data);
        if (data.data.length > 0 && !selectedMilestoneId) {
          const first = data.data[0];
          setSelectedMilestoneId(first.id);
          setCompletion(first.completion_percent.toString());
          setTargetDate(first.target_date || "");
          
          const vendorId = first.assigned_to ? first.assigned_to.toString() : "";
          setAssignedTo(vendorId);
          const vendorObj = (selectedProjectObj?.vendors || []).find(v => v.id.toString() === vendorId);
          setInitialVendorLabel(vendorObj ? vendorObj.name : "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, selectedMilestoneId]);

  const fetchGlobalRequests = useCallback(async () => {
    setIsFetchingRequests(true);
    try {
      const res = await apiFetch(`/api/milestones?status=pending_review`);
      const data = await res.json();
      if (res.ok) {
        setGlobalRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
    fetchGlobalRequests();
  }, [fetchMilestones, fetchGlobalRequests]);

  const handleSave = async () => {
    if (!selectedMilestoneId) return;
    setIsSaving(true);
    const pct = parseInt(completion) || 0;
    const m = milestones.find(ms => ms.id === selectedMilestoneId);
    let newStatus = m?.status || "upcoming";
    
    // Only auto-update status if it isn't pending review, or maybe we just override it
    if (newStatus !== "pending_review") {
      newStatus = pct >= 100 ? "completed" : (pct > 0 ? "in-progress" : "upcoming");
    }

    try {
      const res = await apiFetch(`/api/admin/milestones/${selectedMilestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completion_percent: pct,
          status: newStatus,
          assigned_to: assignedTo ? parseInt(assignedTo) : null,
          // Note: targetDate in format M j, Y might fail Laravel validation if not properly parsed.
          // We'll skip targetDate update if it's the formatted string, or ideally send a real date.
        })
      });
      if (res.ok) {
        toast.success("Milestone updated.");
        fetchMilestones();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (milestoneId: number) => {
    try {
      const res = await apiFetch(`/api/admin/milestones/${milestoneId}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Milestone approved!");
        fetchMilestones();
        fetchGlobalRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (milestoneId: number) => {
    try {
      const res = await apiFetch(`/api/admin/milestones/${milestoneId}/reject`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Progress rejected and reverted.");
        fetchMilestones();
        fetchGlobalRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject");
    }
  };

  const selectedProjectObj = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showCreate && selectedProjectId && (
        <CreateMilestoneModal 
          projectId={selectedProjectId} 
          vendors={selectedProjectObj?.vendors || []} 
          onClose={() => setShowCreate(false)} 
          onSuccess={fetchMilestones} 
        />
      )}
      
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Milestone management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update phase completion and key dates
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            disabled={!selectedProjectId}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Plus size={16} /> Add Milestone
          </button>
        </div>

        {/* Global Pending Requests Section */}
        {globalRequests.length > 0 && (
          <div className="flex flex-col gap-4 mb-2">
            <h2 className="text-sm font-bold text-amber-600 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              Action Required: Pending Approvals ({globalRequests.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {globalRequests.map((req) => (
                <div key={req.id} className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-amber-700/70 mb-1">{req.project_name}</p>
                    <p className="text-sm font-bold text-foreground">{req.name}</p>
                  </div>
                  <div className="flex justify-between items-center bg-background/50 rounded-xl p-3 border border-amber-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Vendor</span>
                      <span className="text-xs font-semibold">{req.assignee_name || "Unassigned"}</span>
                      {req.assignee_email && (
                        <span className="text-[10px] text-muted-foreground">{req.assignee_email}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Progress</span>
                      <span className="text-xs font-bold text-amber-600">{req.completion_percent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="w-1/3 py-2.5 rounded-xl bg-secondary text-muted-foreground text-xs font-bold hover:bg-secondary/70 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client / Project selector */}
        <div className="flex flex-col gap-1.5 max-w-sm">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Project
          </p>
          <div className="relative">
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            >
              {projects.length === 0 ? <option>No projects</option> : null}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
          {/* LEFT — Milestones table */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col min-h-[400px]">
            {/* Table header label */}
            <div className="px-5 py-4 flex items-center gap-2">
              <span className="text-sm font-bold">{selectedProjectObj?.name || "Select a project"}</span>
              <span className="text-sm text-muted-foreground font-normal">
                / Milestones
              </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[48px_1fr_100px_110px_100px_80px] px-5 py-2 border-y border-border bg-secondary/30">
              {["PH", "PHASE NAME", "COMPLETE %", "STATUS", "TARGET", "ACTION"].map(
                (h) => (
                  <p
                    key={h}
                    className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground"
                  >
                    {h}
                  </p>
                ),
              )}
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y divide-border flex-1">
              {isLoading ? (
                <div className="flex-1 flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-muted-foreground" size={32} />
                </div>
              ) : milestones.length === 0 ? (
                <div className="flex-1 flex justify-center items-center py-20 text-muted-foreground text-sm">
                  No milestones found.
                </div>
              ) : milestones.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[48px_1fr_100px_110px_100px_80px] px-5 py-4 items-center hover:bg-secondary/20 transition-colors"
                >
                  <p className="text-sm text-muted-foreground font-medium">
                    {String(m.phase).padStart(2, "0")}
                  </p>
                  <p className="text-sm font-semibold pr-2">{m.name}</p>
                  <p className="text-sm font-semibold">{m.completion_percent}%</p>
                  <div>
                    <StatusPill status={m.status} />
                    {m.assignee_name && <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[100px]">Assigned: {m.assignee_name}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{m.target_date || "TBD"}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Edit ${m.name}`}
                      onClick={() => {
                        setSelectedMilestoneId(m.id);
                        setCompletion(m.completion_percent.toString());
                        setTargetDate(m.target_date || "");
                      }}
                      className="flex items-center justify-center size-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — New update form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Update Milestone</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Select Milestone to Update
                </p>
                <div className="relative">
                  <select
                    value={selectedMilestoneId || ""}
                    onChange={(e) => {
                      const msId = parseInt(e.target.value);
                      setSelectedMilestoneId(msId);
                      const m = milestones.find((ms) => ms.id === msId);
                      if (m) {
                        setCompletion(m.completion_percent.toString());
                        setTargetDate(m.target_date || "");
                        
                        const vendorId = m.assigned_to ? m.assigned_to.toString() : "";
                        setAssignedTo(vendorId);
                        const vendorObj = (selectedProjectObj?.vendors || []).find(v => v.id.toString() === vendorId);
                        setInitialVendorLabel(vendorObj ? vendorObj.name : "");
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  >
                    {!selectedMilestoneId && <option value="">Select a milestone</option>}
                    {milestones.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Completion %
                </p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={completion}
                  onChange={(e) => setCompletion(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                />
              </div>

              {/* Target date (disabled in update view for simplicity unless date picker) */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Target Date (Read-only)
                </p>
                <input
                  type="text"
                  value={targetDate}
                  disabled
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-medium focus:outline-none"
                />
              </div>

              <VendorCombobox 
                vendors={selectedProjectObj?.vendors as any || []}
                value={assignedTo}
                onChange={setAssignedTo}
                initialLabel={initialVendorLabel}
              />

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !selectedMilestoneId}
                className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                SAVE UPDATE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

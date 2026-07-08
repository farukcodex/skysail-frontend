"use client";

import { ChevronDown, Pencil, Send, Plus, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ModalShell } from "@/components/shared/ModalShell";
import { Field } from "@/components/shared/Field";
import { VendorCombobox } from "./VendorCombobox";
import { ProjectCombobox } from "../updates/ProjectCombobox";
import { ManageVendorsModal } from "@/app/admin/projects/components/ManageVendorsModal";

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

function CreateMilestoneModal({ projectId, vendors, nextPhase, onClose, onSuccess, onAddVendorToProject }: { projectId: number, vendors: {id: number, name: string}[], nextPhase: number, onClose: () => void, onSuccess: () => void, onAddVendorToProject: () => void }) {
  const [phase, setPhase] = useState(nextPhase.toString());
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
          onAddVendorToProject={onAddVendorToProject}
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
  const [status, setStatus] = useState<Status | "">("");
  const [targetDate, setTargetDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [initialVendorLabel, setInitialVendorLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [manageVendorsProject, setManageVendorsProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(() => {
    apiFetch(`/api/admin/projects?all=1`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setProjects(data.data);
          setSelectedProjectId(prev => prev || data.data[0].id);
        } else {
          setIsLoading(false);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchMilestones = useCallback(async (projectId: number) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/milestones?project_id=${projectId}`);
      const data = await res.json();
      if (res.ok) {
        setMilestones(data.data);
        if (data.data.length > 0) {
          const first = data.data[0];
          setIsUnlocked(false);
          setSelectedMilestoneId(first.id);
          setCompletion(first.completion_percent.toString());
          setStatus(first.status);
          setTargetDate(first.target_date || "");
          
          const vendorId = first.assigned_to ? first.assigned_to.toString() : "";
          setAssignedTo(vendorId);
          // Just let VendorCombobox derive the label using the ID
        } else {
          setSelectedMilestoneId(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
        fetchMilestones(selectedProjectId);
    }
  }, [selectedProjectId, fetchMilestones]);

  const handleSave = async () => {
    if (!selectedMilestoneId) return;
    setIsSaving(true);
    const pct = parseInt(completion) || 0;

    try {
      const res = await apiFetch(`/api/admin/milestones/${selectedMilestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completion_percent: pct,
          status: status,
          assigned_to: assignedTo ? parseInt(assignedTo) : null,
        })
      });
      if (res.ok) {
        toast.success("Milestone updated.");
        if (selectedProjectId) fetchMilestones(selectedProjectId);
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



  const selectedProjectObj = projects.find(p => p.id === selectedProjectId);

  const selectedMilestone = milestones.find((ms) => ms.id === selectedMilestoneId);
  const originalStatus = selectedMilestone?.status || "upcoming";
  const originalCompletion = selectedMilestone?.completion_percent || 0;
  const isAlreadyCompleted = originalStatus === "completed" || originalStatus === "complete";
  const isFormDisabled = isAlreadyCompleted && !isUnlocked;

  const minCompletion = isUnlocked ? 0 : originalCompletion;

  const handleCompletionChange = (val: string) => {
    setCompletion(val);
    const num = parseInt(val) || 0;
    if (num >= 100) {
      setStatus("completed");
    } else if (num > 0 && status === "upcoming") {
      setStatus("in-progress");
    } else if (num > 0 && num < 100 && status === "completed") {
      setStatus("in-progress");
    }
  };

  const handleStatusChange = (newStatus: Status) => {
    setStatus(newStatus);
    if (newStatus === "completed") {
      setCompletion("100");
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {manageVendorsProject && (
        <ManageVendorsModal
          project={manageVendorsProject as any}
          onClose={() => setManageVendorsProject(null)}
          onSuccess={fetchProjects}
        />
      )}
      {showCreate && selectedProjectObj && (
        <CreateMilestoneModal
          projectId={selectedProjectId!}
          vendors={selectedProjectObj.vendors}
          nextPhase={milestones.length > 0 ? Math.max(...milestones.map(m => m.phase)) + 1 : 1}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            if (selectedProjectId) fetchMilestones(selectedProjectId);
          }}
          onAddVendorToProject={() => setManageVendorsProject(selectedProjectObj as any)}
        />
      )}
      {showUnlockConfirm && (
        <ModalShell id="unlock-confirm" title="Unlock Milestone" onClose={() => setShowUnlockConfirm(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to unlock this completed milestone? Modifying completed milestones can cause inconsistencies in your project timeline.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowUnlockConfirm(false)}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-semibold bg-secondary hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsUnlocked(true);
                  setShowUnlockConfirm(false);
                }}
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, Unlock
              </button>
            </div>
          </div>
        </ModalShell>
      )}
      
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Milestone management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update phase completion and key dates
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            {projects.length > 0 && (
              <div className="w-[300px]">
                <ProjectCombobox
                  projects={projects as any}
                  value={String(selectedProjectId)}
                  onChange={(val) => setSelectedProjectId(Number(val))}
                />
              </div>
            )}
            <button
              onClick={() => setShowCreate(true)}
              disabled={!selectedProjectId}
              className="flex items-center justify-center gap-2 bg-foreground text-background px-6 h-[58px] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Plus size={16} /> Add Milestone
            </button>
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
                        setIsUnlocked(false);
                        setSelectedMilestoneId(m.id);
                        setCompletion(m.completion_percent.toString());
                        setStatus(m.status);
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
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <p className="text-sm font-semibold">Update Milestone/Phase</p>
              {isAlreadyCompleted && (
                !isUnlocked ? (
                  <button
                    onClick={() => setShowUnlockConfirm(true)}
                    className="text-[10px] uppercase font-bold tracking-wider text-red-500 hover:text-red-400 transition-colors"
                  >
                    Unlock Override
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsUnlocked(false);
                      setCompletion(originalCompletion.toString());
                      setStatus(originalStatus);
                    }}
                    className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel Override
                  </button>
                )
              )}
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
                      setIsUnlocked(false);
                      setSelectedMilestoneId(msId);
                      const m = milestones.find((ms) => ms.id === msId);
                      if (m) {
                        setCompletion(m.completion_percent.toString());
                        setStatus(m.status);
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
                  min={minCompletion}
                  max="100"
                  value={completion}
                  onChange={(e) => handleCompletionChange(e.target.value)}
                  disabled={isFormDisabled}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Status
                </p>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as Status)}
                    disabled={isFormDisabled}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition disabled:opacity-50"
                  >
                    {(originalStatus === "upcoming" || isUnlocked) && <option value="upcoming">Upcoming</option>}
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
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
                disabled={isFormDisabled}
                onAddVendorToProject={() => selectedProjectObj && setManageVendorsProject(selectedProjectObj as any)}
              />

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !selectedMilestoneId || isFormDisabled}
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

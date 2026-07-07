"use client";

import { ChevronDown, Pencil, Send, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

type PhaseStatus = "completed" | "in-progress" | "pending_review" | "upcoming";
type ChangeStatus = "approved" | "pending";

interface Project {
  id: number;
  name: string;
}

interface PhaseBudget {
  id: number;
  phase: string | number;
  title: string;
  amount: number;
  spent_amount: number | null;
  status: PhaseStatus;
}

interface ChangeOrder {
  id: number;
  title: string;
  amount: number;
  status: ChangeStatus;
}

interface Spend {
  id: number;
  title: string;
  amount: number;
  status: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function PhaseStatusPill({ status }: { status: PhaseStatus }) {
  if (status === "completed")
    return <span className="text-xs font-semibold text-green-500">Completed</span>;
  if (status === "in-progress" || status === "pending_review")
    return <span className="text-xs font-semibold" style={{ color: GOLD }}>In progress</span>;
  return (
    <span className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
      Upcoming
    </span>
  );
}

function ChangeStatusPill({ status }: { status: ChangeStatus }) {
  if (status === "approved")
    return <span className="text-xs font-semibold text-green-500">Approved</span>;
  return <span className="text-xs font-semibold" style={{ color: GOLD }}>Pending review</span>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [phases, setPhases] = useState<PhaseBudget[]>([]);
  const [changes, setChanges] = useState<ChangeOrder[]>([]);
  const [spends, setSpends] = useState<Spend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Phase budget form
  const [phaseSelected, setPhaseSelected] = useState<number | null>(null);
  const [phaseAmount, setPhaseAmount] = useState("");
  const [phaseStatus, setPhaseStatus] = useState("Upcoming");
  const [isUpdatingPhase, setIsUpdatingPhase] = useState(false);

  // Change order form
  const [changeTitle, setChangeTitle] = useState("");
  const [changeAmount, setChangeAmount] = useState("");
  const [changePhaseId, setChangePhaseId] = useState<number | null>(null);
  const [changeFile, setChangeFile] = useState<File | null>(null);
  const [isAddingChange, setIsAddingChange] = useState(false);

  // Spend form
  const [spendTitle, setSpendTitle] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendPhaseId, setSpendPhaseId] = useState<number | null>(null);
  const [spendFile, setSpendFile] = useState<File | null>(null);
  const [isAddingSpend, setIsAddingSpend] = useState(false);

  // Fetch projects list
  useEffect(() => {
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

  // Fetch finances for selected project
  const fetchFinances = useCallback(async () => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/projects/${selectedProjectId}/finances`);
      const data = await res.json();
      if (res.ok) {
        const mappedBudgets = data.data.budgets.map((m: any) => ({
          id: m.id,
          phase: m.phase,
          title: m.name,
          amount: m.budget_amount,
          spent_amount: m.total_spent,
          status: m.status
        }));
        setPhases(mappedBudgets);
        setChanges(data.data.change_orders);
        setSpends(data.data.budgets.flatMap((m: any) => m.spends || []));
        
        // Default selected phase
        if (mappedBudgets.length > 0 && !phaseSelected) {
          const first = mappedBudgets[0];
          setPhaseSelected(first.id);
          setPhaseAmount(String(first.amount));
          setPhaseStatus(
            first.status === "completed" ? "Completed" : (first.status === "in-progress" || first.status === "pending_review" ? "In progress" : "Upcoming")
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load financials.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, phaseSelected]);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  async function handlePhaseSubmit() {
    if (!phaseSelected) return;
    setIsUpdatingPhase(true);
    
    const amt = Number.parseFloat(phaseAmount.replace(/[^0-9.]/g, ""));
    const statusVal = phaseStatus === "Completed" ? "completed" : (phaseStatus === "In progress" ? "in-progress" : "upcoming");

    try {
      const res = await apiFetch(`/api/admin/budgets/${phaseSelected}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: isNaN(amt) ? 0 : amt,
          status: statusVal
        })
      });
      if (res.ok) {
        toast.success("Phase budget updated!");
        fetchFinances();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update budget.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating budget.");
    } finally {
      setIsUpdatingPhase(false);
    }
  }

  async function handleChangeSubmit() {
    if (!selectedProjectId) return;
    if (!changeTitle.trim()) {
      toast.error("Please enter a title for the change order.");
      return;
    }
    if (!changePhaseId) {
      toast.error("Please select a Linked Phase.");
      return;
    }
    
    setIsAddingChange(true);
    const amt = Number.parseFloat(changeAmount.replace(/[^0-9.]/g, "")) || 0;

    try {
      const formData = new FormData();
      formData.append("title", changeTitle);
      formData.append("amount", String(amt));
      formData.append("status", "pending"); // default to pending as discussed
      formData.append("milestone_id", String(changePhaseId));
      if (changeFile) {
        formData.append("file", changeFile);
      }

      const res = await apiFetch(`/api/admin/projects/${selectedProjectId}/change-orders`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast.success("Change order added!");
        setChangeTitle("");
        setChangeAmount("");
        setChangePhaseId(null);
        setChangeFile(null);
        fetchFinances();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to add change order.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding change order.");
    } finally {
      setIsAddingChange(false);
    }
  }

  async function handleSpendSubmit() {
    if (!selectedProjectId) return;
    if (!spendTitle.trim()) {
      toast.error("Please enter a title for the expense.");
      return;
    }
    if (!spendPhaseId) {
      toast.error("Please select a Linked Phase.");
      return;
    }
    
    setIsAddingSpend(true);
    const amt = Number.parseFloat(spendAmount.replace(/[^0-9.]/g, "")) || 0;

    try {
      const formData = new FormData();
      formData.append("title", spendTitle);
      formData.append("amount", String(amt));
      formData.append("milestone_id", String(spendPhaseId));
      if (spendFile) {
        formData.append("file", spendFile);
      }

      const res = await apiFetch(`/api/admin/projects/${selectedProjectId}/spends`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast.success("Expense recorded!");
        setSpendTitle("");
        setSpendAmount("");
        setSpendPhaseId(null);
        setSpendFile(null);
        fetchFinances();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to record expense.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error recording expense.");
    } finally {
      setIsAddingSpend(false);
    }
  }

  const phaseOptions = phases.map((p) => ({ value: p.id, label: p.title }));

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Budget &amp; Financial Management
          </h1>
        </div>

        {/* Client / Project selector */}
        <div className="flex flex-col gap-1.5 max-w-sm">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Client / Project
          </p>
          <div className="relative">
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            >
              {projects.length === 0 ? <option>No projects</option> : null}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* ── Top row: Phase Budget Allocation + Phase Budget form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — table */}
          <div className="rounded-2xl border border-border overflow-hidden min-h-[300px] flex flex-col">
            <div className="px-5 py-4">
              <p className="text-sm font-bold">Phase Budget Allocation</p>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[48px_1fr_100px_100px_110px_56px] px-5 py-2 border-y border-border bg-secondary/30">
              {["PH", "PHASE NAME", "BUDGET", "SPENT", "STATUS", "ACTIONS"].map((h) => (
                <p key={h} className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
                  {h}
                </p>
              ))}
            </div>

            <div className="flex flex-col divide-y divide-border flex-1">
              {isLoading ? (
                <div className="flex-1 flex justify-center items-center py-10">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
              ) : phases.length === 0 ? (
                <div className="flex-1 flex justify-center items-center py-10 text-muted-foreground text-sm">
                  No budget phases defined.
                </div>
              ) : phases.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[48px_1fr_100px_100px_110px_56px] px-5 py-4 items-center hover:bg-secondary/20 transition-colors gap-2"
                >
                  <p className="text-sm text-muted-foreground font-medium">{String(p.phase).padStart(2, "0")}</p>
                  <p className="text-sm font-semibold pr-2 truncate">{p.title}</p>
                  <p className="text-sm font-semibold">{fmt(p.amount)}</p>
                  <p className="text-sm font-semibold text-muted-foreground">{p.spent_amount != null ? fmt(p.spent_amount) : "—"}</p>
                  <div><PhaseStatusPill status={p.status} /></div>
                  <button
                    type="button"
                    aria-label={`Edit ${p.title}`}
                    onClick={() => {
                      setPhaseSelected(p.id);
                      setPhaseAmount(String(p.amount));
                      setPhaseStatus(
                        p.status === "completed" ? "Completed" : p.status === "in-progress" || p.status === "pending_review" ? "In progress" : "Upcoming"
                      );
                    }}
                    className="flex items-center justify-center size-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Phase Budget form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Update Phase Budget</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Phase */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Phase</p>
                <div className="relative">
                  <select
                    value={phaseSelected || ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      setPhaseSelected(id);
                      const m = phases.find((p) => p.id === id);
                      if (m) {
                        setPhaseAmount(String(m.amount));
                        setPhaseStatus(
                          m.status === "completed" ? "Completed" : m.status === "in-progress" || m.status === "pending_review" ? "In progress" : "Upcoming"
                        );
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  >
                    {!phaseSelected && <option value="">Select a phase</option>}
                    {phaseOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Amount ($)</p>
                <input
                  type="number"
                  value={phaseAmount}
                  onChange={(e) => setPhaseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Status</p>
                <div className="relative">
                  <select
                    value={phaseStatus}
                    onChange={(e) => setPhaseStatus(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  >
                    {["Completed", "In progress", "Upcoming"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePhaseSubmit}
                disabled={isUpdatingPhase || !phaseSelected}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUpdatingPhase ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                SAVE UPDATE
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Change Orders list + Change Orders form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start mt-4">
          {/* LEFT — Change orders list */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold px-1">Change Orders</p>
            <div className="flex flex-col gap-3 min-h-[150px]">
              {isLoading ? (
                <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>
              ) : changes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic px-1">No change orders yet.</p>
              ) : changes.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border px-5 py-4 flex items-center justify-between gap-4 bg-card"
                >
                  <div className="flex flex-col gap-1">
                    <ChangeStatusPill status={c.status} />
                    <p className="text-sm font-medium text-muted-foreground">{c.title}</p>
                  </div>
                  <p className="text-sm font-bold shrink-0">+{fmt(c.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Change Orders form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">New Change Order</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Title</p>
                <input
                  type="text"
                  value={changeTitle}
                  onChange={(e) => setChangeTitle(e.target.value)}
                  placeholder="e.g. Upgraded insulation package"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Amount ($)</p>
                <input
                  type="number"
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Linked Phase */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Linked Phase</p>
                <div className="relative">
                  <select
                    value={changePhaseId || ""}
                    onChange={(e) => setChangePhaseId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  >
                    <option value="" disabled>Select a phase</option>
                    {phaseOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* File Upload */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Attachment (Optional)</p>
                <input
                  type="file"
                  onChange={(e) => setChangeFile(e.target.files?.[0] || null)}
                  className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleChangeSubmit}
                disabled={isAddingChange || !selectedProjectId}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isAddingChange ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                SUBMIT ORDER
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom row 2: Spends list + Spends form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start mt-4">
          {/* LEFT — Spends list */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold px-1">Recorded Expenses</p>
            <div className="flex flex-col gap-3 min-h-[150px]">
              {isLoading ? (
                <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>
              ) : spends.length === 0 ? (
                <p className="text-sm text-muted-foreground italic px-1">No expenses recorded yet.</p>
              ) : spends.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-border px-5 py-4 flex items-center justify-between gap-4 bg-card"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-muted-foreground">{s.title}</p>
                  </div>
                  <p className="text-sm font-bold shrink-0">+{fmt(s.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Spends form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Record New Expense</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Title</p>
                <input
                  type="text"
                  value={spendTitle}
                  onChange={(e) => setSpendTitle(e.target.value)}
                  placeholder="e.g. Concrete pouring"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Amount ($)</p>
                <input
                  type="number"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Linked Phase */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Linked Phase</p>
                <div className="relative">
                  <select
                    value={spendPhaseId || ""}
                    onChange={(e) => setSpendPhaseId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  >
                    <option value="" disabled>Select a phase</option>
                    {phaseOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* File Upload */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Attachment / Invoice (Optional)</p>
                <input
                  type="file"
                  onChange={(e) => setSpendFile(e.target.files?.[0] || null)}
                  className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSpendSubmit}
                disabled={isAddingSpend || !selectedProjectId}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isAddingSpend ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                RECORD EXPENSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

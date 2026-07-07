"use client";

import { ChevronDown, ChevronUp, Pencil, Send, Loader2, Download, FileText, WalletIcon, CheckCircle2, BanknoteIcon, Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectCombobox } from "../updates/ProjectCombobox";

// ─── Types ───────────────────────────────────────────────────────────────────

type PhaseStatus = "completed" | "in-progress" | "pending_review" | "upcoming";
type ChangeOrderStatus = "approved" | "pending" | "rejected";

interface Project {
  id: number;
  name: string;
  client: string;
  email?: string;
  clientAvatar?: string;
}

interface BudgetPhase {
  id: number;
  phase: number;
  name: string;
  budgeted: number;
  spent: number | null;
  status: PhaseStatus;
  change_orders: ChangeOrder[];
  total_change_orders: number;
  spends: Spend[];
}

interface Spend {
  id: number;
  title: string;
  amount: number;
  status: string;
  file_url?: string;
}

interface ChangeOrder {
  id: number;
  title: string;
  amount: number;
  status: ChangeOrderStatus;
  milestone_id: number;
  file_path?: string;
  file_url?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function StatusBadge({ status }: { status: PhaseStatus }) {
  if (status === "completed")
    return (
      <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/40 px-2.5 py-1 rounded-full">
        complete
      </span>
    );
  if (status === "in-progress" || status === "pending_review")
    return (
      <span className="text-xs font-semibold text-[#C49A3C] bg-[#C49A3C]/10 px-2.5 py-1 rounded-full">
        In progress
      </span>
    );
  return (
    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
      Upcoming
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminBudgetPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [phases, setPhases] = useState<BudgetPhase[]>([]);
  
  const [totalApprovedChanges, setTotalApprovedChanges] = useState(0);
  const [totalPendingChanges, setTotalPendingChanges] = useState(0);
  const [totalApprovedCount, setTotalApprovedCount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);

  const [expandedPhases, setExpandedPhases] = useState<number[]>([]);
  const [expandedPhaseView, setExpandedPhaseView] = useState<Record<number, "expenses" | "changes">>({});

  // Sheets state
  const [isPhaseSheetOpen, setIsPhaseSheetOpen] = useState(false);
  const [isChangeSheetOpen, setIsChangeSheetOpen] = useState(false);
  const [isSpendSheetOpen, setIsSpendSheetOpen] = useState(false);

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

  const togglePhase = (id: number) => {
    setExpandedPhases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    if (!expandedPhaseView[id]) {
      setExpandedPhaseView(prev => ({...prev, [id]: "expenses"}));
    }
  };

  // Derive totals
  const contractBudget = phases.reduce((acc, p) => acc + Number(p.budgeted || 0), 0);
  const totalSpent = phases.reduce((acc, p) => acc + Number(p.spent || 0), 0);
  const totalApprovedBudget = contractBudget + totalApprovedChanges;
  const remainingBudget = totalApprovedBudget - totalSpent;

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
          name: m.name,
          budgeted: m.budget_amount,
          spent: m.total_spent,
          status: m.status,
          change_orders: m.change_orders || [],
          total_change_orders: Number(m.total_change_orders) || 0,
          spends: m.spends || [],
        }));
        setPhases(mappedBudgets);
        
        setTotalApprovedChanges(data.data.total_approved_change_orders || 0);
        setTotalPendingChanges(data.data.total_pending_change_orders || 0);
        setTotalApprovedCount(data.data.total_approved_change_orders_count || 0);
        setTotalPendingCount(data.data.total_pending_change_orders_count || 0);

        // Default selected phase for form
        if (mappedBudgets.length > 0 && !phaseSelected) {
          const first = mappedBudgets[0];
          setPhaseSelected(first.id);
          setPhaseAmount(String(first.budgeted));
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
        setIsPhaseSheetOpen(false);
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
      formData.append("status", "pending");
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
        setIsChangeSheetOpen(false);
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
        setIsSpendSheetOpen(false);
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

  const phaseOptions = phases.map((p) => ({ 
    value: p.id, 
    label: `Phase ${p.phase}: ${p.name} (Budget: ${fmt(p.budgeted)})` 
  }));

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Budget &amp; Financial Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Full financial oversight and record keeping
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
            
            {/* Sheet Triggers */}
            <Button variant="outline" className="h-[58px] rounded-xl px-5" onClick={() => setIsPhaseSheetOpen(true)}>
              <Pencil className="mr-2 size-4" /> Update Phase
            </Button>
            <Button variant="outline" className="h-[58px] rounded-xl px-5 text-[#C49A3C] border-[#C49A3C]/30 hover:bg-[#C49A3C]/10" onClick={() => setIsChangeSheetOpen(true)}>
              <Plus className="mr-2 size-4" /> Change Order
            </Button>
            <Button className="h-[58px] rounded-xl px-5" onClick={() => setIsSpendSheetOpen(true)}>
              <Plus className="mr-2 size-4" /> Record Expense
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : !selectedProjectId ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            No projects found.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Hero stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Contract Budget — dark card */}
              <Card className="bg-foreground text-background rounded-2xl relative overflow-hidden col-span-2 md:col-span-1">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-white/10 rounded-full w-min">
                    <WalletIcon className="size-4 text-white/80" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 relative z-10">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-white/50">
                    Contract Budget
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {fmt(contractBudget)}
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-white/60">Total Budget</span>
                    <span className="text-sm font-semibold text-white">{fmt(totalApprovedBudget)}</span>
                  </div>
                </CardContent>
                {/* Decorative circles */}
                <div className="size-28 rounded-full bg-white/10 flex items-center justify-center absolute -right-14 top-1/2 -translate-y-1/2" />
                <div className="size-10 rounded-full bg-white/20 flex items-center justify-center absolute -right-5 top-1/2 -translate-y-1/2" />
              </Card>

              {/* Approved Change Orders */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-full w-min">
                    <CheckCircle2 className="size-4" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                    Approved Changes
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-500">{fmt(totalApprovedChanges)}</p>
                  <p className="text-sm text-muted-foreground">{totalApprovedCount} {totalApprovedCount === 1 ? 'item' : 'items'} added to contract</p>
                </CardContent>
              </Card>

              {/* Pending Change Orders */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-[#C49A3C]/10 text-[#C49A3C] rounded-full w-min">
                    <BanknoteIcon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                    Pending Changes
                  </p>
                  <p className="text-3xl font-bold text-[#C49A3C]">{fmt(totalPendingChanges)}</p>
                  <p className="text-sm text-muted-foreground">{totalPendingCount} {totalPendingCount === 1 ? 'item' : 'items'} awaiting approval</p>
                </CardContent>
              </Card>

              {/* Total Spent */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-full w-min">
                    <BanknoteIcon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                    Total Spent
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-500">{fmt(totalSpent)}</p>
                  <p className="text-sm text-muted-foreground">Recorded expenses</p>
                </CardContent>
              </Card>

              {/* Remaining Budget */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-full w-min">
                    <WalletIcon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                    Remaining Budget
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{fmt(remainingBudget)}</p>
                  <p className="text-sm text-muted-foreground">Available runway</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Budget by phase table */}
            <Card className="rounded-2xl w-full">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Budget by phase
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-0 sm:px-6 overflow-hidden">
                <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-secondary/50">
                  <div className="min-w-[750px]">
                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] gap-2 py-3 border-b border-border px-4 sm:px-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Phase
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">
                    Budgeted
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">
                    Approved Changes
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">
                    Total Budget
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">
                    Spent
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">
                    Status
                  </span>
                </div>

                {/* Rows */}
                {phases.map((phase) => {
                  const isExpanded = expandedPhases.includes(phase.id);
                  const phaseChangeOrders = phase.change_orders;
                  const phaseChangeTotal = phase.total_change_orders;

                  return (
                    <div key={phase.id} className="flex flex-col border-b border-border last:border-0">
                      {/* Main Row */}
                      <div
                        className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] gap-2 py-4 items-center px-4 sm:px-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => togglePhase(phase.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                          <span className={`text-sm font-medium ${phase.status === "upcoming" ? "text-muted-foreground/60" : "text-foreground"}`}>
                            {phase.phase}. {phase.name}
                          </span>
                        </div>
                        <span className={`text-sm text-right ${phase.status === "upcoming" ? "text-muted-foreground/60" : "text-foreground"}`}>
                          {fmt(phase.budgeted)}
                        </span>
                        <span className="text-sm text-right text-[#0E914A] font-medium">
                          {phaseChangeTotal > 0 ? `+${fmt(phaseChangeTotal)}` : "—"}
                        </span>
                        <span className={`text-sm font-semibold text-right ${phase.status === "upcoming" ? "text-muted-foreground/60" : "text-foreground"}`}>
                          {fmt(Number(phase.budgeted) + Number(phaseChangeTotal))}
                        </span>
                        <span className={`text-sm text-right ${phase.spent == null ? "text-muted-foreground/40" : phase.spent > Number(phase.budgeted) + Number(phaseChangeTotal) ? "text-red-500 font-semibold" : "text-foreground"}`}>
                          {phase.spent != null ? fmt(phase.spent) : "—"}
                        </span>
                        <div className="flex justify-end">
                          <StatusBadge status={phase.status} />
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="bg-secondary/30 px-4 sm:px-6 py-4 flex flex-col gap-4 border-t border-border/50">
                          {/* Toggles */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Button
                              size="sm"
                              variant={expandedPhaseView[phase.id] === 'expenses' ? 'default' : 'outline'}
                              className={expandedPhaseView[phase.id] === 'expenses' ? "rounded-full" : "rounded-full bg-white"}
                              onClick={() => setExpandedPhaseView(prev => ({...prev, [phase.id]: "expenses"}))}
                            >
                              View Expenses
                            </Button>
                            <Button
                              size="sm"
                              variant={expandedPhaseView[phase.id] === 'changes' ? 'default' : 'outline'}
                              className={expandedPhaseView[phase.id] === 'changes' ? "rounded-full" : "rounded-full bg-white"}
                              onClick={() => setExpandedPhaseView(prev => ({...prev, [phase.id]: "changes"}))}
                            >
                              View Change Orders
                            </Button>
                          </div>

                          {expandedPhaseView[phase.id] === 'expenses' ? (
                            /* Expenses List */
                            phase.spends.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2 italic">No recorded expenses for this phase.</p>
                            ) : (
                              <div className="flex flex-col gap-4">
                                {phase.spends.map((s) => (
                                  <div key={s.id} className="bg-white dark:bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="bg-red-50 dark:bg-red-950/40 rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                                        <span className="text-red-600 font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Expense</span>
                                      </div>
                                      <span className="text-sm md:text-base font-inter font-bold text-foreground">+{fmt(s.amount)}</span>
                                    </div>
                                    <p className="text-sm md:text-base text-foreground font-inter">{s.title}</p>
                                    {s.file_url && (
                                      <div className="flex items-center justify-between w-full mt-1">
                                        <div className="flex items-center gap-3">
                                          <div className="relative flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-md">
                                            <FileText className="size-4 text-blue-500" />
                                            <span className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 text-[8px] font-bold text-white bg-blue-500 rounded-sm px-[2px]">DOC</span>
                                          </div>
                                          <span className="text-muted-foreground text-xs md:text-sm">Invoice / Receipt</span>
                                        </div>
                                        <a href={s.file_url} target="_blank" rel="noreferrer" className="flex-shrink-0 text-[#C49A3C] hover:opacity-80 transition-opacity">
                                          <Download size={20} />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            /* Change Orders List */
                            phaseChangeOrders.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2 italic">No change orders for this phase.</p>
                            ) : (
                              <div className="flex flex-col gap-4">
                                {phaseChangeOrders.map((co) => (
                                  <div key={co.id} className="bg-white dark:bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                                    <div className="flex items-center justify-between">
                                      {co.status === "approved" ? (
                                        <div className="bg-[#E8FFF2] dark:bg-green-950/40 rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                                          <span className="text-[#0E914A] font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Approved</span>
                                        </div>
                                      ) : co.status === "rejected" ? (
                                        <div className="bg-red-50 dark:bg-red-950/40 rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                                          <span className="text-red-600 font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Rejected</span>
                                        </div>
                                      ) : (
                                        <div className="bg-[#C49A3C]/10 rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                                          <span className="text-[#C49A3C] font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Pending</span>
                                        </div>
                                      )}
                                      <span className="text-sm md:text-base font-inter font-medium text-foreground">+{fmt(co.amount)}</span>
                                    </div>
                                    <p className="text-sm md:text-base text-foreground font-inter">{co.title}</p>
                                    {co.file_url && (
                                      <div className="flex items-center justify-between w-full mt-1">
                                        <div className="flex items-center gap-3">
                                          <div className="relative flex items-center justify-center w-8 h-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md">
                                            <FileText className="size-4 text-red-500" />
                                            <span className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 text-[8px] font-bold text-white bg-red-500 rounded-sm px-[2px]">PDF</span>
                                          </div>
                                          <span className="text-muted-foreground text-xs md:text-sm">Change order</span>
                                        </div>
                                        <a href={co.file_url} target="_blank" rel="noreferrer" className="flex-shrink-0 text-[#C49A3C] hover:opacity-80 transition-opacity">
                                          <Download size={20} />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {phases.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No budget phases available.
                  </div>
                )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ─── Modals ───────────────────────────────────────────────────────────── */}

      {/* Update Phase Modal */}
      <Dialog open={isPhaseSheetOpen} onOpenChange={setIsPhaseSheetOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Phase Budget</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col gap-5">
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
                      setPhaseAmount(String(m.budgeted));
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

            <button
              type="button"
              onClick={handlePhaseSubmit}
              disabled={isUpdatingPhase || !phaseSelected}
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isUpdatingPhase ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Update Phase Budget
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Change Order Modal */}
      <Dialog open={isChangeSheetOpen} onOpenChange={setIsChangeSheetOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Change Order</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col gap-5">
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
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isAddingChange ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              SUBMIT ORDER
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Spend Modal */}
      <Dialog open={isSpendSheetOpen} onOpenChange={setIsSpendSheetOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record New Expense</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col gap-5">
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
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isAddingSpend ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              RECORD EXPENSE
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

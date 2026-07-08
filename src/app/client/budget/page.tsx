"use client";

import {
  BanknoteIcon,
  CheckCircle2,
  WalletIcon,
  XCircle,
  Loader2,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

type PhaseStatus = "completed" | "in-progress" | "pending_review" | "upcoming";
type ChangeOrderStatus = "approved" | "pending" | "rejected";

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

export default function BudgetPage() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [phases, setPhases] = useState<BudgetPhase[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [totalApprovedChanges, setTotalApprovedChanges] = useState(0);
  const [totalPendingChanges, setTotalPendingChanges] = useState(0);
  const [totalApprovedCount, setTotalApprovedCount] = useState(0);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([]);
  const [expandedPhaseView, setExpandedPhaseView] = useState<Record<number, "expenses" | "changes">>({});

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

  // Fetch project ID (assumes first assigned project)
  useEffect(() => {
    apiFetch(`/api/client/projects?all=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setProjects(data.data);
          setProjectId(data.data[0].id);
        } else {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const fetchFinances = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/client/projects/${projectId}/finances`);
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
        setChangeOrders(data.data.change_orders);
        setTotalApprovedChanges(data.data.total_approved_change_orders || 0);
        setTotalPendingChanges(data.data.total_pending_change_orders || 0);
        setTotalApprovedCount(data.data.total_approved_change_orders_count || 0);
        setTotalPendingCount(data.data.total_pending_change_orders_count || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load budget data.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  async function handleApprove(id: number) {
    try {
      const res = await apiFetch(`/api/client/change-orders/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Change order approved");
        fetchFinances();
      } else {
        toast.error("Failed to approve change order");
      }
    } catch (error) {
      toast.error("Error approving change order");
    }
  }

  async function handleReject(id: number) {
    try {
      const res = await apiFetch(`/api/client/change-orders/${id}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Change order rejected");
        fetchFinances();
      } else {
        toast.error("Failed to reject change order");
      }
    } catch (error) {
      toast.error("Error rejecting change order");
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Budget Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Full financial summary for your project
            </p>
          </div>
          {projects.length > 1 && (
            <Select value={String(projectId)} onValueChange={(val) => setProjectId(Number(val))}>
              <SelectTrigger className="w-full sm:w-[250px] bg-white rounded-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name || `Project #${p.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : !projectId ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Hero stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:col-span-5">
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
            
            {/* Left col — 3/5 */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Budget by phase table */}
              <Card className="rounded-2xl">
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
                    const phaseChangeOrders = phase.change_orders.filter(co => co.status !== 'pending');
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
                                className={`rounded-full text-xs font-bold tracking-wide ${expandedPhaseView[phase.id] === 'expenses' ? '' : 'text-muted-foreground bg-white'}`}
                                onClick={() => setExpandedPhaseView(prev => ({...prev, [phase.id]: 'expenses'}))}
                              >
                                View Expenses ({phase.spends.length})
                              </Button>
                              <Button
                                size="sm"
                                variant={expandedPhaseView[phase.id] === 'changes' ? 'default' : 'outline'}
                                className={`rounded-full text-xs font-bold tracking-wide ${expandedPhaseView[phase.id] === 'changes' ? '' : 'text-muted-foreground bg-white'}`}
                                onClick={() => setExpandedPhaseView(prev => ({...prev, [phase.id]: 'changes'}))}
                              >
                                View Change Orders ({phaseChangeOrders.length})
                              </Button>
                            </div>
                            
                            {expandedPhaseView[phase.id] === 'expenses' ? (
                              /* Expenses List */
                              phase.spends.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2 italic">No expenses recorded for this phase.</p>
                              ) : (
                                <div className="flex flex-col gap-4">
                                  {phase.spends.map((s) => (
                                    <div key={s.id} className="bg-white border border-[#C4C7C7]/50 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                                      <div className="flex items-center justify-between">
                                        <div className="bg-[#F3F4F6] rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                                          <span className="text-gray-600 font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Expense</span>
                                        </div>
                                        <span className="text-sm md:text-base font-inter font-medium text-black">{fmt(s.amount)}</span>
                                      </div>
                                      <p className="text-sm md:text-base text-black font-inter">{s.title}</p>
                                      {s.file_url && (
                                        <div className="flex items-center justify-between w-full mt-1">
                                          <div className="flex items-center gap-3">
                                            <div className="relative flex items-center justify-center w-8 h-8 bg-red-50 border border-red-200 rounded-md">
                                              <FileText className="size-4 text-red-500" />
                                              <span className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 text-[8px] font-bold text-white bg-red-500 rounded-sm px-[2px]">PDF</span>
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
                                <p className="text-sm text-muted-foreground py-2 italic">No processed change orders for this phase.</p>
                              ) : (
                                <div className="flex flex-col gap-4">
                                  {phaseChangeOrders.map((co) => (
                                    <div key={co.id} className="bg-white border border-[#C4C7C7]/50 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                                      <div className="flex items-center justify-between">
                                        {co.status === "approved" ? (
                                          <div className="bg-[#E8FFF2] rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                                            <span className="text-[#0E914A] font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Approved</span>
                                          </div>
                                        ) : (
                                          <div className="bg-red-50 rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                                            <span className="text-red-600 font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Rejected</span>
                                          </div>
                                        )}
                                        <span className="text-sm md:text-base font-inter font-medium text-black">+{fmt(co.amount)}</span>
                                      </div>
                                      <p className="text-sm md:text-base text-black font-inter">{co.title}</p>
                                      {co.file_url && (
                                        <div className="flex items-center justify-between w-full mt-1">
                                          <div className="flex items-center gap-3">
                                            <div className="relative flex items-center justify-center w-8 h-8 bg-red-50 border border-red-200 rounded-md">
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

            {/* Right col — 2/5 */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Action Required: Pending Change Orders */}
              <Card className="rounded-2xl">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-semibold">
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-4">
                  {changeOrders.filter(c => c.status === 'pending').length === 0 && (
                    <div className="py-8 text-center text-sm font-medium text-muted-foreground flex flex-col items-center gap-2">
                       <CheckCircle2 className="size-8 text-green-500/50" />
                      You're all caught up!
                    </div>
                  )}
                  {changeOrders.filter(c => c.status === 'pending').map((co) => (
                    <div
                      key={co.id}
                      className="bg-white border border-[#C4C7C7]/50 rounded-xl p-4 flex flex-col gap-2 shadow-sm"
                    >
                      {/* Status + amount */}
                      <div className="flex items-center justify-between">
                        <div className="bg-[#C49A3C]/10 rounded-full px-2 py-0.5 flex items-center justify-center h-5">
                          <span className="text-[#C49A3C] font-inter text-[10px] md:text-xs uppercase font-bold tracking-wider">Pending</span>
                        </div>
                        <span className="text-sm md:text-base font-inter font-medium text-black">
                          +{fmt(co.amount)}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="text-sm md:text-base text-black font-inter">{co.title}</p>
                      
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-[-2px]">
                        Phase: {phases.find(p => p.id === co.milestone_id)?.phase || "?"}
                      </p>

                      {/* Attachment (if exists) */}
                      {co.file_url && (
                        <div className="flex items-center justify-between w-full mt-1">
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center w-8 h-8 bg-red-50 border border-red-200 rounded-md">
                              <FileText className="size-4 text-red-500" />
                              <span className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 text-[8px] font-bold text-white bg-red-500 rounded-sm px-[2px]">PDF</span>
                            </div>
                            <span className="text-muted-foreground text-xs md:text-sm">
                              Change order
                            </span>
                          </div>
                          <a href={co.file_url} target="_blank" rel="noreferrer" className="flex-shrink-0 text-[#C49A3C] hover:opacity-80 transition-opacity">
                            <Download size={20} />
                          </a>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(co.id)}
                          className="flex-1 text-background bg-[#0E914A] hover:bg-[#0E914A]/90 hover:opacity-80 rounded-full gap-1.5 text-xs font-bold tracking-wide"
                        >
                          <CheckCircle2 size={13} />
                          APPROVE
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(co.id)}
                          className="flex-1 rounded-full gap-1.5 text-xs font-bold tracking-wide text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <XCircle size={13} />
                          REJECT
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

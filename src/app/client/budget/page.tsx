"use client";

import {
  BanknoteIcon,
  CheckCircle2,
  WalletIcon,
  XCircle,
  Loader2,
} from "lucide-react";
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
  name: string;
  budgeted: number;
  spent: number | null;
  status: PhaseStatus;
}

interface ChangeOrder {
  id: number;
  title: string;
  amount: number;
  status: ChangeOrderStatus;
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
  const [phases, setPhases] = useState<BudgetPhase[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive totals
  const contractBudget = phases.reduce((acc, p) => acc + p.budgeted, 0);
  const changeOrdersTotal = changeOrders
    .filter((c) => c.status === "approved")
    .reduce((acc, c) => acc + c.amount, 0);

  // Fetch project ID (assumes first assigned project)
  useEffect(() => {
    apiFetch(`/api/projects?all=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
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
      const res = await apiFetch(`/api/projects/${projectId}/finances`);
      const data = await res.json();
      if (res.ok) {
        const mappedBudgets = data.data.budgets.map((m: any) => ({
          id: m.id,
          name: m.name,
          budgeted: m.budget_amount,
          spent: m.spent_amount,
          status: m.status,
        }));
        setPhases(mappedBudgets);
        setChangeOrders(data.data.change_orders);
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
      const res = await apiFetch(`/api/change-orders/${id}/approve`, {
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
      const res = await apiFetch(`/api/change-orders/${id}/reject`, {
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full financial summary for your project
          </p>
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
            <div className="grid grid-cols-2 gap-4 lg:col-span-5">
              {/* Contract Budget — dark card */}
              <Card className="bg-foreground text-background rounded-2xl relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-white/10 rounded-full w-min">
                    <WalletIcon className="size-4 text-white/80" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-white/50">
                    Contract Budget
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {fmt(contractBudget)}
                  </p>
                  <p className="text-sm text-white/50">Base project value</p>
                </CardContent>
                {/* Decorative circles */}
                <div className="size-28 rounded-full bg-white/10 flex items-center justify-center absolute -right-14 top-1/2 -translate-y-1/2" />
                <div className="size-10 rounded-full bg-white/20 flex items-center justify-center absolute -right-5 top-1/2 -translate-y-1/2" />
              </Card>

              {/* Change Orders */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-secondary rounded-full w-min">
                    <BanknoteIcon className="size-4" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                    Change Orders
                  </p>
                  <p className="text-3xl font-bold">{fmt(changeOrdersTotal)}</p>
                  <p className="text-sm text-muted-foreground">Total approved</p>
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
                <CardContent className="pt-0">
                  {/* Table header */}
                  <div className="grid grid-cols-4 gap-2 py-3 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground col-span-1">
                      Phase
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">
                      Budgeted
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">
                      Spent
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">
                      Status
                    </span>
                  </div>

                  {/* Rows */}
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="grid grid-cols-4 gap-2 py-4 border-b border-border last:border-0 items-center"
                    >
                      <span
                        className={`text-sm font-medium col-span-1 ${
                          phase.status === "upcoming"
                            ? "text-muted-foreground/60"
                            : "text-foreground"
                        }`}
                      >
                        {phase.name}
                      </span>
                      <span
                        className={`text-sm text-right ${
                          phase.status === "upcoming"
                            ? "text-muted-foreground/60"
                            : "text-foreground"
                        }`}
                      >
                        {fmt(phase.budgeted)}
                      </span>
                      <span
                        className={`text-sm text-right ${
                          phase.spent == null
                            ? "text-muted-foreground/40"
                            : phase.spent > phase.budgeted
                              ? "text-red-500 font-semibold"
                              : "text-foreground"
                        }`}
                      >
                        {phase.spent != null ? fmt(phase.spent) : "—"}
                      </span>
                      <div className="flex justify-end">
                        <StatusBadge status={phase.status} />
                      </div>
                    </div>
                  ))}
                  {phases.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No budget phases available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right col — 2/5 */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Change Orders list */}
              <Card className="rounded-2xl">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-semibold">
                    Change Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 flex flex-col gap-3">
                  {changeOrders.length === 0 && (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No change orders yet.
                    </div>
                  )}
                  {changeOrders.map((co) => (
                    <div
                      key={co.id}
                      className="border border-border rounded-xl p-4 flex flex-col gap-3"
                    >
                      {/* Status + amount */}
                      <div className="flex items-center justify-between">
                        {co.status === "approved" ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800 gap-1 text-xs font-semibold"
                          >
                            <CheckCircle2 size={12} />
                            Approved
                          </Badge>
                        ) : co.status === "rejected" ? (
                           <Badge
                            variant="outline"
                            className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 gap-1 text-xs font-semibold"
                          >
                            <XCircle size={12} />
                            Rejected
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[#C49A3C] border-[#C49A3C]/30 bg-[#C49A3C]/10 gap-1 text-xs font-semibold"
                          >
                            <span className="size-1.5 rounded-full bg-[#C49A3C]" />
                            Pending review
                          </Badge>
                        )}
                        <span
                          className={`text-sm font-bold ${
                            co.status === "approved"
                              ? "text-foreground"
                              : co.status === "rejected"
                              ? "text-muted-foreground line-through"
                              : "text-[#C49A3C]"
                          }`}
                        >
                          +{fmt(co.amount)}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="text-sm font-medium">{co.title}</p>

                      {/* Action buttons — only for pending */}
                      {co.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(co.id)}
                            className="px-6 text-background bg-green-700 hover:bg-green-600 hover:opacity-80 rounded-full gap-1.5 text-xs font-bold tracking-wide"
                          >
                            <CheckCircle2 size={13} />
                            APPROVE
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(co.id)}
                            className="px-6 rounded-full gap-1.5 text-xs font-bold tracking-wide text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <XCircle size={13} />
                            REJECT
                          </Button>
                        </div>
                      )}
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

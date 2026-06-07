"use client";

import { ChevronDown, Pencil, Send } from "lucide-react";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

const CLIENT_PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Alice Mercer — The Mercer Custom Build",
  "Tom Larsen — The Larsen Pool & Addition",
];

const STATUSES = ["Completed", "In progress", "Not started"];

type PhaseStatus = "complete" | "in-progress" | "not-started";
type ChangeStatus = "approved" | "pending";

interface PhaseBudget {
  id: number;
  phase: string;
  phaseName: string;
  budget: number;
  status: PhaseStatus;
}

interface ChangeOrder {
  id: number;
  title: string;
  amount: number;
  status: ChangeStatus;
}

const INITIAL_PHASES: PhaseBudget[] = [
  { id: 1, phase: "01", phaseName: "Site prep & demolition", budget: 150000, status: "complete" },
  { id: 2, phase: "02", phaseName: "Foundation & excavation", budget: 150000, status: "in-progress" },
  { id: 3, phase: "03", phaseName: "Framing", budget: 150000, status: "not-started" },
  { id: 4, phase: "04", phaseName: "MEP", budget: 150000, status: "not-started" },
  { id: 5, phase: "05", phaseName: "Interior finishes", budget: 150000, status: "not-started" },
];

const INITIAL_CHANGES: ChangeOrder[] = [
  { id: 1, title: "Upgraded insulation package", amount: 4800, status: "approved" },
  { id: 2, title: "Upgraded insulation package", amount: 4800, status: "approved" },
  { id: 3, title: "Upgraded insulation package", amount: 4800, status: "pending" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function PhaseStatusPill({ status }: { status: PhaseStatus }) {
  if (status === "complete")
    return <span className="text-xs font-semibold text-green-500">complete</span>;
  if (status === "in-progress")
    return <span className="text-xs font-semibold" style={{ color: GOLD }}>In progress</span>;
  return (
    <span className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
      Not started
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
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [phases, setPhases] = useState(INITIAL_PHASES);
  const [changes, setChanges] = useState(INITIAL_CHANGES);

  // Phase budget form
  const [phaseSelected, setPhaseSelected] = useState("03");
  const [phaseAmount, setPhaseAmount] = useState("");
  const [phaseStatus, setPhaseStatus] = useState(STATUSES[0]);

  // Change order form
  const [changeTitle, setChangeTitle] = useState("Upgraded insulation package");
  const [changeAmount, setChangeAmount] = useState("");

  function handlePhaseSubmit() {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.phase !== phaseSelected) return p;
        const amt = Number.parseFloat(phaseAmount.replace(/[^0-9.]/g, ""));
        const status: PhaseStatus =
          phaseStatus === "Completed"
            ? "complete"
            : phaseStatus === "In progress"
              ? "in-progress"
              : "not-started";
        return { ...p, budget: isNaN(amt) ? p.budget : amt, status };
      }),
    );
    setPhaseAmount("");
  }

  function handleChangeSubmit() {
    const amt = Number.parseFloat(changeAmount.replace(/[^0-9.]/g, "")) || 0;
    setChanges((prev) => [
      ...prev,
      { id: Date.now(), title: changeTitle, amount: amt, status: "pending" },
    ]);
    setChangeTitle("");
    setChangeAmount("");
  }

  const phaseOptions = phases.map((p) => ({ value: p.phase, label: p.phaseName }));

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
                <option key={cp} value={cp}>{cp}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* ── Top row: Phase Budget Allocation + Phase Budget form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — table */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4">
              <p className="text-sm font-bold">Phase Budget Allocation</p>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[48px_1fr_120px_120px_56px] px-5 py-2 border-y border-border bg-secondary/30">
              {["PHASE", "PHASE NAME", "BUDGET", "STATUS", "ACTIONS"].map((h) => (
                <p key={h} className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
                  {h}
                </p>
              ))}
            </div>

            <div className="flex flex-col divide-y divide-border">
              {phases.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[48px_1fr_120px_120px_56px] px-5 py-4 items-center hover:bg-secondary/20 transition-colors"
                >
                  <p className="text-sm text-muted-foreground font-medium">{p.phase}</p>
                  <p className="text-sm font-semibold pr-2">{p.phaseName}</p>
                  <p className="text-sm font-semibold">{fmt(p.budget)}</p>
                  <div><PhaseStatusPill status={p.status} /></div>
                  <button
                    type="button"
                    aria-label={`Edit ${p.phaseName}`}
                    onClick={() => {
                      setPhaseSelected(p.phase);
                      setPhaseAmount(String(p.budget));
                      setPhaseStatus(
                        p.status === "complete"
                          ? "Completed"
                          : p.status === "in-progress"
                            ? "In progress"
                            : "Not started",
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
              <p className="text-sm font-semibold">Phase Budget</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Phase */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Phase</p>
                <div className="relative">
                  <select
                    value={phaseSelected}
                    onChange={(e) => {
                      setPhaseSelected(e.target.value);
                      const m = phases.find((p) => p.phase === e.target.value);
                      if (m) {
                        setPhaseAmount(String(m.budget));
                        setPhaseStatus(
                          m.status === "complete"
                            ? "Completed"
                            : m.status === "in-progress"
                              ? "In progress"
                              : "Not started",
                        );
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  >
                    {phaseOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Amount</p>
                <input
                  type="text"
                  value={phaseAmount}
                  onChange={(e) => setPhaseAmount(e.target.value)}
                  placeholder="+ $0.00"
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
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePhaseSubmit}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                SUBMIT ORDER
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Change Orders list + Change Orders form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — Change orders list */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold px-1">Change Orders</p>
            <div className="flex flex-col gap-3">
              {changes.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <ChangeStatusPill status={c.status} />
                    <p className="text-sm font-medium text-muted-foreground">{c.title}</p>
                  </div>
                  <p className="text-sm font-bold shrink-0">+${c.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Change Orders form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Change Orders</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Title</p>
                <input
                  type="text"
                  value={changeTitle}
                  onChange={(e) => setChangeTitle(e.target.value)}
                  placeholder="Change order title"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Amount</p>
                <input
                  type="text"
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(e.target.value)}
                  placeholder="+ $0.00"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              <button
                type="button"
                onClick={handleChangeSubmit}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                SUBMIT ORDER
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

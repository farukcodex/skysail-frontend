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

type Status = "complete" | "in-progress" | "not-started";

interface Milestone {
  id: number;
  phase: string;
  phaseName: string;
  completion: number;
  status: Status;
  targetDate: string;
}

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 1,
    phase: "01",
    phaseName: "Site prep & demolition",
    completion: 100,
    status: "complete",
    targetDate: "Apr 28",
  },
  {
    id: 2,
    phase: "02",
    phaseName: "Foundation & excavation",
    completion: 25,
    status: "in-progress",
    targetDate: "Apr 28",
  },
  {
    id: 3,
    phase: "03",
    phaseName: "Framing",
    completion: 0,
    status: "not-started",
    targetDate: "Apr 28",
  },
  {
    id: 4,
    phase: "04",
    phaseName: "MEP",
    completion: 0,
    status: "not-started",
    targetDate: "Apr 28",
  },
  {
    id: 5,
    phase: "05",
    phaseName: "Interior finishes",
    completion: 0,
    status: "not-started",
    targetDate: "Apr 28",
  },
  {
    id: 6,
    phase: "06",
    phaseName: "Punch list & handover",
    completion: 0,
    status: "not-started",
    targetDate: "Apr 28",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: Status }) {
  if (status === "complete")
    return (
      <span className="text-xs font-semibold text-green-500">complete</span>
    );
  if (status === "in-progress")
    return (
      <span className="text-xs font-semibold" style={{ color: GOLD }}>
        In progress
      </span>
    );
  return (
    <span className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
      Not started
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MilestonesPage() {
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [milestones, setMilestones] = useState(INITIAL_MILESTONES);

  // right-panel form state
  const [selectedPhase, setSelectedPhase] = useState("03");
  const [completion, setCompletion] = useState("68%");
  const [targetDate, setTargetDate] = useState("Apr 28");
  const [notify, setNotify] = useState(true);

  function handleSave() {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.phase !== selectedPhase) return m;
        const pct = Number.parseInt(completion) || 0;
        const status: Status =
          pct >= 100 ? "complete" : pct > 0 ? "in-progress" : "not-started";
        return { ...m, completion: pct, status, targetDate };
      }),
    );
  }

  const phaseOptions = milestones.map((m) => ({
    value: m.phase,
    label: m.phaseName,
  }));

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Milestone management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update phase completion and key dates
          </p>
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
                <option key={cp} value={cp}>
                  {cp}
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
          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Table header label */}
            <div className="px-5 py-4 flex items-center gap-2">
              <span className="text-sm font-bold">Henderson Residence</span>
              <span className="text-sm text-muted-foreground font-normal">
                / Milestones
              </span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[48px_1fr_100px_110px_100px_56px] px-5 py-2 border-y border-border bg-secondary/30">
              {["PHASE", "PHASE NAME", "COMPLETION %", "STATUS", "TARGET DATE", "ACTIONS"].map(
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
            <div className="flex flex-col divide-y divide-border">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-[48px_1fr_100px_110px_100px_56px] px-5 py-4 items-center hover:bg-secondary/20 transition-colors"
                >
                  <p className="text-sm text-muted-foreground font-medium">
                    {m.phase}
                  </p>
                  <p className="text-sm font-semibold pr-2">{m.phaseName}</p>
                  <p className="text-sm font-semibold">{m.completion}%</p>
                  <div>
                    <StatusPill status={m.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{m.targetDate}</p>
                  <button
                    type="button"
                    aria-label={`Edit ${m.phaseName}`}
                    onClick={() => {
                      setSelectedPhase(m.phase);
                      setCompletion(`${m.completion}%`);
                      setTargetDate(m.targetDate);
                    }}
                    className="flex items-center justify-center size-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — New update form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">New update</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Phase */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Phase
                </p>
                <div className="relative">
                  <select
                    value={selectedPhase}
                    onChange={(e) => {
                      setSelectedPhase(e.target.value);
                      const m = milestones.find(
                        (ms) => ms.phase === e.target.value,
                      );
                      if (m) {
                        setCompletion(`${m.completion}%`);
                        setTargetDate(m.targetDate);
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  >
                    {phaseOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              {/* Completion % */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Completion %
                </p>
                <input
                  type="text"
                  value={completion}
                  onChange={(e) => setCompletion(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                />
              </div>

              {/* Target date */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Target Date
                </p>
                <input
                  type="text"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                />
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
                    style={{
                      transform: notify
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                SAVE MILESTONE
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { CheckCircle2, Info } from "lucide-react";

const MILESTONES = [
  {
    num: "01",
    title: "Schematic design complete",
    desc: "Foundational site analysis and initial block diagrams.",
    timeline: "Completed",
    date: "Mar 1, 2024",
    progress: 100,
    confirmed: true,
  },
  {
    num: "02",
    title: "Design development complete",
    desc: "Detailed drawings and material specification finalized.",
    timeline: "Completed",
    date: "Apr 15, 2024",
    progress: 100,
    confirmed: true,
  },
  {
    num: "03",
    title: "Construction documents — phase 1",
    desc: "Structural engineering coordination and permit sets.",
    timeline: "Target",
    date: "Jun 30, 2024",
    progress: 0,
    confirmed: false,
  },
  {
    num: "05",
    title: "Site observation visits",
    desc: "Bi-weekly site presence to ensure design compliance.",
    timeline: "Target",
    date: "Sep 1, 2024",
    progress: 0,
    confirmed: false,
  },
];

export default function VendorMilestonesPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="font-bold">All </span>
          <span className="text-muted-foreground font-normal">milestones</span>
        </h1>

        {/* Info banner */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-200">
          <Info size={16} className="shrink-0" />
          <span>
            When you complete a milestone, submit it for admin review. It will
            update on the client portal only after admin confirms it.
          </span>
        </div>

        {/* CLIENT/PROJECT dropdown */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="vendor-milestone-project"
            className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground whitespace-nowrap"
          >
            Client / Project
          </label>
          <select
            id="vendor-milestone-project"
            className="rounded-xl bg-secondary/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
          >
            <option>Bob Henderson — The Henderson Residence</option>
          </select>
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
                    Timeline
                  </th>
                  <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3 w-36">
                    Progress
                  </th>
                  <th className="text-left text-[9px] font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3 w-44">
                    Status / Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {MILESTONES.map((m) => (
                  <tr
                    key={m.num}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-5 py-4 text-xs font-bold text-muted-foreground">
                      {m.num}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.desc}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold">{m.timeline}</p>
                      <p className="text-xs text-muted-foreground">{m.date}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold">
                          {m.progress}%
                        </span>
                        <div className="h-1.5 rounded-full bg-border w-24">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {m.confirmed ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <CheckCircle2 size={14} />
                          CONFIRMED
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity"
                          style={{
                            background:
                              "linear-gradient(to bottom, #865B15, #E1C283)",
                          }}
                        >
                          SUBMIT COMPLETE
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

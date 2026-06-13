"use client";

import { CheckCircle2, ChevronDown, Info } from "lucide-react";
import { useState } from "react";

const PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Bob Henderson — The Sterling Penthouse",
];

const MILESTONES = [
  {
    num: "01",
    title: "Schematic design complete",
    desc: "Foundational site analysis and initial block diagrams.",
    timeline: "Completed",
    date: "Mar 1, 2024",
    progress: 100,
    confirmed: true,
    docName: "Schematic design",
  },
  {
    num: "02",
    title: "Design development complete",
    desc: "Detailed drawings and material specification finalized.",
    timeline: "Completed",
    date: "Apr 15, 2024",
    progress: 100,
    confirmed: true,
    docName: "Schematic design",
  },
  {
    num: "03",
    title: "Construction documents — phase 1",
    desc: "Structural engineering coordination and permit sets.",
    timeline: "Target",
    date: "Jun 30, 2024",
    progress: 0,
    confirmed: false,
    docName: null,
  },
  {
    num: "05",
    title: "Site observation visits",
    desc: "Bi-weekly site presence to ensure design compliance.",
    timeline: "Target",
    date: "Sep 1, 2024",
    progress: 0,
    confirmed: false,
    docName: null,
  },
];

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
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [showDropdown, setShowDropdown] = useState(false);

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
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            Client / Project
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              {selectedProject}
              <ChevronDown size={16} className="text-muted-foreground shrink-0" />
            </button>
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 w-full bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                {PROJECTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedProject(p);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors"
                    style={{ fontWeight: selectedProject === p ? 700 : 400 }}
                  >
                    {p}
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
                    Timeline
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
                {MILESTONES.map((m) => (
                  <tr
                    key={m.num}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-5 py-5 text-xs font-bold text-muted-foreground">
                      {m.num}
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-sm font-bold">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.desc}
                      </p>
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-xs font-semibold">{m.timeline}</p>
                      <p className="text-xs text-muted-foreground">{m.date}</p>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold">
                          {m.progress}%
                        </span>
                        <div className="h-1.5 rounded-full bg-border w-28">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-col items-end gap-2">
                        {m.confirmed && m.docName ? (
                          <>
                            <div className="flex items-center gap-2">
                              <MiniPdfIcon />
                              <span className="text-xs font-semibold">
                                {m.docName}
                              </span>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                              <CheckCircle2 size={14} className="text-foreground" />
                              CONFIRMED
                            </span>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                            style={{
                              background:
                                "linear-gradient(to bottom, #865B15, #E1C283)",
                            }}
                          >
                            SUBMIT
                            <br />
                            COMPLETE
                          </button>
                        )}
                      </div>
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

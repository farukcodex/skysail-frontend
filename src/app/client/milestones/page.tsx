"use client";

import { CheckCircle2, Circle, CircleEllipsisIcon, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type MilestoneStatus = "completed" | "active" | "upcoming";

type MilestoneUI = {
  id: number;
  title: string;
  status: MilestoneStatus;
  label: string;
  dateLabel: string;
  date: string;
  completionPercent: number;
  completedBy?: { name: string; role: string; avatar: string };
};

function DotIcon({ status }: { status: MilestoneStatus }) {
  if (status === "completed")
    return (
      <div className="size-3.5 rounded-full bg-green-500 ring-[3px] ring-green-500/25 shrink-0" />
    );
  if (status === "active")
    return (
      <div className="size-3.5 rounded-full bg-[#C49A3C] ring-[3px] ring-[#C49A3C]/30 shrink-0 animate-pulse" />
    );
  return (
    <div className="size-3.5 rounded-full border-2 border-border bg-background shrink-0" />
  );
}

function StatusIcon({ status }: { status: MilestoneStatus }) {
  if (status === "completed")
    return <CheckCircle2 size={18} className="text-green-500 shrink-0" />;
  if (status === "active")
    return <Clock size={18} className="text-[#C49A3C] shrink-0" />;
  return <Circle size={18} className="text-muted-foreground/30 shrink-0" />;
}

function MilestoneRow({ m, isLast }: { m: MilestoneUI; isLast: boolean }) {
  const isActive = m.status === "active";
  const isCompleted = m.status === "completed";

  return (
    <div className="flex gap-5">
      {/* Dot + vertical connector */}
      <div
        className="flex flex-col items-center shrink-0"
        style={{ width: 14 }}
      >
        <div className="mt-2">
          <DotIcon status={m.status} />
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 mt-2 ${
              isCompleted ? "bg-green-500/30" : "bg-border"
            }`}
          />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-3 rounded-xl border px-5 py-4 flex items-center justify-between gap-4 transition-colors ${
          isActive ? "border-[#C49A3C] bg-[#C49A3C]/5" : "border-border bg-card"
        }`}
      >
        <div className="min-w-0 flex-1">
          {isActive && (
            <p className="text-[10px] font-bold tracking-widest text-[#C49A3C] mb-1">
              {m.label}
            </p>
          )}
          <p
            className={`text-sm font-semibold truncate ${
              isActive
                ? "text-[#C49A3C]"
                : isCompleted
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            {m.title}
          </p>
          {isCompleted && m.completedBy ? (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1.5">
                Completed by
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-full overflow-hidden bg-muted shrink-0">
                    <Image
                      src={m.completedBy.avatar}
                      alt={m.completedBy.name}
                      width={36}
                      height={36}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">
                      {m.completedBy.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.completedBy.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                  <span className="size-1 rounded-full bg-muted-foreground/40 inline-block" />
                  <span className="text-sm font-bold text-foreground">
                    {m.date}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              {!isActive && (
                <span className="uppercase tracking-wide">{m.label} · </span>
              )}
              {m.dateLabel && <span>{m.dateLabel} </span>}
              <span className="font-semibold text-foreground">{m.date}</span>
            </p>
          )}
        </div>
        <StatusIcon status={m.status} />
      </div>
    </div>
  );
}

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<MilestoneUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/milestones")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          // Transform backend milestone to frontend UI milestone
          const transformed = data.data.map((m: any) => {
            let status: MilestoneStatus = "upcoming";
            if (m.status === "completed") status = "completed";
            else if (m.status === "in-progress" || m.status === "pending_review") status = "active";

            let label = "TARGET START";
            if (status === "completed") label = "COMPLETED";
            else if (status === "active") label = "ACTIVE PHASE";
            else if (status === "upcoming") label = "UPCOMING";

            return {
              id: m.id,
              title: `${m.phase}. ${m.name}`,
              status: status,
              label: label,
              dateLabel: status === "active" ? "Est. Completion:" : "",
              date: m.target_date || "TBD",
              completionPercent: m.completion_percent,
              completedBy: (status === "completed" && m.assignee_name) ? {
                name: m.assignee_name,
                role: "Assigned Vendor",
                avatar: `https://api.dicebear.com/9.x/avataaars/png?seed=${m.assigned_to}&size=40&backgroundColor=b6e3f4`
              } : undefined
            };
          });
          setMilestones(transformed);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const activeMilestone = milestones.find((m) => m.status === "active") ?? milestones[0];
  const progress = activeMilestone?.completionPercent || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Project Masterplan
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Timeline &amp; Milestones
          </p>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="bg-card border border-border rounded-xl px-5 py-8 text-center text-muted-foreground text-sm">
          No milestones have been defined for your project yet.
        </div>
      ) : (
        <>
          {/* Active phase progress bar */}
          {activeMilestone && (
            <div className="bg-card border border-border rounded-xl px-5 py-4 mb-6 flex items-center gap-4 shadow-sm">
              <CircleEllipsisIcon size={16} className="text-[#C49A3C]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">
                    {activeMilestone.title.replace(/^\d+\.\s/, "")}
                  </span>
                  <span className="text-xs font-semibold text-[#C49A3C] bg-[#C49A3C]/10 px-2.5 py-1 rounded-full">
                    In Progress &middot; {progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C49A3C] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            {milestones.map((m, i) => (
              <MilestoneRow key={m.id} m={m} isLast={i === milestones.length - 1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

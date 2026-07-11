"use client";

import { CheckCircle2, Circle, CircleEllipsisIcon, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientProjectDropdown } from "@/components/shared/ClientProjectDropdown";

type MilestoneStatus = "completed" | "active" | "upcoming";

type MilestoneUI = {
  id: number;
  title: string;
  status: MilestoneStatus;
  label: string;
  dateLabel: string;
  date: string;
  completionPercent: number;
  assignedVendor?: { name: string; role: string; avatar: string };
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
          {m.assignedVendor ? (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1.5">
                {isCompleted ? "Completed by" : "Assigned to"}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={m.assignedVendor.avatar || undefined} alt={m.assignedVendor.name} />
                      <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                        {m.assignedVendor.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  <div>
                    <p className="text-sm font-bold leading-tight">
                      {m.assignedVendor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.assignedVendor.role}
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
  const [projects, setProjects] = useState<{id: number, name: string}[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProjectsList = async () => {
      try {
        const res = await apiFetch("/api/client/projects?all=true");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.data || []);
          if (data.data && data.data.length > 0) {
            setSelectedProjectId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjectsList();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setIsLoading(true);
    apiFetch(`/api/client/milestones?project_id=${selectedProjectId}`)
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
              assignedVendor: m.assignee_name ? {
                name: m.assignee_name,
                role: "Assigned Vendor",
                  avatar: ""
              } : undefined
            };
          });
          setMilestones(transformed);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedProjectId]);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const allCompleted = milestones.length > 0 && milestones.every(m => m.status === "completed");
  const activeMilestone = milestones.find((m) => m.status === "active") ?? (!allCompleted ? milestones.find(m => m.status === "upcoming") : null);
  const progress = activeMilestone?.completionPercent || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Project Masterplan
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Timeline &amp; Milestones
          </p>
        </div>
        <div className="w-full sm:w-auto flex sm:justify-end">
          <ClientProjectDropdown 
            projects={projects} 
            value={selectedProjectId} 
            onChange={(val) => {
              if (val) setSelectedProjectId(Number(val));
            }}
          />
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="bg-card border border-border rounded-xl px-5 py-8 text-center text-muted-foreground text-sm">
          No milestones have been defined for your project yet.
        </div>
      ) : (
        <>
          {/* Active phase progress bar */}
          {allCompleted ? (
            <div className="bg-card border border-green-500/30 rounded-xl px-5 py-4 mb-6 flex items-center gap-4 shadow-sm">
              <CheckCircle2 size={16} className="text-green-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">
                    Project Fully Completed
                  </span>
                  <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">
                    Completed &middot; 100%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `100%` }}
                  />
                </div>
              </div>
            </div>
          ) : activeMilestone ? (
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
          ) : null}

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

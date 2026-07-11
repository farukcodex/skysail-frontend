"use client";

import {
  ArrowRight,
  Bell,
  CalendarCheckIcon,
  CalendarIcon,
  CheckCircle2,
  Circle,
  CircleDollarSignIcon,
  CircleEllipsisIcon,
  Clock,
  DollarSign,
  Download,
  FileCog2Icon,
  FileText,
  Play,
  Users,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientProjectDropdown } from "@/components/shared/ClientProjectDropdown";

import Chart from "./chart";

// ─── Micro-components ─────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

function SectionLink({
  href,
  label = "View All",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-xs font-medium text-[#C49A3C] hover:opacity-80 transition-opacity"
    >
      {label} <ArrowRight size={12} />
    </Link>
  );
}

function MilestoneRow({ milestone }: { milestone: any }) {
  const cfg = {
    completed: {
      icon: (
        <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
      ),
      label: "Completed",
      labelCls: "text-green-600 font-medium",
    },
    inprogress: {
      icon: (
        <CircleEllipsisIcon
          size={16}
          className="text-[#C49A3C] shrink-0 mt-0.5"
        />
      ),
      label: "Inprocess",
      labelCls: "text-[#C49A3C] font-medium",
    },
    notstart: {
      icon: (
        <Circle
          size={16}
          className="text-muted-foreground/40 shrink-0 mt-0.5"
        />
      ),
      label: "Not Start",
      labelCls: "text-muted-foreground/50",
    },
  }[milestone.status as "completed" | "inprogress" | "notstart"];

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      {cfg?.icon}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm ${
            milestone.status === "notstart"
              ? "text-muted-foreground/50"
              : milestone.status === "completed"
                ? "text-green-600 font-medium"
                : "text-foreground"
          }`}
        >
          {milestone.label}
        </span>
        {milestone.completedBy && (
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-0.5">
            Completed by {milestone.completedBy}
          </p>
        )}
      </div>
      <span className={`text-xs shrink-0 ${cfg?.labelCls}`}>{cfg?.label}</span>
    </div>
  );
}

function RiskDot({ level }: { level: string }) {
  return (
    <span
      className={`mt-1 size-2 shrink-0 rounded-full ${
        level === "high"
          ? "bg-red-500"
          : level === "medium"
            ? "bg-yellow-400"
            : "bg-green-500"
      }`}
    />
  );
}

function EventActionBtn({ action }: { action: string }) {
  return (
    <button
      type="button"
      className={`shrink-0 text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full transition-colors ${
        action === "rsvp"
          ? "bg-foreground text-background hover:opacity-80"
          : "bg-[#C49A3C] text-black hover:opacity-80"
      }`}
    >
      {action === "rsvp" ? "RSVP" : "Join Now"}
    </button>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const fetchDashboardData = useCallback(async (projectId: number | null = null) => {
    setIsLoading(true);
    try {
      let url = "/api/client/dashboard";
      if (projectId) {
        url += `?project_id=${projectId}`;
      }
      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        if (json.data.activeProject?.id && !selectedProjectId) {
           setSelectedProjectId(json.data.activeProject.id);
        }
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchDashboardData(selectedProjectId);
  }, [fetchDashboardData, selectedProjectId]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col min-h-dvh bg-background items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const projects = data?.projects || [];
  const activeProject = data?.activeProject || { name: "No Active Project", image: "https://placehold.co/1200x400/1c2b3a/ffffff?text=The+Henderson+Residence" };
  const stats = data?.stats || {};
  const news = data?.news || [];
  const recentDocs = data?.recentDocs || [];
  const pendingDecisions = data?.pendingDecisions || [];
  const milestones = data?.milestones || [];
  const team = data?.team || [];
  const risks = data?.risks || [];
  const events = data?.events || [];

  const user = data?.user || {};

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* ── Content ── */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {/* Header & Project Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}{user.name ? `, ${user.name}` : ""}{" "}
              {/* <span role="img" aria-label="wave">
                👋
              </span> */}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Project Dashboard &bull; Last updated just now
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

        {/* ── Hero image ── */}
        <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden">
          <Image
            src={activeProject.image || "https://placehold.co/1200x400/1c2b3a/ffffff?text=The+Henderson+Residence"}
            alt={activeProject.name || "Client Dashboard"}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-4 left-4">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white"
              style={{ background: GOLD }}
            >
              Active Project
            </span>
          </div>
          <div className="absolute bottom-5 left-5">
            <h2 className="text-white text-2xl sm:text-3xl font-semibold">
              {activeProject.name || "No Project Selected"}
            </h2>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Phase */}
          <Card className="bg-foreground text-background ring-0 rounded-2xl col-span-2 sm:col-span-1 relative overflow-hidden">
            <CardHeader>
              <div className=" p-4 bg-secondary/10 rounded-full w-min">
                <FileCog2Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] tracking-widest uppercase text-white/50 font-semibold">
                  Project Phase
                </p>
              </div>
              <p className="text-4xl font-bold text-white">
                {stats.phaseIndex || 1} / {stats.totalPhases || 6}
              </p>
              <p className="text-sm text-white/60">{stats.phase || 'Planning'}</p>
            </CardContent>
            <div className="size-30 rounded-full bg-white/20 flex items-center justify-center absolute -right-15 top-1/2 transform -translate-y-1/2"></div>
            <div className="size-10 rounded-full bg-white/50 flex items-center justify-center absolute -right-5 top-1/2 transform -translate-y-1/2"></div>
          </Card>

          {/* Budget */}
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="p-4 bg-secondary rounded-full w-min">
                <CircleDollarSignIcon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                <DollarSign size={12} /> Budget Used
              </div>
              <p className="text-4xl font-bold">{stats.budgetUsedPercent || 0}%</p>
              <p className="text-sm font-medium" style={{ color: GOLD }}>
                {stats.budgetUsedFormatted || '$0 of $0'}
              </p>
            </CardContent>
          </Card>

          {/* Days remaining */}
          <Card className="rounded-2xl ">
            <CardHeader>
              <div className="p-4 bg-secondary rounded-full w-min">
                <CalendarIcon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                <Clock size={12} /> Days Remaining
              </div>
              <p className="text-4xl font-bold">{stats.daysRemaining || 0}</p>
              <p className="text-sm text-green-600 font-medium">
                {stats.completionEst || 'Unknown'}
              </p>
            </CardContent>
          </Card>

          {/* Decisions needed */}
          <Card className="rounded-2xl col-span-2 sm:col-span-1">
            <CardHeader>
              <div className="p-4 bg-secondary rounded-full w-min">
                <CalendarCheckIcon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                <Bell size={12} /> Decisions Needed
              </div>
              <p className="text-4xl font-bold text-red-500">{stats.decisionsNeeded || 0}</p>
              <p className="text-sm text-red-500 font-medium">
                Action required
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left col — 3/5 */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* News feed */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Project news feed
                </CardTitle>
                <div className="">
                  <SectionLink href="/client/updates" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-0 pt-2">
                {news.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No recent news
                  </div>
                ) : (
                  news.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-3 py-4 border-b border-border last:border-0"
                    >
                      <div className="relative size-16 shrink-0 rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={item.thumb}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {item.hasVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={16} className="text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-snug line-clamp-2">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 font-medium">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                        {item.hasVideo && (
                          <button
                            type="button"
                            className="text-xs font-medium mt-1.5 hover:opacity-80 transition-opacity"
                            style={{ color: GOLD }}
                          >
                            Watch Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent documents */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Recent Documents
                </CardTitle>
                <div className="">
                  <SectionLink href="/client/documents" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {recentDocs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No recent documents
                  </div>
                ) : (
                  recentDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                    >
                      <div className="size-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Pending decisions */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Pending decisions
                </CardTitle>
                <div className="">
                  <SectionLink href="/client/decisions" />
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col gap-0">
                {pendingDecisions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No pending decisions
                  </div>
                ) : (
                  pendingDecisions.map((d: any) => (
                    <div
                      key={d.id}
                      className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                    >
                      <span
                        className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                          d.urgency === "high"
                            ? "bg-red-500"
                            : d.urgency === "medium"
                              ? "bg-yellow-400"
                              : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{d.title}</p>
                        <p
                          className={`text-xs mt-0.5 ${
                            d.urgency === "high"
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {d.due}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right col — 2/5 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Budget analysis */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Budget Analysis
                </CardTitle>
                <div className="">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-7 px-3 gap-1"
                  >
                    Phase: {stats.phase || 'All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                      Spent
                    </p>
                    <p className="text-lg font-bold mt-0.5">{stats.budgetUsedFormatted ? stats.budgetUsedFormatted.split(' of ')[0] : '$0'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                      Pending
                    </p>
                    <p className="text-lg font-bold mt-0.5">{stats.pendingSpendFormatted || '$0'}</p>
                  </div>
                </div>
                {/* Bar chart */}
                <Chart data={data?.chartData} />
              </CardContent>
            </Card>

            {/* Key milestones */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Key Milestones
                </CardTitle>
                <div className="">
                  <SectionLink href="/client/milestones" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {milestones.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No milestones found
                  </div>
                ) : (
                  milestones.map((m: any) => (
                    <MilestoneRow key={m.id} milestone={m} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Bottom grid: Team / Risks / Events ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Project team */}
          <Card className="rounded-2xl">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Your project team
              </CardTitle>
              <div className="">
                <SectionLink href="/client/team" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col gap-0">
              {team.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No team members
                  </div>
                ) : (
                team.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={m.avatar} alt={m.name} />
                      <AvatarFallback>
                        <Users size={14} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active risks */}
          <Card className="rounded-2xl">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Active risks
              </CardTitle>
              <div className="">
                <SectionLink href="/client/risks" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col gap-0">
              {risks.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No active risks
                  </div>
                ) : (
                risks.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                  >
                    <RiskDot level={r.level} />
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {r.detail}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming events */}
          <Card className="rounded-2xl">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Upcoming Event
              </CardTitle>
              <div className="">
                <SectionLink href="/client/calendar" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col gap-0">
              {events.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No upcoming events
                  </div>
                ) : (
                events.map((e: any) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                  >
                    <div className="flex flex-col items-center w-8 shrink-0">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
                        {e.month}
                      </span>
                      <span className="text-base font-bold leading-tight">
                        {e.day}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.time} &bull; {e.location}
                      </p>
                    </div>
                    <EventActionBtn action={e.action} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

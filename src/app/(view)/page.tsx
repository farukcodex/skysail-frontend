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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Chart from "./chart";

// ─── Types ──────────────────────────────────────────────────────────────────

type MilestoneStatus = "completed" | "inprogress" | "notstart";

interface Milestone {
  label: string;
  status: MilestoneStatus;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  tag: "TODAY" | "YESTERDAY";
  thumb: string;
  hasVideo?: boolean;
}

interface Document {
  id: number;
  name: string;
  size: string;
}

interface Decision {
  id: number;
  title: string;
  due: string;
  urgency: "high" | "medium" | "low";
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

interface Risk {
  id: number;
  title: string;
  detail: string;
  level: "high" | "medium" | "low";
}

interface UpcomingEvent {
  id: number;
  month: string;
  day: number;
  title: string;
  time: string;
  location: string;
  action: "rsvp" | "join";
}

// ─── Static data ─────────────────────────────────────────────────────────────

const MILESTONES: Milestone[] = [
  { label: "Site prep & demolition", status: "completed" },
  { label: "Foundation & excavation", status: "completed" },
  { label: "Framing", status: "inprogress" },
  { label: "MEP Systems", status: "notstart" },
  { label: "Interior Finishes", status: "notstart" },
  { label: "Final punch list & handover", status: "notstart" },
];

const NEWS: NewsItem[] = [
  {
    id: 1,
    title: "Framing photos — week 8 progress",
    summary:
      "Main structure completed for west wing. Inspection scheduled for Monday. Timber",
    tag: "TODAY",
    thumb: "https://placehold.co/80x80/8B6914/ffffff?text=Frame",
  },
  {
    id: 2,
    title: "Video walkthrough — second floor",
    summary:
      "4 minute high-definition tour of the structural integrity and layout validation of the second floor master suite.",
    tag: "YESTERDAY",
    thumb: "https://placehold.co/80x80/1a1a1a/ffffff?text=▶",
    hasVideo: true,
  },
];

const DOCUMENTS: Document[] = [
  { id: 1, name: "Construction contract — signed", size: "2.1MB" },
  { id: 2, name: "Architectural plans v3.2", size: "2.1MB" },
  { id: 3, name: "Budget tracker — May 2025", size: "2.1MB" },
  { id: 4, name: "Budget tracker — May 2025", size: "2.1MB" },
];

const DECISIONS: Decision[] = [
  {
    id: 1,
    title: "Primary kitchen tile selection",
    due: "Overdue by 2 days — please action immediately",
    urgency: "high",
  },
  {
    id: 2,
    title: "Window casing profile — master suite",
    due: "Due May 29 · 6 days left",
    urgency: "medium",
  },
  {
    id: 3,
    title: "HVAC system specification sign-off",
    due: "Due May 29 · 12 days left",
    urgency: "low",
  },
];

const TEAM: TeamMember[] = [
  {
    id: 1,
    name: "Bob Henderson",
    role: "Owner's Representative",
    avatar: "https://api.dicebear.com/10.x/micah/svg?seed=Felix",
  },
  {
    id: 2,
    name: "Bob Henderson",
    role: "Owner's Representative",
    avatar: "https://api.dicebear.com/10.x/micah/svg?seed=Felix",
  },
  {
    id: 3,
    name: "Bob Henderson",
    role: "Owner's Representative",
    avatar: "https://api.dicebear.com/10.x/micah/svg?seed=Felix",
  },
];

const RISKS: Risk[] = [
  {
    id: 1,
    title: "Lumber delivery delayed 8 days",
    detail: "May impact framing completion",
    level: "high",
  },
  {
    id: 2,
    title: "Window casing profile — master suite",
    detail: "Due May 29 · 6 days left",
    level: "medium",
  },
  {
    id: 3,
    title: "Window casing profile",
    detail: "Due May 29 · 6 days left",
    level: "medium",
  },
];

const EVENTS: UpcomingEvent[] = [
  {
    id: 1,
    month: "MAY",
    day: 27,
    title: "Sitewalkthrough",
    time: "09:00 AM",
    location: "On-site",
    action: "rsvp",
  },
  {
    id: 2,
    month: "MAY",
    day: 27,
    title: "Interior finishes review",
    time: "09:00 AM",
    location: "Google Meet · Link ready",
    action: "join",
  },
  {
    id: 3,
    month: "JUNE",
    day: 6,
    title: "MEP coordination",
    time: "09:00 AM",
    location: "On-site",
    action: "rsvp",
  },
];

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

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const cfg = {
    completed: {
      icon: <CheckCircle2 size={16} className="text-green-500 shrink-0" />,
      label: "Completed",
      labelCls: "text-green-600 font-medium",
      barCls: "bg-green-500",
      pct: 100,
    },
    inprogress: {
      icon: <CircleEllipsisIcon size={16} className="text-[#C49A3C]" />,
      label: "Inprocess",
      labelCls: "text-[#C49A3C] font-medium",
      barCls: "bg-[#C49A3C]",
      pct: 55,
    },
    notstart: {
      icon: <Circle size={16} className="text-muted-foreground/40 shrink-0" />,
      label: "Not Start",
      labelCls: "text-muted-foreground/50",
      barCls: "bg-muted",
      pct: 0,
    },
  }[milestone.status];

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      {cfg.icon}
      <span
        className={`flex-1 text-sm ${
          milestone.status === "notstart"
            ? "text-muted-foreground/50"
            : "text-foreground"
        }`}
      >
        {milestone.label}
      </span>
      <span className={`text-xs ${cfg.labelCls}`}>{cfg.label}</span>
    </div>
  );
}

function RiskDot({ level }: { level: Risk["level"] }) {
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

function EventActionBtn({ action }: { action: UpcomingEvent["action"] }) {
  return (
    <button
      type="button"
      className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full transition-colors ${
        action === "rsvp"
          ? "bg-foreground text-background hover:opacity-80"
          : "bg-[#C49A3C] text-black hover:opacity-80"
      }`}
    >
      {action === "rsvp" ? "RSVP" : "Join Now"}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* ── Content ── */}
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* ── Greeting ── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good morning, Bob{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Project started Jan 2025 &bull; Last updated 2 hours ago
          </p>
        </div>

        {/* ── Hero image ── */}
        <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden">
          <Image
            src="https://placehold.co/1200x400/1c2b3a/ffffff?text=The+Henderson+Residence"
            alt="The Henderson Residence"
            fill
            className="object-cover"
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
              The Henderson Residence
            </h2>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase */}
          <Card className="bg-foreground text-background ring-0 rounded-2xl col-span-2 sm:col-span-1 relative">
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
              <p className="text-4xl font-bold text-white">3 / 6</p>
              <p className="text-sm text-white/60">Framing — on track</p>
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
              <p className="text-4xl font-bold">62%</p>
              <p className="text-sm font-medium" style={{ color: GOLD }}>
                $403K of $650K
              </p>
            </CardContent>
          </Card>

          {/* Days remaining */}
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="p-4 bg-secondary rounded-full w-min">
                <CalendarIcon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                <Clock size={12} /> Days Remaining
              </div>
              <p className="text-4xl font-bold">187</p>
              <p className="text-sm text-green-600 font-medium">
                Est. completion Nov 2025
              </p>
            </CardContent>
          </Card>

          {/* Decisions needed */}
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="p-4 bg-secondary rounded-full w-min">
                <CalendarCheckIcon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                <Bell size={12} /> Decisions Needed
              </div>
              <p className="text-4xl font-bold text-red-500">3</p>
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
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Project news feed
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center">
                  <SectionLink href="/news-feed" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-0 pt-2">
                {NEWS.map((item) => (
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
                      <button
                        type="button"
                        className="text-xs font-medium mt-1.5 hover:opacity-80 transition-opacity"
                        style={{ color: GOLD }}
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent documents */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Recent Documents
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center">
                  <SectionLink href="/documents" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {DOCUMENTS.map((doc) => (
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
                ))}
              </CardContent>
            </Card>

            {/* Pending decisions */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Pending decisions
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center">
                  <SectionLink href="/decisions" />
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col gap-0">
                {DECISIONS.map((d) => (
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
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right col — 2/5 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Budget analysis */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Budget Analysis
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center ml-auto">
                  <Button
                    variant="outline"
                    size="xs"
                    className="rounded-full text-xs gap-1"
                  >
                    Phase: Framing
                    <span className="text-muted-foreground">▾</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                      Spent
                    </p>
                    <p className="text-lg font-bold mt-0.5">$403,200</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
                      Pending
                    </p>
                    <p className="text-lg font-bold mt-0.5">$14,500</p>
                  </div>
                </div>
                {/* Bar chart */}
                <Chart />
              </CardContent>
            </Card>

            {/* Key milestones */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Key Milestones
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center">
                  <SectionLink href="/milestones" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {MILESTONES.map((m) => (
                  <MilestoneRow key={m.label} milestone={m} />
                ))}
              </CardContent>
            </Card>
            {/* ── Video section ── */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">Video</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted group cursor-pointer">
                        <Image
                          src={`https://placehold.co/600x340/1c2b3a/ffffff?text=Video+${i}`}
                          alt={`Video ${i}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                          <div className="size-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play
                              size={16}
                              className="text-white fill-white ml-0.5"
                            />
                          </div>
                        </div>
                        <Badge className="absolute top-2 left-2 bg-foreground text-background text-[10px]">
                          Video
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        Video walkthrough — second floor
                      </p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Bottom grid: Team / Risks / Events ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Project team */}
          <Card className="rounded-2xl">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">
                Your project team
              </CardTitle>
              <div className="col-start-2 row-start-1 self-center">
                <SectionLink href="/team" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col gap-0">
              {TEAM.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                >
                  <Avatar size="default" className="size-9 shrink-0">
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
              ))}
            </CardContent>
          </Card>

          {/* Active risks */}
          <Card className="rounded-2xl">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">
                Active risks
              </CardTitle>
              <div className="col-start-2 row-start-1 self-center">
                <SectionLink href="/risks" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col gap-0">
              {RISKS.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                >
                  <RiskDot level={r.level} />
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.detail}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming events */}
          <Card className="rounded-2xl">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">
                Upcoming Event
              </CardTitle>
              <div className="col-start-2 row-start-1 self-center">
                <SectionLink href="/calendar" />
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col gap-0">
              {EVENTS.map((e) => (
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
                    <p className="text-xs text-muted-foreground">
                      {e.time} &bull; {e.location}
                    </p>
                  </div>
                  <EventActionBtn action={e.action} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

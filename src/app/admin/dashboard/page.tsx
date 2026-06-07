import {
  ArrowRight,
  CalendarCheckIcon,
  Edit2,
  FolderKanban,
  PlusIcon,
  Users2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  id: number;
  name: string;
  phase: string;
  phaseNum: number;
  totalPhases: number;
  status: "on-track" | "at-risk" | "delayed";
  thumb: string;
}

interface RecentClient {
  id: number;
  name: string;
  project: string;
  avatar: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

interface UpcomingEvent {
  id: number;
  month: string;
  day: number;
  title: string;
  detail: string;
  action: "rsvp" | "join";
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: 1,
    name: "The Henderson Residence",
    phase: "Framing",
    phaseNum: 3,
    totalPhases: 6,
    status: "on-track",
    thumb: "https://placehold.co/56x56/8B6914/ffffff?text=H",
  },
  {
    id: 2,
    name: "The Mercer Custom Build",
    phase: "MEP",
    phaseNum: 4,
    totalPhases: 6,
    status: "on-track",
    thumb: "https://placehold.co/56x56/1c2b3a/ffffff?text=M",
  },
  {
    id: 3,
    name: "The Larsen Pool & Addition",
    phase: "MEP",
    phaseNum: 4,
    totalPhases: 6,
    status: "on-track",
    thumb: "https://placehold.co/56x56/2d4a2d/ffffff?text=L",
  },
  {
    id: 4,
    name: "The Larsen Pool & Addition",
    phase: "MEP",
    phaseNum: 4,
    totalPhases: 6,
    status: "on-track",
    thumb: "https://placehold.co/56x56/3a2d1c/ffffff?text=L",
  },
];

const RECENT_CLIENTS: RecentClient[] = [
  {
    id: 1,
    name: "Bob Henderson",
    project: "The Henderson Residence",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=40&backgroundColor=b6e3f4",
  },
  {
    id: 2,
    name: "Bob Henderson",
    project: "The Henderson Residence",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson2&size=40&backgroundColor=c0aede",
  },
  {
    id: 3,
    name: "Bob Henderson",
    project: "The Henderson Residence",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson3&size=40&backgroundColor=d1d4f9",
  },
  {
    id: 4,
    name: "Bob Henderson",
    project: "The Henderson Residence",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson4&size=40&backgroundColor=ffd5dc",
  },
];

const TEAM: TeamMember[] = [
  {
    id: 1,
    name: "Bob Henderson",
    role: "Owner's Representative",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=RemyDiAngelo&size=40&backgroundColor=b6e3f4",
  },
  {
    id: 2,
    name: "Bob Henderson",
    role: "Owner's Representative",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=JamesSullivan&size=40&backgroundColor=c0aede",
  },
  {
    id: 3,
    name: "Bob Henderson",
    role: "Owner's Representative",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=AnnaKeller&size=40&backgroundColor=d1d4f9",
  },
];

const EVENTS: UpcomingEvent[] = [
  {
    id: 1,
    month: "MAY",
    day: 27,
    title: "Henderson site walkthrough",
    detail: "On-site · Remy + James Sullivan",
    action: "rsvp",
  },
  {
    id: 2,
    month: "MAY",
    day: 27,
    title: "Interior finishes design review",
    detail: "Google meet · Bob Henderson confirmed",
    action: "join",
  },
  {
    id: 3,
    month: "MAY",
    day: 27,
    title: "Interior finishes design review",
    detail: "On-site · Remy + James Sullivan",
    action: "rsvp",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

function SectionLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity"
      style={{ color: GOLD }}
    >
      View All <ArrowRight size={12} />
    </Link>
  );
}

function StatusPill({ status }: { status: Project["status"] }) {
  if (status === "on-track")
    return (
      <span className="text-xs font-semibold text-green-600">On track</span>
    );
  if (status === "at-risk")
    return (
      <span className="text-xs font-semibold text-yellow-500">At risk</span>
    );
  return <span className="text-xs font-semibold text-red-500">Delayed</span>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Good morning, Bob{" "}
              <span role="img" aria-label="wave">
                👋
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of all active projects &bull; May 23, 2025
            </p>
          </div>
          <button
            type="submit"
            className="flex items-center gap-6 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Add Project
            <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
              <PlusIcon size={16} className="text-white" />
            </span>
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Projects — dark */}
          <Card className="bg-foreground text-background rounded-2xl relative overflow-hidden col-span-2 sm:col-span-1">
            <CardHeader className="pb-2">
              <div className="p-3 bg-white/10 rounded-full w-min">
                <FolderKanban className="size-4 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-white/50">
                Active Projects
              </p>
              <p className="text-4xl font-bold text-white">3</p>
              <p className="text-sm text-white/50">All on track</p>
            </CardContent>
            <div className="size-28 rounded-full bg-white/10 absolute -right-14 top-1/2 -translate-y-1/2" />
            <div className="size-10 rounded-full bg-white/20 absolute -right-5 top-1/2 -translate-y-1/2" />
          </Card>

          {/* Total Clients */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="p-3 bg-secondary rounded-full w-min">
                <Users2Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                Total Clients
              </p>
              <p className="text-4xl font-bold">23</p>
              <p className="text-sm font-medium" style={{ color: GOLD }}>
                All Client
              </p>
            </CardContent>
          </Card>

          {/* Open Decisions */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="p-3 bg-secondary rounded-full w-min">
                <CalendarCheckIcon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                Open Decisions
              </p>
              <p className="text-4xl font-bold">18</p>
              <p className="text-sm font-medium text-red-500">
                Awaiting client action
              </p>
            </CardContent>
          </Card>

          {/* Decisions Needed */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <div className="p-3 bg-secondary rounded-full w-min">
                <CalendarCheckIcon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
                Decisions Needed
              </p>
              <p className="text-4xl font-bold" style={{ color: GOLD }}>
                2
              </p>
              <p className="text-sm font-medium" style={{ color: GOLD }}>
                Monitoring
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — 3/5 */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Active Projects */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Active projects
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center ml-auto">
                  <SectionLink href="/admin/projects" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {PROJECTS.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                  >
                    <div className="size-10 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <Image
                        src={p.thumb}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="object-cover size-10"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Phase {p.phaseNum} of {p.totalPhases} &middot; {p.phase}
                      </p>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Team Members
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center">
                  <SectionLink href="/admin/team" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {TEAM.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={m.avatar} alt={m.name} />
                      <AvatarFallback className="text-xs">
                        {m.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right — 2/5 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Recent Client */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Recent Client
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center">
                  <SectionLink href="/admin/clients" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {RECENT_CLIENTS.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 py-3 border-b border-border last:border-0 bg-secondary/40 rounded-xl px-3 mb-1.5 last:mb-0"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={c.avatar} alt={c.name} />
                      <AvatarFallback className="text-xs">
                        {c.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.project}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Event */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-semibold">
                  Upcoming Event
                </CardTitle>
                <div className="col-start-2 row-start-1 self-center">
                  <SectionLink href="/admin/calendar" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
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
                      <p className="text-sm font-semibold truncate">
                        {e.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.detail}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold shrink-0"
                      style={{ color: GOLD }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

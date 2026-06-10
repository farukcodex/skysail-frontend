import { CheckCircle2, Circle, CircleEllipsisIcon, Clock } from "lucide-react";
import Image from "next/image";

type MilestoneStatus = "completed" | "active" | "upcoming";

type Milestone = {
  id: number;
  title: string;
  status: MilestoneStatus;
  label: string;
  dateLabel: string;
  date: string;
  completedBy?: { name: string; role: string; avatar: string };
};

const MILESTONES: Milestone[] = [
  {
    id: 1,
    title: "1. Site Prep & Demolition",
    status: "completed",
    label: "COMPLETED",
    dateLabel: "",
    date: "Jan 15, 2025",
    completedBy: {
      name: "Bob Henderson",
      role: "Interior designer",
      avatar:
        "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=40&backgroundColor=b6e3f4",
    },
  },
  {
    id: 2,
    title: "2. Foundation & Excavation",
    status: "completed",
    label: "COMPLETED",
    dateLabel: "",
    date: "Jan 15, 2025",
    completedBy: {
      name: "Bob Henderson",
      role: "Interior designer",
      avatar:
        "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=40&backgroundColor=b6e3f4",
    },
  },
  {
    id: 3,
    title: "3. Framing",
    status: "active",
    label: "ACTIVE PHASE",
    dateLabel: "Est. Completion:",
    date: "Jun 20, 2025",
  },
  {
    id: 4,
    title: "4. Mechanical, Electrical & Plumbing",
    status: "upcoming",
    label: "TARGET START",
    dateLabel: "",
    date: "Jul 1, 2025",
  },
  {
    id: 5,
    title: "5. Interior Finishes",
    status: "upcoming",
    label: "TARGET START",
    dateLabel: "",
    date: "Sep 1, 2025",
  },
  {
    id: 6,
    title: "6. Punch List & Handover",
    status: "upcoming",
    label: "EST. COMPLETION",
    dateLabel: "",
    date: "Nov 2025",
  },
];

const ACTIVE = MILESTONES.find((m) => m.status === "active") ?? MILESTONES[0];
const PROGRESS = 72;

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

function MilestoneRow({ m, isLast }: { m: Milestone; isLast: boolean }) {
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
  return (
    <div className="p-6">
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
        <div className="text-right shrink-0">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Projected Handover
          </p>
          <p className="text-lg font-bold">Nov 2025</p>
        </div>
      </div>

      {/* Active phase progress bar */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 mb-6 flex items-center gap-4">
        <CircleEllipsisIcon size={16} className="text-[#C49A3C]" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold">
              {ACTIVE.title.replace(/^\d+\.\s/, "")}
            </span>
            <span className="text-xs font-semibold text-[#C49A3C] bg-[#C49A3C]/10 px-2 py-0.5 rounded-full">
              In Progress · {PROGRESS}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-[#C49A3C]"
              style={{ width: `${PROGRESS}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        {MILESTONES.map((m, i) => (
          <MilestoneRow key={m.id} m={m} isLast={i === MILESTONES.length - 1} />
        ))}
      </div>
    </div>
  );
}

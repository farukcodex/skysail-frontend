import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

type Urgency = "high" | "medium" | "low";

interface Decision {
  id: number;
  title: string;
  body: string;
  urgency: Urgency;
  dueLabel: string;
  thumb: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DECISIONS: Decision[] = [
  {
    id: 1,
    title: "Primary kitchen tile selection",
    body: "The tile contractor needs your selection to proceed with installation. A physical sample board has been delivered to your home for review. Delaying this decision will impact the counter-top template schedule.",
    urgency: "high",
    dueLabel: "OVERDUE BY 2 DAYS",
    thumb: "https://placehold.co/320x240/c8c8c0/ffffff?text=Tile",
  },
  {
    id: 2,
    title: "Window casing profile — master suite",
    body: "Choose between profile A (flat modern) or profile B (beveled classic). This choice will set the architectural tone for the primary living spaces. CAD drawings are attached in the Resources section.",
    urgency: "medium",
    dueLabel: "DUE MAY 29 · 6 DAYS LEFT",
    thumb: "https://placehold.co/320x240/b8b8b0/ffffff?text=Window",
  },
  {
    id: 3,
    title: "HVAC system specification sign-off",
    body: "Review and approve the mechanical engineer's HVAC specification before procurement begins. This includes the silent-running heat pump units and whole-home filtration systems.",
    urgency: "medium",
    dueLabel: "DUE MAY 29 · 6 DAYS LEFT",
    thumb: "https://placehold.co/320x240/a8a8a0/ffffff?text=HVAC",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function UrgencyBadge({ urgency, label }: { urgency: Urgency; label: string }) {
  if (urgency === "high")
    return (
      <span className="inline-flex w-min whitespace-nowrap items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-3 py-1 rounded-full">
        <AlertTriangle size={11} />
        {label}
      </span>
    );
  return (
    <span className="inline-flex w-min whitespace-nowrap items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[#C49A3C] bg-[#C49A3C]/10 border border-[#C49A3C]/20 px-3 py-1 rounded-full">
      <CalendarClock size={11} />
      {label}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DecisionsPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pending Decisions
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            A curated selection of critical project choices requiring your
            immediate oversight to ensure construction continuity.
          </p>
        </div>

        {/* Decision cards */}
        <div className="flex flex-col gap-4 ">
          {DECISIONS.map((d) => (
            <Card key={d.id} className="rounded-2xl overflow-hidden">
              <CardContent className="flex flex-col sm:flex-row">
                {/* Thumbnail */}

                <div className="w-full sm:w-auto flex justify-center items-center">
                  <Image
                    src={d.thumb}
                    alt={d.title}
                    height={240}
                    width={240}
                    className="object-cover aspect-square rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col gap-3 justify-center">
                  <UrgencyBadge urgency={d.urgency} label={d.dueLabel} />

                  <h2 className="text-lg font-bold leading-snug">{d.title}</h2>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {d.body}
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-foreground text-background hover:opacity-80 rounded-full gap-1.5 text-xs font-bold tracking-widest uppercase px-5"
                    >
                      <CheckCircle2 size={13} />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1.5 text-xs font-bold tracking-widest uppercase px-5 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 dark:border-red-800"
                    >
                      <XCircle size={13} />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

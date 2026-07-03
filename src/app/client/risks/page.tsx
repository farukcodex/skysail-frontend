import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskStatus = "active" | "monitoring" | "resolved";

interface Risk {
  id: number;
  title: string;
  body: string;
  status: RiskStatus;
  closedDate?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const RISKS: Risk[] = [
  {
    id: 1,
    title: "Lumber delivery delayed 8 days",
    body: "The primary lumber supplier has notified us of an 8-day delay due to transport issues. This may push the framing completion from June 12 to June 20. We are monitoring closely and exploring alternative suppliers. No budget impact expected at this stage.",
    status: "active",
  },
  {
    id: 2,
    title: "Electrical permit under city review",
    body: "The electrical permit is currently under review by the city planning office. Standard review periods are 10–15 business days. We submitted on May 10 and expect approval by May 30. MEP work cannot begin until this is approved.",
    status: "monitoring",
  },
  {
    id: 3,
    title: "Electrical permit under city review",
    body: "The electrical permit is currently under review by the city planning office. Standard review periods are 10–15 business days. We submitted on May 10 and expect approval by May 30. MEP work cannot begin until this is approved.",
    status: "monitoring",
  },
  {
    id: 4,
    title: "Electrical permit under city review",
    body: "The electrical permit is currently under review by the city planning office. Standard review periods are 10–15 business days. We submitted on May 10 and expect approval by May 30. MEP work cannot begin until this is approved.",
    status: "monitoring",
  },
  {
    id: 5,
    title: "Lumber delivery delayed 8 days",
    body: "A minor survey discrepancy identified in March has been fully resolved. The surveyor re-certified the lot boundaries and the builder has confirmed no structural impact.",
    status: "resolved",
    closedDate: "Apr 5, 2025",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RiskStatus }) {
  if (status === "active")
    return (
      <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2.5 py-1 rounded-full">
        Active
      </span>
    );
  if (status === "monitoring")
    return (
      <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-[#C49A3C] bg-[#C49A3C]/10 border border-[#C49A3C]/20 px-2.5 py-1 rounded-full">
        Monitoring
      </span>
    );
  return (
    <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-green-600 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 px-2.5 py-1 rounded-full">
      Resolved
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RisksPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-4">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Priority Risk Log
          </h1>
        </div>

        {/* Risk cards */}
        <div className="flex flex-col gap-4 ">
          {RISKS.map((r) => (
            <Card key={r.id} className="rounded-2xl">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-sm font-bold leading-snug">{r.title}</h2>
                  <StatusBadge status={r.status} />
                </div>

                <p
                  className={`text-sm leading-relaxed ${
                    r.status === "resolved"
                      ? "text-muted-foreground italic"
                      : "text-muted-foreground"
                  }`}
                >
                  {r.body}
                </p>

                {r.closedDate && (
                  <p className="text-sm text-muted-foreground italic mt-1">
                    Closed {r.closedDate}.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

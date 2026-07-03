import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notification {
  id: number;
  title: string;
  subtitle: string;
}

interface NotifGroup {
  label: string;
  items: Notification[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const GROUPS: NotifGroup[] = [
  {
    label: "Today",
    items: [
      {
        id: 1,
        title: "Action required — Kitchen tile selection is overdue",
        subtitle: "2 hours ago · Please approve or reject in decisions",
      },
      {
        id: 2,
        title: "New photos — Week 8 framing progress",
        subtitle: "Remy posted 12 photos · 3 hours ago",
      },
      {
        id: 3,
        title: "New video update from Remy",
        subtitle: "Watch: second floor walkthrough · 5 hours ago",
      },
    ],
  },
  {
    label: "Yesterday",
    items: [
      {
        id: 4,
        title: "Risk alert — Lumber delivery delayed 8 days",
        subtitle: "Yesterday, 4:02 PM · View risks page",
      },
      {
        id: 5,
        title: "Meeting invite — Site walkthrough May 27",
        subtitle: "Added to your Google Calendar · RSVP requested",
      },
      {
        id: 6,
        title: "New document available — Revised architectural plans v3.2",
        subtitle: "Uploaded by Anna Keller · Approved by Remy · May 20",
      },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotifRow({ item, isLast }: { item: Notification; isLast: boolean }) {
  return (
    <div
      className={`py-4 ${!isLast ? "border-b border-border" : ""}`}
    >
      <p className="text-sm font-semibold leading-snug">{item.title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Calendar &amp; meetings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Google Calendar synced · Upcoming appointments
          </p>
        </div>

        {/* Groups */}
        <div className="flex flex-col gap-4">
          {GROUPS.map((group) => (
            <Card key={group.label} className="rounded-2xl">
              <CardContent className="pt-4 pb-1">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  {group.label}
                </p>
                {group.items.map((item, i) => (
                  <NotifRow
                    key={item.id}
                    item={item}
                    isLast={i === group.items.length - 1}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { CalendarCheck2, CalendarPlus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

type EventAction = "rsvp" | "join";

interface CalEvent {
  id: number;
  month: string;
  day: number;
  title: string;
  time: string;
  location: string;
  attendees: string;
  action: EventAction;
  confirmed?: boolean;
}

interface MonthGroup {
  label: string;
  events: CalEvent[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MONTHS: MonthGroup[] = [
  {
    label: "MAY 2025",
    events: [
      {
        id: 1,
        month: "MAY",
        day: 27,
        title: "Sitewalkthrough",
        time: "10:00 AM",
        location: "On-site · 142 Maple Ridge Rd",
        attendees: "With Remy + James Sullivan",
        action: "rsvp",
      },
      {
        id: 2,
        month: "MAY",
        day: 27,
        title: "Sitewalkthrough",
        time: "2:00 PM",
        location: "Google Meet",
        attendees: "With Remy + Marco Torres (Interior Designer)",
        action: "join",
        confirmed: true,
      },
      {
        id: 3,
        month: "MAY",
        day: 27,
        title: "Sitewalkthrough",
        time: "10:00 AM",
        location: "On-site · 142 Maple Ridge Rd",
        attendees: "With Remy + James Sullivan",
        action: "rsvp",
      },
    ],
  },
  {
    label: "JUNE 2025",
    events: [
      {
        id: 4,
        month: "MAY",
        day: 27,
        title: "Sitewalkthrough",
        time: "10:00 AM",
        location: "On-site · 142 Maple Ridge Rd",
        attendees: "With Remy + James Sullivan",
        action: "rsvp",
      },
      {
        id: 5,
        month: "MAY",
        day: 27,
        title: "Sitewalkthrough",
        time: "2:00 PM",
        location: "Google Meet",
        attendees: "With Remy + Marco Torres (Interior Designer)",
        action: "join",
        confirmed: true,
      },
      {
        id: 6,
        month: "MAY",
        day: 27,
        title: "Sitewalkthrough",
        time: "10:00 AM",
        location: "On-site · 142 Maple Ridge Rd",
        attendees: "With Remy + James Sullivan",
        action: "rsvp",
      },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventRow({ event }: { event: CalEvent }) {
  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0 items-start">
      {/* Date column */}
      <div className="flex flex-col items-center w-10 shrink-0 pt-0.5">
        <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
          {event.month}
        </span>
        <span className="text-xl font-bold leading-tight">{event.day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {event.location} · {event.time} · {event.attendees}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2.5">
          {event.action === "rsvp" ? (
            <>
              <button
                type="button"
                className="text-[11px] font-bold tracking-widest uppercase bg-foreground text-background px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
              >
                RSVP
              </button>
              <button
                type="button"
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <CalendarPlus size={12} />
                Add to Google cal
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="text-[11px] font-bold tracking-widest uppercase bg-foreground text-background px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
              >
                Join Google Meet
              </button>
              {event.confirmed && (
                <span className="text-[11px] font-bold text-green-600">
                  Confirmed
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
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

        {/* Sync banner */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/40 rounded-xl px-5 py-3 flex items-start gap-2.5">
          <CalendarCheck2
            size={15}
            className="text-green-600 mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              Google Calendar synced
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
              All meetings below are synced to your Google Calendar. Invites are
              sent automatically when Remy schedules a meeting.
            </p>
          </div>
        </div>

        {/* Month groups */}
        <div className="flex flex-col gap-5 ">
          {MONTHS.map((group) => (
            <Card key={group.label} className="rounded-2xl">
              <CardContent className="pt-5 pb-1">
                <p className="text-xs font-bold tracking-widest text-muted-foreground mb-1">
                  {group.label}
                </p>
                {group.events.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

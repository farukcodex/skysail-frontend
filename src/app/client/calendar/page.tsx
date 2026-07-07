"use client";

import { CalendarCheck2, CalendarPlus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getEchoInstance } from "@/lib/echo";
import { toast } from "sonner";

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
  joinLink?: string;
  rawDate: string;
}

interface MonthGroup {
  label: string;
  events: CalEvent[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapBackendMeeting(m: any): CalEvent {
  const d = new Date(m.date);
  return {
    id: m.id,
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    title: m.title,
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    location: m.location || (m.type === "meet" || m.type === "online" ? "Google Meet" : "On-site"),
    attendees: "With Remy + Team",
    action: m.meeting_link ? "join" : "rsvp",
    confirmed: m.status !== "pending",
    joinLink: m.meeting_link,
    rawDate: m.date,
  };
}

function getGoogleCalendarUrl(event: CalEvent) {
  const startDate = new Date(event.rawDate);
  // Add 1 hour for end time
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: event.joinLink ? `Join meeting here: ${event.joinLink}` : "Meeting with Remy + Team",
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function groupByMonth(events: CalEvent[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const e of events) {
    const label = `${e.month} ${new Date().getFullYear()}`; // simplify year logic
    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, events: [] };
      groups.push(group);
    }
    group.events.push(e);
  }
  return groups;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventRow({ event }: { event: CalEvent }) {
  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0 items-start">
      <div className="flex flex-col items-center w-10 shrink-0 pt-0.5">
        <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
          {event.month}
        </span>
        <span className="text-xl font-bold leading-tight">{event.day}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {event.location} · {event.time} · {event.attendees}
        </p>

        <div className="flex items-center gap-3 mt-2.5">
          {event.action === "rsvp" ? (
            <>
              <button
                type="button"
                className="text-[11px] font-bold tracking-widest uppercase bg-foreground text-background px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
              >
                RSVP
              </button>
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <CalendarPlus size={12} />
                Add to Google cal
              </a>
            </>
          ) : (
            <>
              {event.joinLink ? (
                <a
                  href={event.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold tracking-widest uppercase bg-foreground text-background px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                >
                  Join Google Meet
                </a>
              ) : (
                <button
                  type="button"
                  className="text-[11px] font-bold tracking-widest uppercase bg-foreground text-background px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                >
                  Join Google Meet
                </button>
              )}
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
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming the client only sees their own project meetings.
    // In a real app, you might fetch user's active project ID first.
    // For now we just fetch all meetings they are allowed to see.
    apiFetch("/api/meetings")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setEvents(data.data.map(mapBackendMeeting));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // To listen to pusher properly, we need the specific project ID.
    // Since we fetch /api/meetings globally for the client, we might need to get user's project ID first.
    // For demonstration, if we assume project ID 1:
    const projectId = 1; // HARDCODED FOR DEMO. Ideally user profile tells us this.
    const echo = getEchoInstance();
    if (echo) {
      const channel = echo.private(`project.${projectId}`);
      channel.listen("MeetingCreated", (e: any) => {
        setEvents((prev) => {
          if (prev.find((ev) => ev.id === e.meeting.id)) return prev;
          return [mapBackendMeeting(e.meeting), ...prev].sort((a, b) => b.id - a.id);
        });
        toast("Remy scheduled a new meeting with you!");
      });
      return () => {
        echo.leave(`project.${projectId}`);
      };
    }
  }, []);

  const groups = groupByMonth(events);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar &amp; meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Google Calendar synced · Upcoming appointments
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/40 rounded-xl px-5 py-3 flex items-start gap-2.5">
          <CalendarCheck2 size={15} className="text-green-600 mt-0.5 shrink-0" />
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

        <div className="flex flex-col gap-5">
          {loading ? (
             <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
          ) : groups.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No upcoming meetings.</div>
          ) : (
            groups.map((group) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

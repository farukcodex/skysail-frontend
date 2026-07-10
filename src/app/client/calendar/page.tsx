"use client";

import { CalendarCheck2, CalendarPlus, Loader2, Video, Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getEchoInstance } from "@/lib/echo";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ClientProjectDropdown } from "@/components/shared/ClientProjectDropdown";

// --- Types -------------------------------------------------------------------

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
  type: string;
  status: string;
  projectName: string;
}

interface MonthGroup {
  label: string;
  events: CalEvent[];
  timezone?: string;
}

const TZ_MAP: Record<string, string> = {
  "America/New_York": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  "America/Los_Angeles": "PT",
  "Europe/London": "GMT",
  "Europe/Paris": "CET"
};

// --- Helpers -----------------------------------------------------------------

function mapBackendMeeting(m: any): CalEvent {
  const d = new Date(m.date);
  return {
    id: m.id,
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    title: m.title,
    time: `${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${TZ_MAP[m.timezone || "America/New_York"] || "ET"}`,
    location: m.location || (m.type === "meet" || m.type === "online" ? "Google Meet" : "On-site"),
    attendees: "With Remy + Team",
    action: m.status === "pending" ? "rsvp" : (m.meeting_link ? "join" : "rsvp"),
    confirmed: m.status === "confirmed",
    joinLink: m.meeting_link,
    rawDate: m.date,
    type: m.type,
    status: m.status,
    projectName: m.project?.name || "My Project",
  };
}

function getGoogleCalendarUrl(event: CalEvent) {
  const startDate = new Date(event.rawDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.title} - ${event.projectName}`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: event.joinLink ? `Join meeting here: ${event.joinLink}` : "Meeting with Remy + Team",
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function groupByMonth(events: CalEvent[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const e of events) {
    const label = `${e.month} ${new Date().getFullYear()}`;
    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, events: [] };
      groups.push(group);
    }
    group.events.push(e);
  }
  return groups;
}

// --- Sub-components -----------------------------------------------------------

function EventRow({ event, onConfirm, onDecline, onReschedule }: { event: CalEvent; onConfirm: (id: number) => void; onDecline: (id: number) => void; onReschedule: (id: number) => void }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 py-5 border-b border-border last:border-0 md:items-start">
      <div className="flex flex-row md:flex-col items-center gap-3 md:gap-0 md:w-14 shrink-0 pt-0.5 pb-3 md:pb-0 border-b md:border-b-0 border-border">
        <span className="text-[10px] font-bold tracking-[2px] uppercase text-muted-foreground">
          {event.month}
        </span>
        <span className="text-2xl font-bold leading-tight md:mt-1">{event.day}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-foreground">{event.title}</p>
            <p className="text-xs font-semibold text-primary/80 mt-1 uppercase tracking-wider">{event.projectName}</p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {event.location} · {event.time} · {event.attendees}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-3.5">
          {event.status === "pending" ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onConfirm(event.id)}
                className="text-[11px] font-bold tracking-widest uppercase bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors shadow-sm"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => onReschedule(event.id)}
                className="text-[11px] font-bold tracking-widest uppercase border border-border px-4 py-2 rounded-full hover:bg-secondary transition-colors"
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => onDecline(event.id)}
                className="text-[11px] font-bold tracking-widest uppercase border border-red-200 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
              >
                Decline
              </button>
            </div>
          ) : event.status === "declined" ? (
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded-full">Declined</span>
          ) : event.status === "reschedule_requested" ? (
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">Reschedule Pending</span>
          ) : (
            <>
              {event.joinLink ? (
                <a
                  href={event.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold tracking-widest uppercase bg-foreground text-background px-4 py-2 rounded-full hover:opacity-80 transition-opacity shadow-sm"
                >
                  {event.type === "zoom" ? "Join Zoom" : "Join Meet"}
                </a>
              ) : (
                <span className="text-[11px] font-bold tracking-widest uppercase bg-secondary text-foreground px-4 py-2 rounded-full">
                  In Person
                </span>
              )}
              <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1.5 rounded-full border border-green-100 inline-block">
                Confirmed
              </span>
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 ml-1"
              >
                <CalendarPlus size={14} />
                Add to Cal
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------------

const PAGE_SIZE = 10;
const GOLD = "#C49A3C";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<{id: number, name: string}[]>([]);
  const [projectId, setProjectId] = useState<string>("all");
  
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("upcoming");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modals state
  const [declineId, setDeclineId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleTimezone, setRescheduleTimezone] = useState("America/New_York");
  const [rescheduleReason, setRescheduleReason] = useState("");

  useEffect(() => {
    const fetchProjectsList = async () => {
      try {
        const res = await apiFetch("/api/client/projects?all=true");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjectsList();
  }, []);

  const fetchMeetings = () => {
    setLoading(true);
    const url = `/api/client/meetings?page=${page}&per_page=${PAGE_SIZE}&status=${statusFilter}&type=${typeFilter}&date_filter=${dateFilter}&project_id=${projectId}`;
    
    apiFetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.data) {
          setEvents(data.data.data.map(mapBackendMeeting));
          setTotalPages(data.data.last_page || 1);
        } else if (Array.isArray(data.data)) {
          setEvents(data.data.map(mapBackendMeeting));
          setTotalPages(1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetings();
  }, [page, statusFilter, dateFilter, typeFilter, projectId]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter, typeFilter, projectId]);

  useEffect(() => {
    const echo = getEchoInstance();
    // Clients can have multiple projects, ideally we listen to a user channel, 
    // but for now we'll stick to a generic project channel or just fetch.
    if (echo) {
      // NOTE: Real-time echo listening might need to be adjusted for all client projects
    }
  }, []);

  const handleConfirm = async (id: number) => {
    try {
      const res = await apiFetch(`/api/client/meetings/${id}/confirm`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to confirm");
      toast.success("Meeting confirmed!");
      setEvents((prev) => prev.map(e => e.id === id ? { ...e, status: "confirmed", confirmed: true } : e));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const submitDecline = async () => {
    if (!declineId) return;
    try {
      const res = await apiFetch(`/api/client/meetings/${declineId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: declineReason })
      });
      if (!res.ok) throw new Error("Failed to decline");
      toast.success("Meeting declined.");
      setEvents((prev) => prev.map(e => e.id === declineId ? { ...e, status: "declined" } : e));
      setDeclineId(null);
      setDeclineReason("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleId || !rescheduleDate || !rescheduleTime) {
      toast.error("Please fill in date and time");
      return;
    }

    const proposed = new Date(`${rescheduleDate}T${rescheduleTime}`);
    if (proposed < new Date()) {
      toast.error("You cannot reschedule to a past time.");
      return;
    }

    try {
      const res = await apiFetch(`/api/client/meetings/${rescheduleId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: rescheduleDate,
          time: rescheduleTime,
          timezone: rescheduleTimezone,
          reason: rescheduleReason
        })
      });
      if (!res.ok) throw new Error("Failed to request reschedule");
      toast.success("Reschedule requested.");
      setEvents((prev) => prev.map(e => e.id === rescheduleId ? { ...e, status: "reschedule_requested" } : e));
      setRescheduleId(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleReason("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const groups = groupByMonth(events);

  const pageNumbers = (current: number, total: number) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, "...", total];
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-4 py-8 md:px-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar &amp; Meetings</h1>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <CalendarCheck2 size={16} className="text-primary" />
              Manage your upcoming project milestones and consultations.
            </p>
          </div>
          <div className="w-full sm:w-auto flex sm:justify-end">
            <ClientProjectDropdown
              projects={projects}
              value={projectId}
              onChange={(val) => setProjectId(val)}
              showAllOption={true}
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border border-[#C4C7C7]/50 shadow-sm">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[140px] rounded-xl border border-border bg-background px-4 h-[48px] text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Action Required</option>
            <option value="confirmed">Confirmed</option>
            <option value="reschedule_requested">Rescheduling</option>
            <option value="declined">Declined</option>
          </select>
          
          <select 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            className="flex-1 min-w-[140px] rounded-xl border border-border bg-background px-4 h-[48px] text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 appearance-none cursor-pointer"
          >
            <option value="upcoming">Upcoming Meetings</option>
            <option value="past">Past Meetings</option>
            <option value="all">All Time</option>
          </select>

          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="flex-1 min-w-[140px] rounded-xl border border-border bg-background px-4 h-[48px] text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 appearance-none cursor-pointer"
          >
            <option value="all">All Formats</option>
            <option value="meet">Google Meet</option>
            <option value="zoom">Zoom</option>
            <option value="on-site">In Person</option>
          </select>
        </div>

        {/* List Section */}
        <div className="flex flex-col gap-6 mt-2">
          {loading ? (
             <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white border border-[#C4C7C7]/50 rounded-[32px]">
               <Loader2 className="animate-spin text-primary size-8" />
               <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing calendar...</p>
             </div>
          ) : groups.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center justify-center bg-white border border-[#C4C7C7]/50 rounded-[32px]">
              <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <CalendarCheck2 className="text-muted-foreground size-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">You're all caught up!</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                You have no meetings matching these filters. Enjoy your free time!
              </p>
            </div>
          ) : (
            <>
              {groups.map((group) => (
                <div key={group.label} className="bg-white border border-[#C4C7C7]/50 rounded-[32px] p-6 shadow-sm overflow-hidden">
                  <p className="text-sm font-bold tracking-[2px] text-muted-foreground mb-2 ml-1 uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-col">
                    {group.events.map((e) => (
                      <EventRow 
                        key={e.id} 
                        event={e} 
                        onConfirm={handleConfirm}
                        onDecline={setDeclineId}
                        onReschedule={setRescheduleId}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border border-[#C4C7C7]/50 bg-white rounded-2xl p-4 mt-2 shadow-sm">
                  <p className="text-sm text-muted-foreground font-medium">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="size-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                    {pageNumbers(page, totalPages).map((p, i) => p === "..." ? (<span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">...</span>) : (<button key={p} type="button" onClick={() => setPage(p as number)} className={`size-9 flex items-center justify-center rounded-xl text-sm font-bold border transition-all ${page !== p ? "hover:bg-secondary border-border" : ""}`} style={page === p ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD } : {}}>{p}</button>))}
                    <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="size-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Decline Modal */}
      <Dialog open={!!declineId} onOpenChange={(open) => !open && setDeclineId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Decline Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this meeting? You can provide an optional reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] bg-background"
            />
          </div>
          <DialogFooter>
            <button onClick={() => setDeclineId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={submitDecline} className="px-5 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm">Decline Meeting</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={!!rescheduleId} onOpenChange={(open) => !open && setRescheduleId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
            <DialogDescription>
              Propose a new date and time for this meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</label>
                <input type="date" min={new Date().toISOString().split("T")[0]} value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Time</label>
                <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Timezone</label>
              <select value={rescheduleTimezone} onChange={(e) => setRescheduleTimezone(e.target.value)} className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Note (Optional)</label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Let the team know why you need to reschedule..."
                className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setRescheduleId(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl border hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={submitReschedule} className="px-5 py-2.5 text-sm font-semibold bg-foreground text-background rounded-xl hover:opacity-90 shadow-sm transition-opacity">Send Request</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

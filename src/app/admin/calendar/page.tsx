"use client";

import { ChevronDown, ChevronLeft, ChevronRight, MapPin, Send, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 5; // meetings per page (2 groups × ~2-3 each visible)

const CLIENT_PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Alice Mercer — The Mercer Custom Build",
  "Tom Larsen — The Larsen Pool & Addition",
];

type MeetingType = "meet" | "on-site";

interface Meeting {
  id: number;
  month: string;
  day: number;
  dayName: string;
  title: string;
  location: string;
  time: string;
  attendee: string;
  attendeeAvatar: string;
  attendeeStatus: string;
  type: MeetingType;
  joinLink?: string;
}

const AVATAR = "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=32&backgroundColor=b6e3f4";

function makeMeeting(id: number, hasMeet: boolean): Meeting {
  return {
    id,
    month: "MAY 2025",
    day: 27,
    dayName: "TUE",
    title: "Henderson site walkthrough",
    location: "On-site Visit",
    time: "10:00 AM",
    attendee: "Bob Henderson",
    attendeeAvatar: AVATAR,
    attendeeStatus: "Confirmed",
    type: hasMeet ? "meet" : "on-site",
    joinLink: hasMeet ? "https://meet.google.com/abc-defg-hij" : undefined,
  };
}

// 32 meetings: alternating with/without Join Meet
const ALL_MEETINGS: Meeting[] = Array.from({ length: 32 }, (_, i) =>
  makeMeeting(i + 1, i % 2 === 1),
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageNumbers(page: number, totalPages: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return pages;
}

// Group consecutive meetings by month label
function groupByMonth(meetings: Meeting[]): { month: string; items: Meeting[] }[] {
  const groups: { month: string; items: Meeting[] }[] = [];
  for (const m of meetings) {
    const last = groups[groups.length - 1];
    if (last && last.month === m.month) {
      last.items.push(m);
    } else {
      groups.push({ month: m.month, items: [m] });
    }
  }
  return groups;
}

// ─── Meeting card ─────────────────────────────────────────────────────────────

function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Date block */}
      <div className="flex flex-col items-center w-10 shrink-0 pt-0.5">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          {meeting.dayName}
        </span>
        <span className="text-3xl font-bold leading-tight">{meeting.day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-snug">{meeting.title}</p>
          {/* Join Meet button — stacks above Edit */}
          {meeting.joinLink && (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <a
                href={meeting.joinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
                style={{ backgroundColor: GOLD }}
              >
                <Video size={11} />
                Join Meet
              </a>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-secondary transition-colors w-full text-center"
              >
                Edit
              </button>
            </div>
          )}
          {!meeting.joinLink && (
            <button
              type="button"
              className="shrink-0 px-3 py-1.5 rounded-lg border border-border text-[11px] font-semibold hover:bg-secondary transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin size={11} />
          <span className="text-xs">{meeting.location}</span>
          <span className="text-xs">&bull;</span>
          <span className="text-xs">{meeting.time}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full overflow-hidden bg-muted shrink-0">
            <Image
              src={meeting.attendeeAvatar}
              alt={meeting.attendee}
              width={24}
              height={24}
              className="object-cover"
              unoptimized
            />
          </div>
          <p className="text-xs">
            <span className="font-semibold">{meeting.attendee}</span>
            <span className="text-muted-foreground"> — {meeting.attendeeStatus}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [meetings, setMeetings] = useState(ALL_MEETINGS);
  const [page, setPage] = useState(1);

  // form
  const [meetTitle, setMeetTitle] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("meet");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [notify, setNotify] = useState(true);

  const totalPages = Math.ceil(meetings.length / PAGE_SIZE);
  const pageMeetings = meetings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const groups = groupByMonth(pageMeetings);

  function handleCreate() {
    if (!meetTitle.trim()) return;
    const newMeeting: Meeting = {
      id: Date.now(),
      month: "TODAY",
      day: new Date().getDate(),
      dayName: ["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date().getDay()],
      title: meetTitle,
      location: meetingType === "on-site" ? "On-site Visit" : "Google Meet",
      time: time || "--:-- --",
      attendee: "Bob Henderson",
      attendeeAvatar: AVATAR,
      attendeeStatus: "Pending",
      type: meetingType,
      joinLink: meetingType === "meet" ? (link || undefined) : undefined,
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    setMeetTitle("");
    setDate("");
    setTime("");
    setLink("");
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Calendar &amp; Meeting Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule meetings — invites sent via Google Calendar, Meet links auto-generated
          </p>
        </div>

        {/* Client / Project selector */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Client / Project
          </p>
          <div className="relative">
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            >
              {CLIENT_PROJECTS.map((cp) => (
                <option key={cp} value={cp}>{cp}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — Meeting list */}
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.month} className="rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    {group.month}
                  </p>
                </div>
                <div className="px-5">
                  {group.items.map((m) => (
                    <MeetingCard key={m.id} meeting={m} />
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meetings.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">{meetings.length}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>

                {pageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis separator
                      key={`ellipsis-${i}`}
                      className="px-1 text-xs text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p as number)}
                      className="size-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
                      style={
                        page === p
                          ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD }
                          : {}
                      }
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Schedule new meeting form */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Schedule New Meeting</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Meeting title */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Meeting Title
                </p>
                <input
                  type="text"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  placeholder="e.g., Cabinetry Finish"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Meeting type toggle */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Meeting Type
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingType("meet")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                    style={
                      meetingType === "meet"
                        ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` }
                        : {}
                    }
                  >
                    <Video size={14} />
                    Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeetingType("on-site")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                    style={
                      meetingType === "on-site"
                        ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` }
                        : {}
                    }
                  >
                    <MapPin size={14} />
                    On-site
                  </button>
                </div>
              </div>

              {/* Date + Time row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Date
                  </p>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="mm/dd/yyyy"
                    className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Time
                  </p>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="--:-- --"
                    className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

              {/* Meeting link */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Meeting Link
                </p>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Link"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Push notification toggle */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send push notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notify}
                  onClick={() => setNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ backgroundColor: notify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span
                    className="inline-block size-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: notify ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </button>
              </div>

              {/* Create button */}
              <button
                type="button"
                onClick={handleCreate}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                CREATE MEETING
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

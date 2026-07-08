"use client";

import { ChevronDown, ChevronLeft, ChevronRight, MapPin, Send, Video, Monitor, Loader2, CalendarClock } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getEchoInstance } from "@/lib/echo";
import { toast } from "sonner";
import { ProjectCombobox } from "@/components/shared/ProjectCombobox";

// --- Data & Types ------------------------------------------------------------

const GOLD = "#C49A3C";
const PAGE_SIZE = 5;

type MeetingType = "meet" | "on-site" | "online" | "zoom";

interface Project {
  id: number;
  name: string;
  client?: string;
  email?: string;
  clientAvatar?: string;
}

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
  attendeeEmail?: string;
  projectName?: string;
  attendeeStatus: string;
  status: string;
  type: MeetingType;
  joinLink?: string;
  createdAt: string;
  timezone?: string;
  rescheduleReason?: string;
  rescheduleProposedDate?: string;
  rescheduleProposedTimezone?: string;
  rawDate?: string;
  rawTime?: string;
  projectId?: number;
}

const AVATAR = "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=32&backgroundColor=b6e3f4";

const TZ_MAP: Record<string, string> = {
  "America/New_York": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  "America/Los_Angeles": "PT",
  "Europe/London": "GMT",
  "Europe/Paris": "CET"
};

// --- Helpers -----------------------------------------------------------------

function mapBackendMeeting(m: any): Meeting {
  const d = new Date(m.date);
  
  let attendeeStatus = "Unknown";
  if (m.status === "pending") attendeeStatus = "Pending Response";
  else if (m.status === "confirmed") attendeeStatus = "Confirmed";
  else if (m.status === "declined") attendeeStatus = "Declined";
  else if (m.status === "reschedule_requested") attendeeStatus = "Reschedule Requested";

  const clientName = m.project?.client?.name || "Project Client";
  const clientEmail = m.project?.client?.email || "";
  const clientAvatar = m.project?.client?.profile_photo_url || m.project?.client?.profile_photo_path 
    ? (m.project.client.profile_photo_url || m.project.client.profile_photo_path) 
    : `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(clientName)}&size=32&backgroundColor=b6e3f4`;
  const projectName = m.project?.name || "";

  const createdDate = new Date(m.created_at);
  const formattedCreated = `Scheduled on ${createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

  let rawDate = "";
  let rawTime = "";
  if (typeof m.date === "string") {
    const parts = m.date.split(" ");
    if (parts.length >= 2) {
      rawDate = parts[0];
      rawTime = parts[1].substring(0, 5);
    } else if (m.date.includes("T")) {
      const parts = m.date.split("T");
      rawDate = parts[0];
      rawTime = parts[1].substring(0, 5);
    }
  }

  return {
    id: m.id,
    month: d.toLocaleString("en-US", { month: "short", year: "numeric" }).toUpperCase(),
    day: d.getDate(),
    dayName: d.toLocaleString("en-US", { weekday: "short" }).toUpperCase(),
    title: m.title,
    location: m.location || (m.type === "meet" || m.type === "online" ? "Google Meet" : "On-site"),
    time: `${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${TZ_MAP[m.timezone || "America/New_York"] || "ET"}`,
    timezone: m.timezone || "America/New_York",
    attendee: clientName,
    attendeeAvatar: clientAvatar,
    attendeeEmail: clientEmail,
    projectName: projectName,
    attendeeStatus,
    status: m.status,
    type: (m.type === "online" ? "meet" : m.type) as MeetingType,
    joinLink: m.meeting_link,
    createdAt: formattedCreated,
    rescheduleReason: m.reschedule_reason,
    rescheduleProposedDate: m.reschedule_proposed_date,
    rescheduleProposedTimezone: m.reschedule_proposed_timezone,
    rawDate,
    rawTime,
    projectId: m.project_id,
  };
}

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

// --- Meeting card -------------------------------------------------------------

function MeetingCard({ meeting, onApproveReschedule, onDeclineReschedule, onProposeNewTime, onEdit }: { meeting: Meeting; onApproveReschedule: (id: number) => void; onDeclineReschedule: (id: number) => void; onProposeNewTime: (id: number, date: string, time: string, tz: string) => void; onEdit?: (m: Meeting) => void }) {
  const [proposing, setProposing] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newTimezone, setNewTimezone] = useState("America/New_York");
  
  const isReschedule = meeting.status === "reschedule_requested";
  
  let formattedProposedDate = "";
  if (isReschedule && meeting.rescheduleProposedDate) {
    const pd = new Date(meeting.rescheduleProposedDate);
    formattedProposedDate = `${pd.toLocaleDateString()} at ${pd.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${TZ_MAP[meeting.rescheduleProposedTimezone || ""] || ""}`;
  }

  return (
    <div className={`flex flex-col p-4 xl:p-3 gap-3 rounded-xl w-full border ${isReschedule ? "bg-orange-50/50 border-orange-200" : "bg-[#F8FAFB] border-transparent"}`}>
      <div className="flex flex-col xl:flex-row xl:items-center w-full">
        {/* Date Column */}
        <div className="flex flex-row xl:flex-col justify-start xl:justify-center items-end xl:items-center gap-3 xl:gap-0 pb-3 xl:pb-0 xl:pr-6 xl:w-[128px] border-b xl:border-b-0 xl:border-r border-[#C4C7C7] shrink-0 xl:h-[72px]">
          <span className="text-sm xl:text-base font-normal tracking-[1.6px] uppercase text-[#5D5F5F] mb-1 xl:mb-0">
            {meeting.dayName}
          </span>
          <span className="text-3xl xl:text-[40px] font-bold leading-none tracking-[-0.8px] text-[#1C1B1B]">
            {meeting.day}
          </span>
        </div>

        {/* Details Column */}
        <div className="flex flex-col items-start gap-1 flex-1 min-w-0 pt-3 xl:pt-0 xl:pl-3 w-full">
          <h4 className="text-[20px] font-medium leading-[28px] text-black line-clamp-2">
            {meeting.title}
          </h4>
          
          <div className="flex flex-col gap-1 mt-1 text-sm font-normal text-[#5D5F5F]">
            <div className="flex flex-row items-center gap-2">
              {meeting.projectName && (
                <>
                  <span className="font-medium text-black">{meeting.projectName}</span>
                  <span>&bull;</span>
                </>
              )}
              <MapPin size={14} className="shrink-0" />
              <span>{meeting.location} - {meeting.time}</span>
            </div>
            <div className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock size={12} className="shrink-0" />
              <span>{meeting.createdAt}</span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-3 mt-1">
            <div className="size-8 rounded-full overflow-hidden bg-[#F1EDEC] shrink-0">
              <Image
                src={meeting.attendeeAvatar}
                alt={meeting.attendee}
                width={32}
                height={32}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm leading-tight">
                <span className="font-medium text-[#1C1B1B]">{meeting.attendee}</span>
                <span className={`font-semibold ${meeting.status === 'declined' ? 'text-red-500' : isReschedule ? 'text-orange-500' : 'text-[#5D5F5F]'}`}> — {meeting.attendeeStatus}</span>
              </p>
              {meeting.attendeeEmail && (
                <p className="text-xs text-muted-foreground mt-0.5">{meeting.attendeeEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons Column */}
        <div className="flex flex-row xl:flex-col justify-start xl:justify-end items-center xl:items-end gap-2 shrink-0 xl:self-stretch xl:min-w-[117px] mt-4 xl:mt-0 xl:ml-4 w-full xl:w-auto">
          {meeting.joinLink && !isReschedule && (
            <a
              href={meeting.joinLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row justify-center items-center px-4 py-2 gap-1.5 h-[36px] bg-[#C5A059] text-white text-sm font-bold w-full xl:w-auto min-w-[117px] transition-opacity hover:opacity-90"
            >
              {meeting.type === "zoom" ? <Monitor size={14} /> : <Video size={14} />}
              {meeting.type === "zoom" ? "Join Zoom" : "Join Meet"}
            </a>
          )}
          {meeting.status === 'confirmed' && onEdit && (
            <button type="button" onClick={() => onEdit(meeting)} className="flex flex-col justify-center items-center px-4 py-2 h-[38px] border border-[#C4C7C7] text-[#1C1B1B] text-sm font-semibold w-full xl:w-auto min-w-[117px] bg-transparent hover:bg-black/5 transition-colors">Edit</button>
          )}
        </div>
      </div>
      
      {/* Reschedule Request Details */}
      {isReschedule && (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-orange-100 mt-1">
          <div className="flex gap-2 text-sm text-orange-800">
            <CalendarClock size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Client requested a new time</p>
              <p className="mt-0.5">Proposed: <span className="font-medium text-black">{formattedProposedDate}</span></p>
              {meeting.rescheduleReason && (
                <p className="mt-1 text-muted-foreground italic">"{meeting.rescheduleReason}"</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1 flex-wrap">
            <button onClick={() => onDeclineReschedule(meeting.id)} className="px-4 py-1.5 text-xs font-semibold rounded-md border text-red-600 border-red-200 hover:bg-red-50">Keep Original Time</button>
            <button onClick={() => setProposing(!proposing)} className="px-4 py-1.5 text-xs font-semibold rounded-md border text-orange-600 border-orange-200 hover:bg-orange-50">Propose Different Time</button>
            <button onClick={() => onApproveReschedule(meeting.id)} className="px-4 py-1.5 text-xs font-semibold rounded-md bg-orange-500 text-white hover:bg-orange-600">Approve New Time</button>
          </div>
          {proposing && (
            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-orange-100">
               <input type="date" min={new Date().toISOString().split("T")[0]} value={newDate} onChange={e => setNewDate(e.target.value)} className="border border-orange-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400" />
               <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="border border-orange-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400" />
               <select value={newTimezone} onChange={e => setNewTimezone(e.target.value)} className="border border-orange-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-orange-400">
                 <option value="America/New_York">ET</option>
                 <option value="America/Chicago">CT</option>
                 <option value="America/Denver">MT</option>
                 <option value="America/Los_Angeles">PT</option>
               </select>
               <button onClick={() => onProposeNewTime(meeting.id, newDate, newTime, newTimezone)} className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-gray-800">Send</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Page --------------------------------------------------------------------

export default function CalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientProjectId, setClientProjectId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("");
  const [formProjectId, setFormProjectId] = useState<string>("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form
  const [meetTitle, setMeetTitle] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("meet");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [link, setLink] = useState("");
  const [address, setAddress] = useState("");
  const [notify, setNotify] = useState(true);

  // Fetch projects
  useEffect(() => {
    apiFetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProjects(data.data);
          if (data.data.length > 0) {
            setFormProjectId(data.data[0].id.toString());
          }
        }
      });
  }, []);

  const fetchMeetings = () => {
    setLoading(true);
    let url = `/api/admin/meetings?page=${page}&per_page=${PAGE_SIZE}`;
    if (clientProjectId && clientProjectId !== "all") url += `&project_id=${clientProjectId}`;
    if (filterStatus !== "all") url += `&status=${filterStatus}`;
    if (filterType !== "all") url += `&type=${filterType}`;
    if (filterDate !== "all") url += `&date_filter=${filterDate}`;
    if (filterClient) url += `&client_name=${encodeURIComponent(filterClient)}`;
    
    apiFetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.data) {
          setMeetings(data.data.data.map(mapBackendMeeting));
          setTotalPages(data.data.last_page || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetings();
  }, [page, clientProjectId, filterStatus, filterType, filterDate, filterClient]);

  useEffect(() => {
    const echo = getEchoInstance();
    if (echo) {
      const channel = echo.channel("admin.meetings");
      channel.listen("MeetingCreated", () => {
        fetchMeetings();
      });
      channel.listen("MeetingUpdated", () => {
        fetchMeetings();
      });
      return () => {
        echo.leave("admin.meetings");
      };
    }
  }, [page, clientProjectId, filterStatus, filterType, filterDate, filterClient]);

  const handleApproveReschedule = async (id: number) => {
    try {
      const res = await apiFetch(`/api/admin/meetings/${id}/approve-reschedule`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve");
      toast.success("Reschedule approved");
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeclineReschedule = async (id: number) => {
    try {
      const res = await apiFetch(`/api/admin/meetings/${id}/decline-reschedule`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to decline");
      toast.success("Reschedule declined");
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleProposeNewTime = async (id: number, pDate: string, pTime: string, pTimezone: string) => {
    if (!pDate || !pTime) {
      toast.error("Please provide date and time.");
      return;
    }
    try {
      const res = await apiFetch(`/api/admin/meetings/${id}/propose-new-time`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: pDate, time: pTime, timezone: pTimezone })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to propose time");
      }
      toast.success("New time proposed to client");
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreate = async () => {
    if (!formProjectId) {
      toast.error("Please select a project.");
      return;
    }
    if (!date || !time) {
      toast.error("Please provide date and time.");
      return;
    }
    if ((meetingType === "meet" || meetingType === "zoom") && !link.trim()) {
      toast.error("Please provide a meeting link.");
      return;
    }
    if (meetingType === "on-site" && !address.trim()) {
      toast.error("Please provide an address for on-site meetings.");
      return;
    }
    
    setCreating(true);
    try {
      const payload = {
        project_id: parseInt(formProjectId),
        title: meetTitle || "Project Meeting",
        date: date,
        time: time,
        timezone: timezone,
        type: meetingType,
        meeting_link: (meetingType === "meet" || meetingType === "zoom") ? link : null,
        location: meetingType === "on-site" ? address : null,
        notify_client: notify,
      };

      let res;
      if (editingId) {
        res = await apiFetch(`/api/admin/meetings/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch("/api/admin/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save meeting");
      }

      toast.success(editingId ? "Meeting updated!" : "Meeting scheduled!");
      handleCancelEdit();
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };
  const _handleCreateOld = async () => {
    if (!formProjectId) {
      toast.error("Please select a project.");
      return;
    }
    if (!date || !time) {
      toast.error("Please provide date and time.");
      return;
    }
    if ((meetingType === "meet" || meetingType === "zoom") && !link.trim()) {
      toast.error("Please provide a meeting link.");
      return;
    }
    if (meetingType === "on-site" && !address.trim()) {
      toast.error("Please provide an address for on-site meetings.");
      return;
    }
    
    setCreating(true);
    try {
      const payload = {
        project_id: parseInt(formProjectId),
        title: meetTitle || "Project Meeting",
        date: date,
        time: time,
        timezone: timezone,
        type: meetingType,
        meeting_link: (meetingType === "meet" || meetingType === "zoom") ? link : null,
        location: meetingType === "on-site" ? address : null,
        notify_client: notify,
      };

      const res = await apiFetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create meeting");
      }

      toast.success("Meeting scheduled!");
      setMeetTitle("");
      setDate("");
      setTime("");
      setLink("");
      setAddress("");
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const groups = groupByMonth(meetings);

  const handleEditClick = (m: Meeting) => {
    setEditingId(m.id);
    setMeetTitle(m.title);
    setMeetingType(m.type);
    setDate(m.rawDate || "");
    setTime(m.rawTime || "");
    setTimezone(m.timezone || "America/New_York");
    setLink(m.joinLink || "");
    setAddress(m.location || "");
    if (m.projectId) {
      setFormProjectId(m.projectId.toString());
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setMeetTitle("");
    setDate("");
    setTime("");
    setLink("");
    setAddress("");
    if (projects.length > 0) {
      setFormProjectId(projects[0].id.toString());
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-4 px-4 md:px-10 py-6 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium tracking-tight">Calendar</h1>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="w-full flex-1 min-w-[160px] shrink-0">
            <ProjectCombobox
              projects={projects as any}
              value={clientProjectId}
              onChange={(val) => {
                setClientProjectId(val);
                setPage(1);
              }}
            />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="w-full flex-1 min-w-[160px] border border-border rounded-xl bg-background px-4 h-[56px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="declined">Declined</option>
            <option value="reschedule_requested">Reschedule Requested</option>
          </select>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="w-full flex-1 min-w-[160px] border border-border rounded-xl bg-background px-4 h-[56px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40">
            <option value="all">All Types</option>
            <option value="meet">Meet</option>
            <option value="zoom">Zoom</option>
            <option value="on-site">On-site</option>
          </select>
          <select value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(1); }} className="w-full flex-1 min-w-[160px] border border-border rounded-xl bg-background px-4 h-[56px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40">
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <input type="text" placeholder="Filter by Client Name..." value={filterClient} onChange={(e) => { setFilterClient(e.target.value); setPage(1); }} className="w-full flex-1 min-w-[160px] border border-border rounded-xl bg-background px-4 h-[56px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-10">
        <div className="flex flex-col xl:flex-row gap-8">
          
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : meetings.length === 0 ? (
              <div className="py-20 text-center text-sm text-muted-foreground">No meetings found.</div>
            ) : (
              <>
                {groups.map((group) => (
                  <div key={group.month} className="border border-[#C4C7C7]/50 rounded-[32px] p-6 bg-white flex flex-col gap-2">
                    <p className="text-base font-normal tracking-[1.6px] uppercase text-[#1C1B1B] ml-2 mb-2">
                      {group.month}
                    </p>
                    <div className="flex flex-col gap-3">
                      {group.items.map((m) => (
                        <MeetingCard 
                          key={m.id} 
                          meeting={m} 
                          onApproveReschedule={handleApproveReschedule}
                          onDeclineReschedule={handleDeclineReschedule}
                          onProposeNewTime={handleProposeNewTime}
                          onEdit={handleEditClick} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={13} /></button>
                      {pageNumbers(page, totalPages).map((p, i) => p === "..." ? (<span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">...</span>) : (<button key={p} type="button" onClick={() => setPage(p as number)} className="size-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors" style={page === p ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD } : {}}>{p}</button>))}
                      <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={13} /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full xl:w-[450px] 2xl:w-[577.5px] shrink-0 rounded-2xl border border-border overflow-hidden self-start">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">{editingId ? "Edit Meeting" : "Schedule New Meeting"}</p>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Select Project <span className="text-red-500">*</span></p>
                <div className="relative">
                  <ProjectCombobox
                    projects={projects as any}
                    value={formProjectId}
                    onChange={setFormProjectId}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Meeting Title</p>
                <input type="text" value={meetTitle} onChange={(e) => setMeetTitle(e.target.value)} placeholder="e.g., Cabinetry Finish" className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Meeting Type</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMeetingType("meet")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors" style={meetingType === "meet" ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` } : {}}><Video size={14} /> Meet</button>
                  <button type="button" onClick={() => setMeetingType("zoom")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors" style={meetingType === "zoom" ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` } : {}}><Monitor size={14} /> Zoom</button>
                  <button type="button" onClick={() => setMeetingType("on-site")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors" style={meetingType === "on-site" ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` } : {}}><MapPin size={14} /> On-site</button>
                </div>
              </div>
              {(meetingType === "meet" || meetingType === "zoom") && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{meetingType === "zoom" ? "Zoom Link" : "Meeting Link"} <span className="text-red-500">*</span></p>
                  <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder={meetingType === "zoom" ? "e.g., https://zoom.us/j/12345" : "e.g., https://meet.google.com/abc-defg-hij"} className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40" />
                </div>
              )}
              {meetingType === "on-site" && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Address <span className="text-red-500">*</span></p>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, New York, NY 10001" className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40" />
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Date</p>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Time</p>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Timezone</p>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Central European (CET)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send push notification?</p>
                <button type="button" role="switch" aria-checked={notify} onClick={() => setNotify((v) => !v)} className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" style={{ backgroundColor: notify ? "#1a1a1a" : "#e5e7eb" }}><span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: notify ? "translateX(22px)" : "translateX(2px)" }} /></button>
              </div>
              {editingId && <button type="button" onClick={handleCancelEdit} className="w-full mb-2 flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm font-bold tracking-wide hover:bg-black/5 transition-colors">CANCEL</button>}
              <button type="button" onClick={handleCreate} disabled={creating} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50">
                {creating ? <Loader2 className="animate-spin" size={16} /> : <>{editingId ? "UPDATE MEETING" : "CREATE MEETING"} <Send size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


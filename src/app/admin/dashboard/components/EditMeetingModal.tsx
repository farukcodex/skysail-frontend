import { X, Loader2, Video, Monitor, MapPin } from "lucide-react";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { ProjectCombobox } from "@/components/shared/ProjectCombobox";
import { apiFetch } from "@/lib/api";

interface Project {
  id: number;
  name: string;
}

interface EventData {
  id: number;
  project_id: number;
  title: string;
  type: "meet" | "on-site" | "online" | "zoom";
  location: string | null;
  meeting_link: string | null;
  timezone: string;
  rawDate: string | null;
  rawTime: string | null;
}

export function EditMeetingModal({ 
  event, 
  onClose, 
  onSuccess 
}: { 
  event: EventData, 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formProjectId, setFormProjectId] = useState<string>(event.project_id?.toString() || "");
  const [meetTitle, setMeetTitle] = useState(event.title || "");
  const [meetingType, setMeetingType] = useState<"meet" | "on-site" | "online" | "zoom">(event.type || "meet");
  const [date, setDate] = useState(event.rawDate || "");
  const [time, setTime] = useState(event.rawTime || "");
  const [timezone, setTimezone] = useState(event.timezone || "America/New_York");
  const [link, setLink] = useState(event.meeting_link || "");
  const [address, setAddress] = useState(event.location || "");
  const [pushNotify, setPushNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProjects(data.data);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjectId) {
      toast.error("Please select a project.");
      return;
    }
    if (!date || !time) {
      toast.error("Please provide date and time.");
      return;
    }
    if ((meetingType === "meet" || meetingType === "zoom" || meetingType === "online") && !link.trim()) {
      toast.error("Please provide a meeting link.");
      return;
    }
    if (meetingType === "on-site" && !address.trim()) {
      toast.error("Please provide an address for on-site meetings.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        project_id: parseInt(formProjectId),
        title: meetTitle || "Project Meeting",
        date: date,
        time: time,
        timezone: timezone,
        type: meetingType === "online" ? "meet" : meetingType,
        meeting_link: (meetingType === "meet" || meetingType === "zoom" || meetingType === "online") ? link : null,
        location: meetingType === "on-site" ? address : null,
        push_notify: pushNotify,
        email_notify: emailNotify,
      };

      const res = await apiFetch(`/api/admin/meetings/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update meeting");
      }

      toast.success("Meeting updated!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const GOLD = "#C49A3C";

  return (
    <ModalShell id="edit-meeting-title" title="Edit Meeting" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
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
            <button type="button" onClick={() => setMeetingType("meet")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors" style={meetingType === "meet" || meetingType === "online" ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` } : {}}><Video size={14} /> Meet</button>
            <button type="button" onClick={() => setMeetingType("zoom")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors" style={meetingType === "zoom" ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` } : {}}><Monitor size={14} /> Zoom</button>
            <button type="button" onClick={() => setMeetingType("on-site")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors" style={meetingType === "on-site" ? { borderColor: GOLD, color: GOLD, backgroundColor: `${GOLD}11` } : {}}><MapPin size={14} /> On-site</button>
          </div>
        </div>
        {(meetingType === "meet" || meetingType === "zoom" || meetingType === "online") && (
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
        <div className="flex flex-col gap-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Send push notification?</p>
            <button
              type="button"
              role="switch"
              aria-checked={pushNotify}
              onClick={() => setPushNotify((v) => !v)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: pushNotify ? "#1a1a1a" : "#e5e7eb" }}
            >
              <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: pushNotify ? "translateX(22px)" : "translateX(2px)" }} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Send email notification?</p>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotify}
              onClick={() => setEmailNotify((v) => !v)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: emailNotify ? "#1a1a1a" : "#e5e7eb" }}
            >
              <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: emailNotify ? "translateX(22px)" : "translateX(2px)" }} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
            <X size={14} /> Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Update Meeting
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

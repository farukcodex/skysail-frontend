"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ProjectCombobox } from "@/components/shared/ProjectCombobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DOC_FILTER_TABS = ["Pending", "Approved", "Rejected", "All"] as const;
type DocFilterTab = (typeof DOC_FILTER_TABS)[number];

const GOLD = "#C49A3C";
const PAGE_SIZE = 12; // Adjusted for grid layout

const VENDOR_ROLES = [
  { value: "vendor_designer", label: "Designer" },
  { value: "vendor_architect", label: "Architect" },
  { value: "vendor_builder", label: "Builder" },
  { value: "vendor_general", label: "General Vendor" },
];

// --- Types ---
interface VendorDoc {
  id: number;
  project_id: number;
  project_name: string;
  document_type: string;
  document_title: string;
  note_to_admin: string;
  document_path: string;
  document_url: string | null;
  status: "pending" | "approved" | "rejected";
  uploaded_by: number;
  uploader_name: string;
  uploader_role: string | null;
  uploader_avatar: string | null;
  file_size?: number | null;
  created_at: string;
}

interface MilestoneRow {
  id: number;
  project_id: number;
  project_name: string;
  phase: number;
  name: string;
  completion_percent: number;
  status: "complete" | "completed" | "in-progress" | "not-started" | "upcoming" | "pending_review";
  target_date: string | null;
  assignee_name: string;
  assigned_to: number | null;
  assignee_role: string | null;
  document_url?: string | null;
  document_title?: string | null;
}

interface Project {
  id: number;
  name: string;
  client: string;
  email?: string;
  clientAvatar?: string;
  vendors: Vendor[];
}

interface Vendor {
  id: number;
  name: string;
  avatar?: string;
}

interface DecisionRow {
  id: number;
  project_id: number;
  project_name: string;
  title: string;
  description: string | null;
  due_date: string | null;
  urgency: string;
  status: "pending" | "approved" | "rejected" | "client_approved" | "client_rejected";
  image_path: string | null;
  image_url: string | null;
  created_by: number;
  creator_name: string;
  creator_role: string | null;
  creator_avatar: string | null;
  created_at: string;
}

function MiniPdfIcon() {
  return (
    <div className="size-7 shrink-0 relative">
      <div className="absolute inset-0 bg-gray-100 dark:bg-muted rounded-sm border border-border" />
      <div
        className="absolute top-0 right-0 size-2 bg-background"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[6px] font-bold px-0.5 rounded-sm leading-tight py-px">
        PDF
      </div>
    </div>
  );
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return null;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// --- Components ---

function DocPreviewCard({ doc }: { doc: VendorDoc }) {
  // Format role name nicely
  const roleDisplay = doc.uploader_role 
    ? doc.uploader_role.replace("vendor_", "").charAt(0).toUpperCase() + doc.uploader_role.replace("vendor_", "").slice(1)
    : "Vendor";

  return (
    <div className="flex flex-col items-start p-6 gap-2.5 w-full bg-[#F8FAFB] dark:bg-card border border-border rounded-[24px]">
      {/* Top Header Row */}
      <div className="flex flex-row items-start gap-[15px] w-full">
        <a href={doc.document_url || "#"} target="_blank" rel="noreferrer" className="hover:opacity-75 transition-opacity shrink-0">
          <MiniPdfIcon />
        </a>
        <div className="flex flex-col items-start gap-1 w-full">
          <div className="flex flex-row justify-between items-center w-full">
            <a href={doc.document_url || "#"} target="_blank" rel="noreferrer" className="hover:underline">
              <h4 className="font-bold text-[16px] leading-[24px] text-black dark:text-white font-sans line-clamp-1">
                {doc.document_title || "Document"}
              </h4>
            </a>
            <span className="font-semibold text-[12px] leading-[16px] tracking-[0.6px] text-[#444748] dark:text-muted-foreground whitespace-nowrap">
              {formatBytes(doc.file_size) || doc.document_type || "PDF"}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 pb-2">
            {doc.status === "pending" ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span className="font-semibold text-[12px] leading-[16px] tracking-[-0.6px] uppercase text-[#D4AF37]">
                  PENDING REVIEW
                </span>
              </>
            ) : doc.status === "approved" ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#18B495]" />
                <span className="font-semibold text-[12px] leading-[16px] tracking-[-0.6px] uppercase text-[#18B495]">
                  APPROVED
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-[#970404]" />
                <span className="font-semibold text-[12px] leading-[16px] tracking-[-0.6px] uppercase text-[#970404]">
                  REJECTED
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Uploader Section */}
      <div className="flex flex-col items-start gap-[3px] w-full mt-1.5">
        <span className="font-normal text-[14px] leading-[24px] text-[#5D5F5F] font-sans">
          Uploaded by
        </span>
        <div className="flex flex-row items-center gap-[12px] w-full h-[50px]">
          <Avatar className="size-10 shrink-0 border border-[#C4C7C7]">
            <AvatarImage src={doc.uploader_avatar || undefined} alt={doc.uploader_name || "User"} />
            <AvatarFallback className="text-sm font-semibold bg-secondary text-foreground">
              {doc.uploader_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center items-start gap-1">
            <div className="flex flex-row items-center gap-1">
              <span className="font-bold text-[16px] leading-[22px] tracking-[0.2px] text-black dark:text-white font-sans truncate max-w-[200px]">
                {doc.uploader_name || "Unknown"}
              </span>
              <div className="w-1 h-1 rounded-full bg-[#C4C7C7] mx-1" />
            </div>
            <span className="font-normal text-[16px] leading-[24px] text-[#5D5F5F] font-sans">
              {roleDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Note Block */}
      <div className="flex flex-col items-start p-3 w-full bg-[#F7F3F2] dark:bg-secondary/30 border-l-[2px] border-[#C4C7C7] mt-2">
        <p className="font-normal italic text-[14px] leading-[20px] text-[#444748] dark:text-muted-foreground font-sans line-clamp-3">
          "{doc.note_to_admin || "No notes provided"}"
        </p>
      </div>

      {/* Actions */}
      {doc.status === "pending" && (
        <div className="flex flex-row items-start gap-[9px] w-full mt-3">
          <a
            href="/admin/documents"
            className="flex flex-row items-center justify-center py-[12px] px-[32px] gap-[8px] bg-foreground hover:bg-foreground/80 transition-colors rounded-[8px] text-background font-semibold text-[12px] leading-[16px] tracking-[1.2px] uppercase font-sans shadow-sm w-full"
          >
            REVIEW IN DOCUMENTS
          </a>
        </div>
      )}
    </div>
  );
}

function DecisionCard({ decision }: { decision: DecisionRow }) {
  const roleDisplay = decision.creator_role 
    ? decision.creator_role.replace("vendor_", "").charAt(0).toUpperCase() + decision.creator_role.replace("vendor_", "").slice(1)
    : "Vendor";

  return (
    <div className="flex flex-row items-start py-[17px] px-[26px] gap-[10px] w-full lg:w-[679px] bg-white dark:bg-card border border-[rgba(196,199,199,0.5)] rounded-[32px] overflow-hidden hover:border-[#C49A3C]/50 transition-colors group box-border">
      {/* Left Image block */}
      <div className="w-[264px] h-[198px] shrink-0 rounded-[23px] overflow-hidden relative bg-muted flex items-center justify-center flex-col">
        {decision.image_url ? (
          <img src={decision.image_url} alt={decision.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="text-muted-foreground font-medium">No Image</div>
        )}
      </div>

      {/* Right Content block */}
      <div className="flex flex-col items-start gap-[14px] w-[294px]">
        
        {/* Container for everything above buttons */}
        <div className="flex flex-col items-start pb-[24px] gap-[12px] w-full">
          {/* Status Bar */}
          <div className="flex flex-row justify-between items-center w-full h-[28px]">
            {decision.status === "pending" ? (
              <div className="flex flex-row items-center px-[12px] py-[6px] gap-[3.99px] bg-[#FFDAD6] rounded-[20px] h-[28px]">
                <div className="w-[11.82px] h-[10.21px] bg-[#93000A]" style={{ clipPath: "circle(50% at 50% 50%)" }} />
                <span className="text-[#93000A] font-inter font-semibold text-[12px] leading-[16px] tracking-[1.2px] uppercase">
                  PENDING REVIEW
                </span>
              </div>
            ) : decision.status === "approved" ? (
              <div className="flex flex-row items-center px-[12px] py-[6px] gap-[3.99px] bg-[#18B495]/20 rounded-[20px] h-[28px]">
                <div className="w-[11.82px] h-[10.21px] bg-[#18B495]" style={{ clipPath: "circle(50% at 50% 50%)" }} />
                <span className="text-[#18B495] font-inter font-semibold text-[12px] leading-[16px] tracking-[1.2px] uppercase">
                  WAITING FOR CLIENT
                </span>
              </div>
            ) : decision.status === "client_approved" ? (
              <div className="flex flex-row items-center px-[12px] py-[6px] gap-[3.99px] bg-[#18B495]/20 rounded-[20px] h-[28px]">
                <div className="w-[11.82px] h-[10.21px] bg-[#18B495]" style={{ clipPath: "circle(50% at 50% 50%)" }} />
                <span className="text-[#18B495] font-inter font-semibold text-[12px] leading-[16px] tracking-[1.2px] uppercase">
                  APPROVED BY CLIENT
                </span>
              </div>
            ) : decision.status === "client_rejected" ? (
              <div className="flex flex-row items-center px-[12px] py-[6px] gap-[3.99px] bg-[#970404]/20 rounded-[20px] h-[28px]">
                <div className="w-[11.82px] h-[10.21px] bg-[#970404]" style={{ clipPath: "circle(50% at 50% 50%)" }} />
                <span className="text-[#970404] font-inter font-semibold text-[12px] leading-[16px] tracking-[1.2px] uppercase">
                  REJECTED BY CLIENT
                </span>
              </div>
            ) : (
              <div className="flex flex-row items-center px-[12px] py-[6px] gap-[3.99px] bg-[#970404]/20 rounded-[20px] h-[28px]">
                <div className="w-[11.82px] h-[10.21px] bg-[#970404]" style={{ clipPath: "circle(50% at 50% 50%)" }} />
                <span className="text-[#970404] font-inter font-semibold text-[12px] leading-[16px] tracking-[1.2px] uppercase">
                  REJECTED BY ADMIN
                </span>
              </div>
            )}
          </div>

          {/* Title and details block */}
          <div className="flex flex-col items-start gap-[10px] w-full">
            <div className="flex flex-col items-start pt-[4px] w-full min-h-[68px]">
              <h3 className="font-['Plus_Jakarta_Sans'] font-medium text-[24px] leading-[32px] text-[#000000] dark:text-white line-clamp-2">
                {decision.title}
              </h3>
            </div>

            <div className="flex flex-col items-start gap-[3px] w-full">
              <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[24px] text-[#5D5F5F] flex items-center h-[24px]">
                Uploaded by
              </span>
              <div className="flex flex-row items-center gap-[12px] w-full h-[50px]">
                <Avatar className="size-10 shrink-0 border border-[#C4C7C7]">
                  <AvatarImage src={decision.creator_avatar || undefined} alt={decision.creator_name || "User"} />
                  <AvatarFallback className="text-sm font-semibold bg-secondary text-foreground">
                    {decision.creator_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start gap-[4px] flex-1 justify-center h-[50px]">
                  <span className="font-['Manrope'] font-bold text-[16px] leading-[22px] tracking-[0.2px] text-[#000000] dark:text-white truncate max-w-[200px] flex items-center h-[22px]">
                    {decision.creator_name || "Unknown"}
                  </span>
                  <span className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[24px] text-[#5D5F5F] flex items-center h-[24px]">
                    {roleDisplay}
                  </span>
                </div>
              </div>
            </div>
            
            {decision.description && (
              <div className="flex flex-col items-start w-full min-h-[52px]">
                <p className="font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[26px] text-[#5D5F5F] line-clamp-2">
                  {decision.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        {decision.status === "pending" && (
          <div className="flex flex-col items-start gap-[10px] w-[279.99px] h-[43px]">
            <div className="flex flex-row items-start gap-[9px] w-full h-[43px]">
              <a
                href="/admin/decisions"
                className="flex flex-row items-center justify-center px-[32px] py-[12px] gap-[7.99px] w-full h-[43px] bg-foreground rounded-[8px] hover:bg-foreground/80 transition-colors"
              >
                <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[12px] leading-[16px] text-center tracking-[1.2px] uppercase text-background">
                  REVIEW IN DECISIONS
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MilestoneTable({ milestones }: { milestones: MilestoneRow[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(milestones.length / PAGE_SIZE);
  const rows = milestones.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <p className="text-sm font-bold">
          Milestones status
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {[
                "Project",
                "Phase",
                "Phase Name",
                "Completion %",
                "Status",
                "Document",
                "Assigned vendor",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-5 py-4 font-medium whitespace-nowrap text-xs">
                  {m.project_name}
                </td>
                <td className="px-5 py-4 text-muted-foreground text-xs">
                  {String(m.phase).padStart(2, "0")}
                </td>
                <td className="px-5 py-4 font-semibold whitespace-nowrap text-xs">
                  <p>{m.name}</p>
                </td>
                <td className="px-5 py-4 font-bold text-xs">{m.completion_percent}%</td>
                <td className="px-5 py-4">
                  {m.status === "pending_review" ? (
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950/30 text-amber-600 text-[10px] font-bold whitespace-nowrap uppercase tracking-wider">
                      Pending
                    </span>
                  ) : m.status === "completed" ? (
                    <span className="px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-950/30 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-secondary text-muted-foreground text-[10px] font-bold whitespace-nowrap uppercase tracking-wider">
                      {m.status.replace("-", " ")}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {m.document_url ? (
                    <a href={m.document_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity" style={{ color: GOLD }}>
                      <MiniPdfIcon />
                      <span className="text-[10px] uppercase font-bold tracking-wider truncate max-w-[120px]" title={m.document_title || "Attached Document"}>
                        {m.document_title || "Document"}
                      </span>
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <p className="text-xs font-bold leading-tight">
                    {m.assignee_name || "Unassigned"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  {m.status === "pending_review" ? (
                    <div className="flex items-center gap-2">
                      <a
                        href="/admin/milestones"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[10px] font-bold hover:bg-foreground/80 transition-colors uppercase tracking-wider"
                      >
                        REVIEW MILESTONE
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No milestones found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, milestones.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {milestones.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorUploadPage() {
  const [activeDocTab, setActiveDocTab] = useState<DocFilterTab>("Pending");
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all");
  const [selectedVendorRole, setSelectedVendorRole] = useState<string>("all");
  
  const [documents, setDocuments] = useState<VendorDoc[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [decisions, setDecisions] = useState<DecisionRow[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [docPage, setDocPage] = useState(1);

  // Fetch Projects & Vendors to populate dropdowns
  useEffect(() => {
    apiFetch(`/api/admin/projects?all=1`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setProjects(data.data);
          
          // Extract unique vendors across all projects
          const allVendorsMap = new Map<number, Vendor>();
          data.data.forEach((p: Project) => {
            if (p.vendors) {
              p.vendors.forEach(v => {
                allVendorsMap.set(v.id, v);
              });
            }
          });
          setVendors(Array.from(allVendorsMap.values()));
        }
      })
      .catch(console.error);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [docsRes, msRes, decRes] = await Promise.all([
        apiFetch(`/api/admin/documents`),
        apiFetch(`/api/admin/milestones`),
        apiFetch(`/api/admin/decisions`)
      ]);
      const docsData = await docsRes.json();
      const msData = await msRes.json();
      const decData = await decRes.json();
      
      if (docsRes.ok) setDocuments(docsData.data || []);
      if (msRes.ok) setMilestones(msData.data || []);
      if (decRes.ok) setDecisions(decData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter Data
  const filteredDocs = documents.filter((d) => {
    // Filter by Tab
    if (activeDocTab !== "All" && d.status !== activeDocTab.toLowerCase()) return false;
    // Filter by Project
    if (selectedProjectId !== "all" && d.project_id !== selectedProjectId) return false;
    // Filter by Vendor Role
    if (selectedVendorRole !== "all" && d.uploader_role !== selectedVendorRole) return false;
    return true;
  });
  
  const filteredMilestones = milestones.filter((m) => {
    // Filter by Project
    if (selectedProjectId !== "all" && m.project_id !== selectedProjectId) return false;
    // Filter by Vendor Role
    if (selectedVendorRole !== "all" && m.assignee_role !== selectedVendorRole) return false;
    // Maybe default milestones to pending as well? 
    // The user didn't explicitly say for milestones, but usually "approvals hub" implies seeing pending first.
    // Let's just use the Project & Role filters.
    return true;
  });

  const filteredDecisions = decisions.filter((d) => {
    // If activeDocTab is not All, then we need to map our decision statuses to the doc tabs.
    // Doc tabs are: Pending, Approved, Rejected, All
    // For Admin: "Pending" means "pending" (vendor uploaded).
    // "Approved" could mean "approved" or "client_approved".
    // "Rejected" could mean "rejected" or "client_rejected".
    if (activeDocTab !== "All") {
      const tabLower = activeDocTab.toLowerCase();
      if (tabLower === "pending" && d.status !== "pending") return false;
      if (tabLower === "approved" && !["approved", "client_approved"].includes(d.status)) return false;
      if (tabLower === "rejected" && !["rejected", "client_rejected"].includes(d.status)) return false;
    }
    if (selectedProjectId !== "all" && d.project_id !== selectedProjectId) return false;
    if (selectedVendorRole !== "all" && d.creator_role !== selectedVendorRole) return false;
    return true;
  });

  const docTotalPages = Math.ceil(filteredDocs.length / PAGE_SIZE) || 1;
  const pageDocs = filteredDocs.slice(
    (docPage - 1) * PAGE_SIZE,
    docPage * PAGE_SIZE,
  );

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Approvals <span className="text-muted-foreground font-normal">Hub</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage vendor documents and milestones.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 w-full max-w-2xl z-10 relative">
          <div className="w-full sm:flex-1 min-w-[250px]">
            <ProjectCombobox
              label="Client / Project"
              projects={projects as any}
              value={selectedProjectId.toString()}
              onChange={(val) => {
                setSelectedProjectId(val === "all" ? "all" : parseInt(val));
                setDocPage(1);
              }}
            />
          </div>

          <div className="relative w-full sm:flex-1 min-w-[200px]">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5 block">
              Vendor Role
            </label>
            <select
              value={selectedVendorRole}
              onChange={(e) => {
                setSelectedVendorRole(e.target.value);
                setDocPage(1);
              }}
              className="w-full appearance-none bg-background border border-border rounded-xl px-4 min-h-[56px] h-auto py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            >
              <option value="all">All Vendor Roles</option>
              {VENDOR_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 bottom-[20px] text-muted-foreground pointer-events-none opacity-50" />
          </div>
        </div>

        {/* Doc filter tabs */}
        <div className="relative flex gap-0 border-b border-border mt-2 overflow-x-auto no-scrollbar">
          {DOC_FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveDocTab(tab);
                setDocPage(1);
              }}
              className="relative px-4 sm:px-6 py-3 text-sm font-semibold transition-colors z-10 whitespace-nowrap shrink-0"
              style={{
                color:
                  activeDocTab === tab
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {tab}
              {activeDocTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-all duration-300 origin-left"
                  style={{ backgroundColor: GOLD }}
                />
              )}
            </button>
          ))}
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Left Column: Documents */}
          <div className="flex flex-col w-full xl:w-[475px] shrink-0 gap-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">All Documents</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
            ) : pageDocs.length === 0 ? (
              <div className="border border-border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm font-medium">No documents found.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-5">
                  {pageDocs.map((doc) => (
                    <DocPreviewCard 
                      key={doc.id} 
                      doc={doc} 
                    />
                  ))}
                </div>

                {/* Doc pagination */}
                {filteredDocs.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {(docPage - 1) * PAGE_SIZE + 1}
                        –{Math.min(docPage * PAGE_SIZE, filteredDocs.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {filteredDocs.length}
                      </span>
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={docPage === 1}
                        onClick={() => setDocPage((p) => p - 1)}
                        className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from(
                        { length: Math.min(docTotalPages, 4) },
                        (_, i) => i + 1,
                      ).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setDocPage(p)}
                          className="size-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors"
                          style={
                            docPage === p
                              ? {
                                  backgroundColor: GOLD,
                                  color: "#fff",
                                  borderColor: GOLD,
                                }
                              : {}
                          }
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={docPage === docTotalPages}
                        onClick={() => setDocPage((p) => p + 1)}
                        className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Decisions */}
          <div className="flex flex-col flex-1 gap-4 overflow-hidden">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Decisions</h2>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
            ) : filteredDecisions.length === 0 ? (
              <div className="border border-border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground h-[355px]">
                <p className="text-sm font-medium">No pending decisions.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-[10px] w-full">
                {filteredDecisions.map((decision) => (
                  <DecisionCard 
                    key={decision.id}
                    decision={decision}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Milestones table */}
        <div className="mt-8">
          <MilestoneTable 
            milestones={filteredMilestones} 
          />
        </div>

      </div>
    </div>
  );
}

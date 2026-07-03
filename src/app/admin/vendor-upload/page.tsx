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

const DOC_FILTER_TABS = ["Pending", "Approved", "Rejected", "All"] as const;
type DocFilterTab = (typeof DOC_FILTER_TABS)[number];

const GOLD = "#C49A3C";
const PAGE_SIZE = 12; // Adjusted for grid layout

// --- Types ---
interface VendorDoc {
  id: number;
  project_id: number;
  project_name: string;
  document_type: string;
  document_title: string;
  note_to_admin: string;
  document_path: string;
  status: "pending" | "approved" | "rejected";
  uploaded_by: number;
  uploader_name: string;
  uploader_avatar: string | null;
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
}

interface Project {
  id: number;
  name: string;
  vendors: Vendor[];
}

interface Vendor {
  id: number;
  name: string;
  avatar?: string;
}

// --- Components ---

function DocPreviewCard({ doc, onApprove, onReject }: { doc: VendorDoc, onApprove: (id: number) => void, onReject: (id: number) => void }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden flex flex-col bg-card hover:border-[#C49A3C]/50 transition-colors group">
      {doc.status === "pending" && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30 px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">
              Pending Review
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase">{doc.project_name}</span>
        </div>
      )}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-background">
          {doc.document_path.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
            <img src={`http://localhost:8000/storage/${doc.document_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={doc.document_title} />
          ) : (
            <div className="w-full h-full bg-[url('https://placehold.co/400x300/cccccc/999999?text=DOC')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500" />
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-sm font-bold leading-snug line-clamp-1" title={doc.document_title}>
            {doc.document_title}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground border border-border rounded-md px-1.5 py-0.5">
              {doc.document_type}
            </span>
            {doc.status !== "pending" && (
              <span className={`text-[10px] font-bold uppercase tracking-wider ${doc.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                {doc.status}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full overflow-hidden bg-muted shrink-0">
              <Image
                src={doc.uploader_avatar || `https://api.dicebear.com/9.x/avataaars/png?seed=${doc.uploader_name}&size=28&backgroundColor=b6e3f4`}
                alt={doc.uploader_name || "User"}
                width={28}
                height={28}
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight truncate">
                {doc.uploader_name || "Unknown"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Vendor
              </p>
            </div>
            <a
              href={`http://localhost:8000/storage/${doc.document_path}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold bg-secondary hover:bg-secondary/70 text-foreground px-2 py-1 rounded transition-colors"
            >
              VIEW
            </a>
          </div>
        </div>

        {doc.status === "pending" && (
          <div className="flex gap-2 mt-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => onApprove(doc.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 text-white text-[11px] font-bold hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 size={12} />
              Approve
            </button>
            <button
              type="button"
              onClick={() => onReject(doc.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-red-500 text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <X size={12} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MilestoneTable({ milestones, onApprove, onReject }: { milestones: MilestoneRow[], onApprove: (id: number) => void, onReject: (id: number) => void }) {
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
                  {m.name}
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
                  <p className="text-xs font-bold leading-tight">
                    {m.assignee_name || "Unassigned"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  {m.status === "pending_review" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onApprove(m.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-[10px] font-bold hover:bg-green-700 transition-colors uppercase tracking-wider"
                      >
                        <CheckCircle2 size={12} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(m.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors uppercase tracking-wider"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
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
  const [selectedVendorId, setSelectedVendorId] = useState<number | "all">("all");
  
  const [documents, setDocuments] = useState<VendorDoc[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  
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
      const [docsRes, msRes] = await Promise.all([
        apiFetch(`/api/documents`),
        apiFetch(`/api/milestones`)
      ]);
      const docsData = await docsRes.json();
      const msData = await msRes.json();
      
      if (docsRes.ok) setDocuments(docsData.data || []);
      if (msRes.ok) setMilestones(msData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleApproveDoc = async (id: number) => {
    try {
      const res = await apiFetch(`/api/documents/${id}/approve`, { method: "POST" });
      if (res.ok) {
        toast.success("Document approved!");
        fetchData();
      } else {
        toast.error("Failed to approve document.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectDoc = async (id: number) => {
    try {
      const res = await apiFetch(`/api/documents/${id}/reject`, { method: "POST" });
      if (res.ok) {
        toast.success("Document rejected.");
        fetchData();
      } else {
        toast.error("Failed to reject document.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveMilestone = async (id: number) => {
    try {
      const res = await apiFetch(`/api/admin/milestones/${id}/approve`, { method: "POST" });
      if (res.ok) {
        toast.success("Milestone approved!");
        fetchData();
      } else {
        toast.error("Failed to approve milestone.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectMilestone = async (id: number) => {
    try {
      const res = await apiFetch(`/api/admin/milestones/${id}/reject`, { method: "POST" });
      if (res.ok) {
        toast.success("Milestone rejected.");
        fetchData();
      } else {
        toast.error("Failed to reject milestone.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Data
  const filteredDocs = documents.filter((d) => {
    // Filter by Tab
    if (activeDocTab !== "All" && d.status !== activeDocTab.toLowerCase()) return false;
    // Filter by Project
    if (selectedProjectId !== "all" && d.project_id !== selectedProjectId) return false;
    // Filter by Vendor
    if (selectedVendorId !== "all" && d.uploaded_by !== selectedVendorId) return false;
    return true;
  });
  
  const filteredMilestones = milestones.filter((m) => {
    // Filter by Project
    if (selectedProjectId !== "all" && m.project_id !== selectedProjectId) return false;
    // Filter by Vendor
    if (selectedVendorId !== "all" && m.assigned_to !== selectedVendorId) return false;
    // Maybe default milestones to pending as well? 
    // The user didn't explicitly say for milestones, but usually "approvals hub" implies seeing pending first.
    // Let's just use the Project & Vendor filters.
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
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Approvals <span className="text-muted-foreground font-normal">Hub</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Review and manage vendor documents and milestones.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary/40 border border-border rounded-xl px-3 py-1.5">
              <Filter size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters</span>
            </div>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value === "all" ? "all" : parseInt(e.target.value));
                  setDocPage(1);
                }}
                className="appearance-none bg-background border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition min-w-[160px]"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedVendorId}
                onChange={(e) => {
                  setSelectedVendorId(e.target.value === "all" ? "all" : parseInt(e.target.value));
                  setDocPage(1);
                }}
                className="appearance-none bg-background border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition min-w-[160px]"
              >
                <option value="all">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Doc filter tabs */}
        <div className="relative flex gap-0 border-b border-border mt-2">
          {DOC_FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveDocTab(tab);
                setDocPage(1);
              }}
              className="relative px-6 py-3 text-sm font-semibold transition-colors z-10"
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

        {/* Documents Grid */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
          ) : pageDocs.length === 0 ? (
            <div className="border border-border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground">
              <p className="text-sm font-medium">No documents found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pageDocs.map((doc) => (
                  <DocPreviewCard 
                    key={doc.id} 
                    doc={doc} 
                    onApprove={handleApproveDoc} 
                    onReject={handleRejectDoc} 
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

        {/* Milestones table */}
        <div className="mt-8">
          <MilestoneTable 
            milestones={filteredMilestones} 
            onApprove={handleApproveMilestone} 
            onReject={handleRejectMilestone} 
          />
        </div>

      </div>
    </div>
  );
}

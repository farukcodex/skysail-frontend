"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, FileText, ImagePlus, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

type DocStatus = "pending" | "approved" | "rejected";

interface VendorDoc {
  id: number;
  project_id: number;
  project_name: string;
  document_type: string;
  document_title: string;
  note_to_admin: string;
  document_path: string;
  status: DocStatus;
  uploaded_by: number;
  uploader_name: string;
  uploader_avatar: string | null;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
}

type FilterTab = "All" | "Pending" | "Approved";
const TABS: FilterTab[] = ["All", "Pending", "Approved"];

export default function VendorDocumentsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const [documents, setDocuments] = useState<VendorDoc[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState<string>("");
  const [docType, setDocType] = useState<string>("Contract");
  const [docTitle, setDocTitle] = useState<string>("");
  const [docNote, setDocNote] = useState<string>("");
  const [docFile, setDocFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const [docsRes, projRes] = await Promise.all([
        apiFetch("/api/documents"),
        apiFetch("/api/projects?all=1")
      ]);
      
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.data || []);
      }
      
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.data || []);
        if (data.data && data.data.length > 0 && !projectId) {
          setProjectId(data.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data.");
    } finally {
      setIsLoadingDocs(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered =
    activeTab === "All"
      ? documents
      : documents.filter((d) =>
          activeTab === "Pending"
            ? d.status === "pending"
            : d.status === "approved",
        );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageDocs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab);
    setPage(1);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) return toast.error("Please select a project.");
    if (!docTitle) return toast.error("Please enter a document title.");
    if (!docFile) return toast.error("Please select a file to upload.");
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("document_type", docType);
    formData.append("document_title", docTitle);
    formData.append("document", docFile);
    if (docNote) formData.append("note", docNote);

    try {
      const res = await apiFetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Document uploaded successfully!");
        setDocTitle("");
        setDocNote("");
        setDocFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to upload document.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="font-bold">My </span>
          <span className="text-muted-foreground font-normal">Documents</span>
        </h1>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: document list */}
          <div className="rounded-2xl border border-border bg-background overflow-hidden flex flex-col min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className="relative px-5 py-3 text-sm font-semibold transition-colors flex-1"
                  style={{ color: activeTab === tab ? GOLD : "" }}
                >
                  {tab}
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 origin-left"
                    style={{
                      background: GOLD,
                      transform: activeTab === tab ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Doc list */}
            <div className="flex flex-col divide-y divide-border flex-1">
              {isLoadingDocs ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-muted-foreground" size={32} />
                </div>
              ) : pageDocs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <FileText size={48} className="opacity-20 mb-4" />
                  <p className="text-sm">No documents found.</p>
                </div>
              ) : (
                pageDocs.map((doc, i) => (
                  <div key={doc.id} className="px-5 py-4 flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 size-9 rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                      {doc.document_path.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                        <img src={`http://localhost:8000/storage/${doc.document_path}`} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <FileText size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate" title={doc.document_title}>
                          {doc.document_title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0 border border-border rounded-md px-1.5 py-0.5">
                          {doc.document_type}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{doc.project_name}</p>
                      
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-block size-1.5 rounded-full ${
                            doc.status === "pending"
                              ? "bg-amber-500"
                              : doc.status === "approved"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            doc.status === "pending"
                              ? "text-amber-600"
                              : doc.status === "approved"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {doc.status.replace("_", " ")}
                        </span>
                      </div>
                      {doc.note_to_admin && (
                        <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-2">
                          &ldquo;{doc.note_to_admin}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <a
                          href={`http://localhost:8000/storage/${doc.document_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold hover:opacity-60 transition-opacity"
                          style={{ color: GOLD }}
                        >
                          View File
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between mt-auto">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {filtered.length}
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  {pageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
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
                    ),
                  )}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: upload form */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background px-6 py-5 flex flex-col gap-5">
            <p className="text-sm font-semibold">Upload document</p>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="project-select"
                className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
              >
                Project
              </label>
              <select
                id="project-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
              >
                {projects.length === 0 && <option value="">No assigned projects</option>}
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Document type + title */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="doc-type"
                  className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  Document Type
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                >
                  <option>Contract</option>
                  <option>Plan</option>
                  <option>Report</option>
                  <option>Invoice</option>
                  <option>Design</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="doc-title"
                  className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
                >
                  Document Title
                </label>
                <input
                  id="doc-title"
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  placeholder="e.g. Q3 Invoice"
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="doc-note"
                className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
              >
                Note to Admin{" "}
                <span className="normal-case text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="doc-note"
                rows={3}
                value={docNote}
                onChange={(e) => setDocNote(e.target.value)}
                placeholder="Briefly explain context for approval..."
                className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition resize-none"
              />
            </div>

            {/* Dropzone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed px-4 py-8 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors ${docFile ? 'border-[#C49A3C] bg-[#C49A3C]/5' : 'border-border hover:border-[#C49A3C]/50'}`}
            >
              <ImagePlus size={24} className={docFile ? 'text-[#C49A3C]' : 'text-muted-foreground'} />
              <p className="text-sm font-bold">
                {docFile ? docFile.name : "Click to choose file"}
              </p>
              {!docFile && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Allowed formats: PDF, DWG, JPG, PNG, DOCX
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Size limit: max 50MB
                  </p>
                </>
              )}
            </div>
            
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocFile(e.target.files[0]);
                }
              }}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !docFile || !docTitle || !projectId}
              className="w-full py-3.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "SUBMIT FOR REVIEW ▶"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  Upload,
  UploadCloud,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ProjectCombobox } from "@/components/shared/ProjectCombobox";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

const CATEGORIES = [
  "Plans & drawings",
  "Contracts",
  "Permits",
  "Invoices",
  "Photos",
  "Reports",
];

type DocStatus = "pending" | "approved" | "rejected";

interface Project {
  id: number;
  name: string;
  client: string;
  email?: string;
  clientAvatar?: string;
}

interface AdminDoc {
  id: number;
  project_id: number;
  project_name: string;
  document_type: string;
  document_title: string;
  note_to_admin: string;
  document_path: string;
  document_url: string | null;
  status: DocStatus;
  uploaded_by: number;
  uploader_name: string;
  uploader_avatar: string | null;
  created_at: string;
  file_size?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageNumbers(
  page: number,
  totalPages: number,
): (number | "...")[] {
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

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

// ─── PDF Icon ─────────────────────────────────────────────────────────────────

function PdfIcon({ ext }: { ext: string }) {
  const color = ext.match(/(jpg|jpeg|png|gif)/i) ? 'text-blue-500' : 'text-red-500';
  return (
    <div className="shrink-0 w-10 h-12 relative flex items-center justify-center">
      <div className="absolute inset-0 bg-muted rounded-md border border-border" />
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-t-background border-l-[10px] border-l-transparent" />
      <span className={`relative text-[9px] font-bold ${color} tracking-wide mt-2 uppercase`}>
        {ext.substring(0, 3)}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [client, setClient] = useState("");
  const [page, setPage] = useState(1);
  const [documents, setDocuments] = useState<AdminDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Upload Form State
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [notify, setNotify] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const [docsRes, projRes] = await Promise.all([
        apiFetch("/api/admin/documents"),
        apiFetch("/api/admin/projects?all=1")
      ]);
      
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.data || []);
      }
      
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.data || []);
        if (data.data && data.data.length > 0 && !client) {
          setClient(data.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data.");
    } finally {
      setIsLoadingDocs(false);
    }
  }, [client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter docs by project (or show all if client === "all")
  const filteredDocs = client === "all" 
    ? documents 
    : documents.filter(d => d.project_id.toString() === client);

  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE) || 1;
  const pageDocs = filteredDocs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleUpload = async () => {
    if (!client || client === "all") return toast.error("Please select a specific project to upload to.");
    if (!docName) return toast.error("Please enter a document name.");
    if (!docFile) return toast.error("Please select a file to upload.");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("project_id", client);
    formData.append("document_type", category);
    formData.append("document_title", docName);
    formData.append("document", docFile);

    try {
      const res = await apiFetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Document uploaded successfully!");
        setDocName("");
        setDocFile(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchData(); // Refresh the list
      } else {
        const data = await res.json();
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during upload");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await apiFetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Document deleted");
        fetchData();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleStatusUpdate = async (id: number, status: "approve" | "reject") => {
    try {
      const res = await apiFetch(`/api/admin/documents/${id}/${status}`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success(`Document ${status}d`);
        fetchData();
      } else {
        toast.error(`Failed to ${status} document`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Document management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and organise files
          </p>
        </div>

        {/* Client / Project selector */}
        <div className="w-full max-w-sm z-10 relative">
          <ProjectCombobox
            label="Client / Project"
            projects={projects as any}
            value={client}
            onChange={(val) => {
              setClient(val);
              setPage(1);
            }}
          />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — Document list */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-sm font-semibold">All documents</p>
            </div>

            <div className="flex flex-col divide-y divide-border flex-1">
              {isLoadingDocs ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-muted-foreground" size={32} />
                </div>
              ) : pageDocs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <p className="text-sm">No documents found.</p>
                </div>
              ) : (
                pageDocs.map((doc) => {
                  const ext = doc.document_path ? doc.document_path.split('.').pop() || "UNK" : "UNK";
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                    >
                      <PdfIcon ext={ext} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{doc.document_title}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                            doc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold tracking-wider mt-0.5">
                          <span style={{ color: GOLD }}>{doc.document_type}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            &bull; {doc.file_size ? formatBytes(doc.file_size) : "Unknown size"} &bull; {formatDate(doc.created_at)}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Uploaded by: {doc.uploader_name} &bull; Project: {doc.project_name}
                        </p>
                        {doc.note_to_admin && (
                          <div className="mt-2 p-2 bg-amber-50/80 border border-amber-100 rounded-lg text-xs text-amber-900">
                            <strong>Note:</strong> {doc.note_to_admin}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {doc.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(doc.id, 'approve')}
                              aria-label="Approve"
                              className="size-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-500 transition-colors"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(doc.id, 'reject')}
                              aria-label="Reject"
                              className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
                        <a
                          href={doc.document_url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Download document"
                          className="size-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Upload size={15} className="rotate-180" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          aria-label="Delete document"
                          className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {filteredDocs.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-border mt-auto">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filteredDocs.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {filteredDocs.length}
                  </span>
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
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Upload form */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Upload document</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {client === "all" && (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-200">
                  Please select a specific project from the dropdown above to upload a document.
                </div>
              )}

              {/* Category selection */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Category Selection
                </p>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={client === "all"}
                    className="w-full appearance-none bg-transparent border-b border-border pb-3 pr-8 text-sm font-medium focus:outline-none disabled:opacity-50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-1 top-1/2 -translate-y-3/4 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              {/* Document name */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Document Name
                </p>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  disabled={client === "all"}
                  placeholder="e.g. Approved Floor Plan"
                  className="w-full bg-transparent border-b border-border pb-3 text-sm focus:outline-none placeholder:text-muted-foreground/40 disabled:opacity-50"
                />
              </div>


              {/* Drag-and-drop zone */}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                disabled={client === "all"}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocFile(e.target.files[0]);
                  }
                }}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              <button
                type="button"
                disabled={client === "all"}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (client !== "all") setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (client !== "all" && e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setDocFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 py-10 transition-colors ${docFile ? 'border-[#C49A3C] bg-[#C49A3C]/5' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  borderColor: dragging && client !== "all" ? GOLD : undefined,
                  backgroundColor: dragging && client !== "all" ? `${GOLD}11` : undefined,
                }}
              >
                <UploadCloud
                  size={28}
                  className={docFile ? 'text-[#C49A3C]' : 'text-muted-foreground'}
                  style={{ color: dragging && client !== "all" ? GOLD : undefined }}
                />
                <p className="text-sm font-semibold">
                  {docFile ? docFile.name : "Drag-and-drop file upload zone"}
                </p>
                {!docFile && (
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Maximum file size 50MB
                  </p>
                )}
              </button>

              {/* Push notification toggle */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send push notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notify}
                  disabled={client === "all"}
                  onClick={() => setNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                  style={{ backgroundColor: notify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span
                    className="inline-block size-5 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: notify
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>

              {/* Upload button */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={isSubmitting || client === "all"}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "UPLOAD DOCUMENT"}
                {!isSubmitting && <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

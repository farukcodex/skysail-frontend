"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Download, UploadCloud, Loader2, Send, ChevronDown } from "lucide-react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

const CATEGORIES = [
  "Plans & drawings",
  "Contracts",
  "Permits",
  "Invoices",
  "Photos",
  "Reports",
  "Other"
];

interface Project {
  id: number;
  name: string;
}

interface ClientDoc {
  id: number;
  project_id: number;
  project_name: string;
  document_type: string;
  document_title: string;
  note_to_admin: string;
  document_path: string;
  document_url: string | null;
  status: string;
  uploaded_by: number;
  uploader_name: string;
  uploader_role: string | null;
  uploader_avatar: string | null;
  created_at: string;
  file_size?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function PdfIcon({ ext }: { ext: string }) {
  const color = ext.match(/(jpg|jpeg|png|gif)/i) ? 'bg-blue-500' : 'bg-red-500';
  return (
    <div className="size-9 shrink-0 relative">
      <div className="absolute inset-0 bg-gray-100 dark:bg-muted rounded-sm border border-border" />
      <div
        className="absolute top-0 right-0 size-3 bg-background"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 ${color} text-white text-[7px] font-bold px-1 rounded-sm leading-tight py-px uppercase`}>
        {ext.substring(0, 3)}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientProject, setClientProject] = useState("");
  const [documents, setDocuments] = useState<ClientDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Upload Form State
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [docName, setDocName] = useState("");
  const [docNote, setDocNote] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      // In client view, they fetch from their specific project scope
      // Admin/Project routes might be different, let's fetch client's projects if they exist.
      // We can use the documents endpoint to get documents, but for the dropdown we might need a general projects endpoint.
      // Let's assume the user has access to /api/projects via shared middleware.
      const [docsRes, projRes] = await Promise.all([
        apiFetch("/api/client/documents"),
        apiFetch("/api/client/projects")
      ]);
      
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.data || []);
      }
      
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.data || []);
        if (data.data && data.data.length > 0 && !clientProject) {
          setClientProject(data.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data.");
    } finally {
      setIsLoadingDocs(false);
    }
  }, [clientProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter docs by project (or show all if client === "all")
  const filteredDocs = clientProject === "all" || !clientProject
    ? documents 
    : documents.filter(d => d.project_id.toString() === clientProject);

  // Group by document type
  const docGroups = CATEGORIES.map(cat => ({
    label: cat,
    files: filteredDocs.filter(d => d.document_type === cat)
  })).filter(g => g.files.length > 0);

  const handleUpload = async () => {
    if (!clientProject || clientProject === "all") return toast.error("Please select a specific project to upload to.");
    if (!docName) return toast.error("Please enter a document name.");
    if (!docFile) return toast.error("Please select a file to upload.");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("project_id", clientProject);
    formData.append("document_type", category);
    formData.append("document_title", docName);
    formData.append("document", docFile);
    if (docNote) formData.append("note", docNote);

    try {
      const res = await apiFetch("/api/client/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Document uploaded successfully!");
        setDocName("");
        setDocNote("");
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

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Documents &amp; files
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Contracts, plans, reports, and presentations
            </p>
          </div>

          <div className="flex flex-col gap-1.5 w-full max-w-[250px]">
            <div className="relative">
              <select
                value={clientProject}
                onChange={(e) => setClientProject(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
              >
                <option value="all">All Projects</option>
                {projects.map((cp) => (
                  <option key={cp.id} value={cp.id.toString()}>
                    {cp.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Two-column grid layout like admin page */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
          
          {/* LEFT — Document Groups */}
          <div className="flex flex-col gap-4">
            {isLoadingDocs ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
              </div>
            ) : docGroups.length === 0 ? (
              <div className="flex justify-center items-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-border">
                No documents found for this project.
              </div>
            ) : (
              docGroups.map((group) => (
                <Card key={group.label} className="rounded-2xl">
                  <CardContent className="pt-4 pb-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {group.label}
                    </p>
                    {group.files.map((file) => {
                      const ext = file.document_path ? file.document_path.split('.').pop() || "UNK" : "UNK";
                      const avatarSrc = file.uploader_avatar 
                        ? (file.uploader_avatar.startsWith('http') ? file.uploader_avatar : `/storage/${file.uploader_avatar}`)
                        : `https://api.dicebear.com/9.x/avataaars/png?seed=${file.uploader_name || 'U'}&size=40&backgroundColor=d1d4f9`;
                      
                      return (
                        <div key={file.id} className="flex items-center gap-3 py-4 border-b border-border last:border-0">
                          <PdfIcon ext={ext} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.document_title}&nbsp;&nbsp;
                              <span className="text-muted-foreground font-normal">
                                {file.file_size ? formatBytes(file.file_size) : "Unknown size"}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 mb-1.5">Uploaded by</p>
                            <div className="flex items-center gap-2">
                              <div className="size-8 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                                <Image
                                  src={avatarSrc}
                                  alt={file.uploader_name || "Uploader"}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                  unoptimized
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold leading-tight">{file.uploader_name || "Unknown User"}</p>
                                <p className="text-xs text-muted-foreground">{file.uploader_role || "User"}</p>
                              </div>
                            </div>
                          </div>
                          <a
                            href={file.document_url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#C49A3C] hover:opacity-70 transition-opacity p-1 shrink-0 self-start mt-1"
                            aria-label="Download"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* RIGHT — Upload form */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col bg-card">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Upload document</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {(!clientProject || clientProject === "all") && (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-200">
                  Please select a specific project from the dropdown to upload a document.
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Category
                </p>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!clientProject || clientProject === "all"}
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

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Document Title
                </p>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  disabled={!clientProject || clientProject === "all"}
                  placeholder="e.g. Site Photos"
                  className="w-full bg-transparent border-b border-border pb-3 text-sm focus:outline-none placeholder:text-muted-foreground/40 disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Notes
                </p>
                <input
                  type="text"
                  value={docNote}
                  onChange={(e) => setDocNote(e.target.value)}
                  disabled={!clientProject || clientProject === "all"}
                  placeholder="Any additional information..."
                  className="w-full bg-transparent border-b border-border pb-3 text-sm focus:outline-none placeholder:text-muted-foreground/40 disabled:opacity-50"
                />
              </div>

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                disabled={!clientProject || clientProject === "all"}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocFile(e.target.files[0]);
                  }
                }}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              <button
                type="button"
                disabled={!clientProject || clientProject === "all"}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (clientProject && clientProject !== "all") setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (clientProject && clientProject !== "all" && e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setDocFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 py-10 transition-colors ${docFile ? 'border-[#C49A3C] bg-[#C49A3C]/5' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  borderColor: dragging && clientProject !== "all" ? GOLD : undefined,
                  backgroundColor: dragging && clientProject !== "all" ? `${GOLD}11` : undefined,
                }}
              >
                <UploadCloud
                  size={28}
                  className={docFile ? 'text-[#C49A3C]' : 'text-muted-foreground'}
                  style={{ color: dragging && clientProject !== "all" ? GOLD : undefined }}
                />
                <p className="text-sm font-semibold">
                  {docFile ? docFile.name : "Drag-and-drop file upload zone"}
                </p>
                {!docFile && (
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Max 50MB (PDF, DOC, JPG, PNG)
                  </p>
                )}
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isSubmitting || !clientProject || clientProject === "all"}
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

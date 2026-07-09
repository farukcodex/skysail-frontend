"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Loader2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";


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

  // Group by document type dynamically based on available documents
  const uniqueTypes = Array.from(new Set(filteredDocs.map(d => d.document_type)));
  const docGroups = uniqueTypes
    .map(cat => ({
      label: cat || "Uncategorized",
      files: filteredDocs.filter(d => d.document_type === cat)
    }))
    .filter(g => g.files.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));

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

        {/* Documents List */}
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
                    const avatarSrc = file.uploader_avatar || `https://api.dicebear.com/9.x/avataaars/png?seed=${file.uploader_name || 'U'}&size=40&backgroundColor=d1d4f9`;
                    
                    return (
                      <div key={file.id} className="flex items-center gap-3 py-4 border-b border-border last:border-0">
                        <PdfIcon ext={ext} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium truncate">
                              {file.document_title}&nbsp;&nbsp;
                              <span className="text-muted-foreground font-normal">
                                {file.file_size ? formatBytes(file.file_size) : "Unknown size"}
                              </span>
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              Project: {file.project_name} &bull; {new Date(file.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
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
      </div>
    </div>
  );
}

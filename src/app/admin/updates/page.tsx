"use client";

import { Camera, ChevronDown, Edit2, Send, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Editor } from "primereact/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ProjectCombobox, ProjectFilterCombobox } from "./ProjectCombobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

const UPDATE_TYPES = [
  "Video update",
  "Photo update",
  "Framing photos",
  "Status update",
  "Milestone update",
];

interface Project {
  id: number;
  name: string;
  client: string;
  email: string;
  clientAvatar: string;
}

interface Post {
  id: number;
  update_type: string;
  title: string;
  description: string;
  images: string[] | null;
  video_path: string | null;
  created_at: string;
  project_id: number;
  author?: {
    name: string;
  };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  item,
  onClose,
  onSave,
}: {
  item: Post;
  onClose: () => void;
  onSave: () => void;
}) {
  const [updateType, setUpdateType] = useState(item.update_type || UPDATE_TYPES[0]);
  const [title, setTitle] = useState(item.title || "");
  const [body, setBody] = useState(item.description || "");
  const [existingImages, setExistingImages] = useState<string[]>(item.images || []);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (updateType === "Video update") {
        setMediaFiles([newFiles[0]]); // only one video allowed
      } else {
        setMediaFiles((prev) => [...prev, ...newFiles]);
      }
    }
  };

  const removeNewFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("title", title);
    formData.append("description", body);
    formData.append("update_type", updateType);

    // Existing images
    existingImages.forEach((img) => {
      formData.append("existing_images[]", img);
    });

    // New files
    mediaFiles.forEach((file) => {
      formData.append("media[]", file);
    });

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
      
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${baseUrl}/api/admin/posts/${item.id}`, true);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.setRequestHeader("Accept", "application/json");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.message || data.error || "Failed to update"));
            } catch (err) {
              reject(new Error("Failed to update"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      toast.success("Update saved successfully");
      onSave(); // Trigger refresh
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="bg-background w-full sm:max-w-lg sm:rounded-3xl shadow-2xl relative z-10 max-h-[95dvh] overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 id="edit-modal-title" className="text-lg font-bold">
            Edit Update
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Update Type
            </p>
            <Select value={updateType} onValueChange={(v) => { setUpdateType(v); setMediaFiles([]); setExistingImages(item.images || []); }}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/30 border-none font-medium">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {UPDATE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Title
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Foundation poured..."
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40"
            />
          </div>

          {updateType !== "Video update" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Description (Optional)
              </p>
              <div className="border border-border rounded-xl overflow-hidden [&_.p-editor-toolbar]:border-none [&_.p-editor-toolbar]:bg-secondary/20 [&_.p-editor-content]:border-none [&_.p-editor-content]:bg-background">
                <Editor
                  value={body}
                  onTextChange={(e) => setBody(e.htmlValue || "")}
                  style={{ height: "120px" }}
                />
              </div>
            </div>
          )}

          {/* Media Edit Section */}
          {updateType !== "Status update" && updateType !== "Milestone update" && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Media
              </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {/* Existing Images */}
              {updateType !== "Video update" && existingImages.map((src, i) => (
                <div key={`existing-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border">
                  <Image src={src} alt="existing" fill className="object-cover" unoptimized />
                  <button onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 size-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {/* Existing Video */}
              {updateType === "Video update" && item.video_path && mediaFiles.length === 0 && (
                <div className="relative w-32 h-20 rounded-lg bg-black flex items-center justify-center shrink-0 border border-border">
                  <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
                     <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[10px] text-white p-1 truncate">Current Video</div>
                </div>
              )}

              {/* New Media */}
              {mediaFiles.map((f, i) => (
                <div key={`new-${i}`} className="relative w-20 h-20 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border p-1">
                  <p className="text-[8px] text-center break-words line-clamp-3">{f.name}</p>
                  <button onClick={() => removeNewFile(i)} className="absolute top-1 right-1 size-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/30 transition-colors shrink-0"
              >
                <Camera size={20} />
                <span className="text-[10px] mt-1 font-medium">Add</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                multiple={updateType !== "Video update"}
                accept={updateType === "Video update" ? "video/*" : "image/*"}
                onChange={handleFileChange}
              />
            </div>
          </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="relative z-10 flex items-center gap-2">
                SAVING... {uploadProgress > 0 && `${uploadProgress}%`}
              </span>
            ) : (
              <span className="relative z-10 flex items-center gap-2">
                SAVE CHANGES
              </span>
            )}
            {isSubmitting && uploadProgress > 0 && (
              <div
                className="absolute inset-y-0 left-0 bg-[#C49A3C] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Feed Items ───────────────────────────────────────────────────────────────

function MediaFeedItem({
  item,
  project,
}: {
  item: Post;
  project?: Project;
}) {
  const isVideo = !!item.video_path;
  const thumb = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
      {/* Thumbnail */}
      <div className="shrink-0 w-[88px] h-[72px] rounded-lg overflow-hidden bg-muted relative">
        {isVideo ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-0.5" />
            </div>
          </div>
        ) : (
          thumb && (
            <Image
              src={thumb}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized
            />
          )
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold leading-snug line-clamp-1">
          {item.title}
        </p>
        {project && (
          <div className="flex items-center gap-2 mb-1 mt-0.5">
            <Avatar className="size-6 shrink-0 border border-border">
              <AvatarImage src={project.clientAvatar} alt={project.client} />
              <AvatarFallback className="text-[10px]">
                {project.client?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-[11px] font-bold tracking-wide text-foreground leading-none">
                {project.client}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                {project.name} • {project.email}
              </p>
            </div>
          </div>
        )}
        {item.description && (
          <div
            className="text-xs text-muted-foreground leading-relaxed line-clamp-2 [&>p]:inline"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}
      </div>
    </div>
  );
}

function StatusFeedItem({ item, project }: { item: Post; project?: Project }) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-3 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-base">📅</span>
        <div className="flex flex-col">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            {item.update_type}
          </p>
          {project && (
            <div className="flex items-center gap-1.5 mt-1">
              <Avatar className="size-5 shrink-0 border border-border">
                <AvatarImage src={project.clientAvatar} alt={project.client} />
                <AvatarFallback className="text-[8px]">
                  {project.client?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-foreground leading-none">
                  {project.client}
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                  {project.name} • {project.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm font-bold mt-1">{item.title}</p>
      {item.description && (
        <div
          className="text-xs text-muted-foreground leading-relaxed [&>p]:m-0"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PostUpdatesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [client, setClient] = useState<string>("");
  const [updateType, setUpdateType] = useState(UPDATE_TYPES[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notify, setNotify] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [activeTab, setActiveTab] = useState<"manage" | "publish">("publish");
  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [editItem, setEditItem] = useState<Post | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== searchQuery) {
        setSearch(searchQuery);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, search]);

  useEffect(() => {
    fetchPosts();
  }, [page, search, filterProject]);

  const fetchProjects = async () => {
    try {
      const res = await apiFetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || data);
      }
    } catch(e) {}
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/admin/posts?page=${page}&search=${search}&per_page=10&project_id=${filterProject}`);
      if (res.ok) {
        const postsData = await res.json();
        setPosts(postsData.data || postsData);
        if (postsData.current_page) {
          setPagination({
            current_page: postsData.current_page,
            last_page: postsData.last_page,
            total: postsData.total
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this update? This cannot be undone.")) return;
    try {
      const res = await apiFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted successfully");
        fetchPosts();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (e) {
      toast.error("Error deleting post");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (updateType === "Video update") {
        setMediaFiles(newFiles);
      } else {
        setMediaFiles((prev) => [...prev, ...newFiles]);
      }
      // Clear the input so selecting the same file again triggers the event
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!title || !client) {
      toast.error("Title and Project are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("project_id", client);
      formData.append("update_type", updateType);
      formData.append("title", title);
      formData.append("description", body);
      formData.append("notify", notify ? "1" : "0");

      mediaFiles.forEach((file) => {
        formData.append("media[]", file);
      });

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${baseUrl}/api/admin/posts`, true);
        xhr.setRequestHeader("Accept", "application/json");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.message || data.error || "Failed to post update"));
            } catch (e) {
              reject(new Error("Failed to post update"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.send(formData);
      });

      toast.success("Update published successfully");

      // Reset form
      setTitle("");
      setBody("");
      setMediaFiles([]);
      setNotify(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh posts
      fetchPosts();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to publish update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Note: we no longer use filteredPosts for the global feed, but we can keep it around if needed.
  // We'll just use `posts` directly in the feed.

  const renderPageNumbers = () => {
    if (!pagination || pagination.last_page <= 1) return null;
    const pages = [];
    let startPage = Math.max(1, pagination.current_page - 2);
    let endPage = Math.min(pagination.last_page, pagination.current_page + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(pagination.last_page, 5);
      } else if (endPage === pagination.last_page) {
        startPage = Math.max(1, pagination.last_page - 4);
      }
    }

    if (startPage > 1) {
      pages.push(
        <button key="first" onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary">1</button>
      );
      if (startPage > 2) pages.push(<span key="ellipsis1" className="px-2 text-muted-foreground">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`px-3 py-1.5 text-sm rounded-lg ${pagination.current_page === i ? "bg-foreground text-background font-semibold" : "hover:bg-secondary"}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < pagination.last_page) {
      if (endPage < pagination.last_page - 1) pages.push(<span key="ellipsis2" className="px-2 text-muted-foreground">...</span>);
      pages.push(
        <button key="last" onClick={() => { setPage(pagination.last_page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary">{pagination.last_page}</button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1 my-6">
        <button 
          onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={pagination.current_page === 1}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages}
        <button 
          onClick={() => { setPage(p => Math.min(pagination.last_page, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={pagination.current_page === pagination.last_page}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {editItem && (
        <EditModal 
          item={editItem} 
          onClose={() => setEditItem(null)} 
          onSave={() => {
            fetchPosts();
          }}
        />
      )}

      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="font-bold">Post </span>
            <span className="text-muted-foreground font-normal">updates</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish news feed content to client portals
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-border">
          <button
            onClick={() => setActiveTab("publish")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "publish"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Publish New Update
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "manage"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Manage All Updates
          </button>
        </div>

        {activeTab === "manage" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              type="text"
              placeholder="Search updates by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm bg-secondary/50 border-none rounded-lg px-4 py-2 text-sm focus:outline-none"
            />
            <div className="w-full sm:w-[220px]">
              <ProjectFilterCombobox projects={projects} value={filterProject} onChange={setFilterProject} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {activeTab === "manage" && (
              <div className="flex flex-col gap-4">

                <div className="rounded-2xl border border-border overflow-hidden bg-background">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Client / Project</th>
                          <th className="px-6 py-4 font-semibold">Title</th>
                          <th className="px-6 py-4 font-semibold">Type</th>
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {posts
                          .map((post) => {
                            const project = projects.find((pr) => pr.id === post.project_id);
                            return (
                              <tr key={post.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                  {project ? (
                                    <div className="flex items-center gap-3">
                                      <Avatar className="size-8 shrink-0 border border-border">
                                        <AvatarImage src={project.clientAvatar} alt={project.client} />
                                        <AvatarFallback className="text-xs">
                                          {project.client?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground leading-none">
                                          {project.client}
                                        </span>
                                        <span className="text-xs text-muted-foreground leading-tight mt-1 line-clamp-1">
                                          {project.name} • {project.email}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    "Unknown Project"
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="line-clamp-1">{post.title}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary/50 text-[10px] font-semibold tracking-wider uppercase">
                                    {post.update_type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setEditItem(post)}
                                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(post.id)}
                                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {posts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                              No updates found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {renderPageNumbers()}
              </div>
            )}

            {activeTab === "publish" && (
              <div className="flex flex-col gap-6">
                {/* Two-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
                  {/* LEFT — Project news feed */}
                  <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-border">
                      <p className="text-sm font-semibold">Recent updates</p>
                    </div>
                    <div className="flex flex-col divide-y divide-border min-h-[300px] max-h-[750px] overflow-y-auto">
                      {posts.length === 0 ? (
                        <div className="p-5 flex items-center justify-center text-sm text-muted-foreground text-center">
                          No updates have been posted yet.
                        </div>
                      ) : (
                        posts.slice(0, 6).map((item) => {
                          const project = projects.find(p => p.id === item.project_id);
                          return item.update_type === "Status update" || item.update_type === "Milestone update" ? (
                            <StatusFeedItem key={item.id} item={item} project={project} />
                          ) : (
                            <MediaFeedItem key={item.id} item={item} project={project} />
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT — New update form */}
                  <div className="rounded-2xl border border-border overflow-hidden flex flex-col bg-card shadow-sm">
                    <div className="px-5 py-4 border-b border-border bg-muted/30">
                      <p className="text-sm font-semibold">Publish New Update</p>
                    </div>

                    <div className="p-5 flex flex-col gap-6">

                      {/* Client / Project selector moved here */}
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                          Target Project
                        </p>
                        <ProjectCombobox
                          projects={projects}
                          value={client}
                          onChange={setClient}
                        />
                      </div>
                      {/* Update type */}
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                          Update Type
                        </p>
                        <Select value={updateType} onValueChange={setUpdateType}>
                          <SelectTrigger className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 pb-3 h-auto shadow-none focus-visible:ring-0 focus-visible:border-[#C49A3C]">
                            <SelectValue placeholder="Select an update type" />
                          </SelectTrigger>
                          <SelectContent>
                            {UPDATE_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Update title */}
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                          Update Title
                        </p>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Update Title"
                          className="w-full bg-transparent border-b border-border pb-3 text-sm focus:outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>

                      {/* Body - Not shown for Video updates */}
                      {updateType !== "Video update" && (
                        <div className="[&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-container]:border-border [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-transparent pb-3">
                          <Editor
                            value={body}
                            onTextChange={(e) => setBody(e.htmlValue || "")}
                            placeholder="Write your project update content here..."
                          />
                        </div>
                      )}

                      {/* Attach media - Not shown for Status updates */}
                      {updateType !== "Status update" && updateType !== "Milestone update" && (
                        <div>
                          <input
                            type="file"
                            multiple={updateType !== "Video update"}
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept={updateType === "Video update" ? "video/*" : "image/*"}
                          />
                          {mediaFiles.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {updateType === "Video update" ? (
                                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                                  <video src={URL.createObjectURL(mediaFiles[0])} controls className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMediaFiles([]);
                                      if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="absolute top-2 right-2 size-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {mediaFiles.map((file, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                                      <Image src={URL.createObjectURL(file)} alt="preview" fill className="object-cover" unoptimized />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newFiles = [...mediaFiles];
                                          newFiles.splice(i, 1);
                                          setMediaFiles(newFiles);
                                          if (newFiles.length === 0 && fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="absolute top-2 right-2 size-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:bg-secondary/30 transition-colors text-muted-foreground"
                                  >
                                    <Camera size={20} />
                                    <span className="text-xs font-medium">Add more</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 py-8 hover:bg-secondary/30 transition-colors"
                            >
                              <div
                                className="size-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${GOLD}22` }}
                              >
                                <Camera size={18} style={{ color: GOLD }} />
                              </div>
                              <p className="text-sm font-semibold">
                                {updateType === "Video update" ? "Attach video" : "Attach photos"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {updateType === "Video update"
                                  ? "Upload a single video file"
                                  : "Select one or more high-fidelity photos"}
                              </p>
                            </button>
                          )}
                        </div>
                      )}

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
                            style={{
                              transform: notify
                                ? "translateX(22px)"
                                : "translateX(2px)",
                            }}
                          />
                        </button>
                      </div>

                      {/* Publish button */}
                      {isSubmitting && mediaFiles.length > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-medium mb-1.5 text-muted-foreground">
                            <span>Uploading media...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-foreground h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isSubmitting
                          ? (uploadProgress < 100 && mediaFiles.length > 0 ? `UPLOADING (${uploadProgress}%)` : "PUBLISHING...")
                          : "PUBLISH UPDATE"}
                        {!isSubmitting && <Send size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

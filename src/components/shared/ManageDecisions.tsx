"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, FileText, ImagePlus, Loader2, CheckCircle, Check, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectCombobox } from "@/components/shared/ProjectCombobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

type DecisionStatus = "pending" | "approved" | "rejected" | "client_approved" | "client_rejected";

interface VendorDecision {
  id: number;
  project_id: number;
  project_name: string;
  title: string;
  description: string | null;
  due_date: string | null;
  urgency: string;
  image_path: string | null;
  image_url: string | null;
  status: DecisionStatus;
  created_by: number;
  creator_name: string | null;
  creator_email: string | null;
  creator_avatar: string | null;
  creator_role?: string | null;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
}

type FilterTab = "All" | "Pending Admin" | "Pending Client" | "Approved" | "Admin Rejected" | "Client Rejected";
const TABS: FilterTab[] = ["All", "Pending Admin", "Pending Client", "Approved", "Admin Rejected", "Client Rejected"];

export function ManageDecisions({ role }: { role: "admin" | "vendor" }) {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const [decisions, setDecisions] = useState<VendorDecision[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Form State
  const [projectId, setProjectId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("normal");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pushNotify, setPushNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);

  // Approve & Reject Modal States
  const [approveModalMs, setApproveModalMs] = useState<VendorDecision | null>(null);
  const [approvePushNotify, setApprovePushNotify] = useState(true);
  const [approveEmailNotify, setApproveEmailNotify] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const [rejectModalMs, setRejectModalMs] = useState<VendorDecision | null>(null);
  const [rejectPushNotify, setRejectPushNotify] = useState(true);
  const [rejectEmailNotify, setRejectEmailNotify] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const [docsRes, projRes] = await Promise.all([
        apiFetch(`/api/${role}/decisions`),
        apiFetch(`/api/${role}/projects?all=1`)
      ]);
      
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDecisions(data.data || []);
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
      ? decisions
      : decisions.filter((d) => {
          if (activeTab === "Pending Admin") return d.status === "pending";
          if (activeTab === "Pending Client") return d.status === "approved";
          if (activeTab === "Approved") return d.status === "client_approved";
          if (activeTab === "Admin Rejected") return d.status === "rejected";
          if (activeTab === "Client Rejected") return d.status === "client_rejected";
          return true;
        });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageDecisions = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    if (!title) return toast.error("Please enter a decision title.");
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (dueDate) formData.append("due_date", dueDate);
    if (urgency) formData.append("urgency", urgency);
    if (imageFile) formData.append("image", imageFile);
    formData.append("push_notify", pushNotify ? "true" : "false");
    formData.append("email_notify", emailNotify ? "true" : "false");

    try {
      const res = await apiFetch(`/api/${role}/decisions`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Decision submitted successfully!");
        setTitle("");
        setDescription("");
        setDueDate("");
        setUrgency("normal");
        setImageFile(null);
        setImagePreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Submission failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleApprove = (doc: VendorDecision) => {
    setApproveModalMs(doc);
    setApprovePushNotify(true);
    setApproveEmailNotify(true);
  };

  const handleReject = (doc: VendorDecision) => {
    setRejectModalMs(doc);
    setRejectPushNotify(true);
    setRejectEmailNotify(true);
  };

  const submitApprove = async () => {
    if (!approveModalMs) return;
    setIsApproving(true);
    try {
      const res = await apiFetch(`/api/admin/decisions/${approveModalMs.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          push_notify: approvePushNotify,
          email_notify: approveEmailNotify,
        })
      });
      if (res.ok) {
        toast.success("Decision approved");
        setApproveModalMs(null);
        fetchData();
      } else {
        toast.error("Failed to approve decision");
      }
    } catch {
      toast.error("Error approving decision");
    } finally {
      setIsApproving(false);
    }
  };

  const submitReject = async () => {
    if (!rejectModalMs) return;
    setIsRejecting(true);
    try {
      const res = await apiFetch(`/api/admin/decisions/${rejectModalMs.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          push_notify: rejectPushNotify,
          email_notify: rejectEmailNotify,
        })
      });
      if (res.ok) {
        toast.success("Decision rejected");
        setRejectModalMs(null);
        fetchData();
      } else {
        toast.error("Failed to reject decision");
      }
    } catch {
      toast.error("Error rejecting decision");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: List of decisions */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {role === "admin" ? "Manage Decisions" : "Your Decisions"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submit and manage decisions requiring approval.
            </p>
          </div>

          <div className="relative flex gap-0 border-b border-border mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className="relative px-6 py-3 text-sm font-semibold transition-colors z-10"
                style={{
                  color:
                    activeTab === tab
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {tab}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-all duration-300 origin-left"
                    style={{ backgroundColor: GOLD }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col flex-1 gap-4">
            {isLoadingDocs ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
            ) : pageDecisions.length === 0 ? (
              <div className="border border-border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground">
                <FileText size={32} className="mb-4 opacity-30" />
                <p className="text-sm font-medium">No decisions found.</p>
                <p className="text-xs opacity-70">Submit a new decision to get started.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageDecisions.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-[#C49A3C]/50 transition-colors shadow-sm hover:shadow-md"
                    >
                      <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-secondary/10">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground line-clamp-1 flex-1 mr-2">
                          {doc.project_name}
                        </span>
                        {doc.status === "pending" && (
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full">
                            Pending Admin
                          </span>
                        )}
                        {doc.status === "approved" && (
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-full">
                            Pending Client
                          </span>
                        )}
                        {doc.status === "client_approved" && (
                          <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full">
                            Approved
                          </span>
                        )}
                        {doc.status === "rejected" && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full">
                            Admin Rejected
                          </span>
                        )}
                        {doc.status === "client_rejected" && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full">
                            Client Rejected
                          </span>
                        )}
                      </div>
                      {doc.image_url && (
                        <div 
                          className="h-32 bg-muted relative overflow-hidden cursor-pointer"
                          onClick={() => setViewingImage(doc.image_url)}
                        >
                          <img src={doc.image_url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-xs backdrop-blur-sm bg-black/40 px-3 py-1.5 rounded-full transition-opacity">
                              Click to enlarge
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <p className="text-sm font-bold leading-snug line-clamp-2">
                          {doc.title}
                        </p>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        {doc.creator_name && (
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                            <Avatar className="size-8 rounded-full border border-border">
                              <AvatarImage src={doc.creator_avatar || undefined} alt={doc.creator_name} className="object-cover" />
                              <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground font-bold">
                                {doc.creator_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-xs font-bold leading-tight flex items-center">
                                {doc.creator_name}
                                {doc.creator_role && (
                                  <span className="ml-1.5 text-[9px] uppercase tracking-wider text-[#C49A3C] bg-[#C49A3C]/10 px-1.5 py-0.5 rounded-full">
                                    {doc.creator_role}
                                  </span>
                                )}
                              </p>
                              {doc.creator_email && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {doc.creator_email}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {role === "admin" && doc.status === "pending" && (
                        <div className="flex gap-2 p-4 pt-0 mt-auto">
                          <button
                            type="button"
                            onClick={() => handleApprove(doc)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold tracking-wider uppercase bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(doc)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold tracking-wider uppercase bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filtered.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-4 mt-auto">
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
                        className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {pageNumbers().map((p, i) =>
                        p === "..." ? (
                          <span
                            key={"ellipsis-" + i}
                            className="size-8 flex items-center justify-center text-muted-foreground text-sm"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p as number)}
                            className={`size-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              page === p
                                ? "bg-foreground text-background"
                                : "hover:bg-secondary text-muted-foreground"
                            }`}
                          >
                            {p}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
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
        </div>

        {/* Right Column: Upload Form */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold mb-4">Submit New Decision</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 w-full">
                <ProjectCombobox
                  projects={projects as any}
                  value={projectId}
                  onChange={(val) => setProjectId(val === "all" ? "" : val)}
                  label="Select Project"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Decision Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Primary kitchen tile selection"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Description / Note
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the decision or ask a question..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition resize-none h-24"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Attach Image (Optional)
                </label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageFile && imagePreviewUrl ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border group-hover:border-[#C49A3C]/40 transition-colors">
                        <img 
                          src={imagePreviewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                          <CheckCircle size={14} />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center truncate w-full px-2">
                        {imageFile.name} (Click to change)
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImagePlus size={24} className="text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-foreground">Click to upload image</span>
                      <span className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 20MB</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/jpeg,image/png,image/jpg" 
                  />
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
              
              <button
                type="submit"
                disabled={isSubmitting || !projectId || !title}
                className="w-full py-3 mt-4 rounded-xl font-bold text-sm tracking-wide text-white bg-foreground hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  backgroundColor: (!isSubmitting && projectId && title) ? GOLD : undefined
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit Decision"
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      <Dialog open={!!approveModalMs} onOpenChange={(open) => !open && setApproveModalMs(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Decision</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-6">
              You are about to approve <strong>{approveModalMs?.title}</strong>.
            </p>
            <div className="flex flex-col gap-4 bg-secondary/20 p-4 rounded-xl border border-border/50 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send push notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={approvePushNotify}
                  onClick={() => setApprovePushNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                  style={{ backgroundColor: approvePushNotify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: approvePushNotify ? "translateX(22px)" : "translateX(2px)" }} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send email notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={approveEmailNotify}
                  onClick={() => setApproveEmailNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                  style={{ backgroundColor: approveEmailNotify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: approveEmailNotify ? "translateX(22px)" : "translateX(2px)" }} />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={submitApprove}
              disabled={isApproving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-bold tracking-wide hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isApproving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              CONFIRM APPROVAL
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectModalMs} onOpenChange={(open) => !open && setRejectModalMs(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Decision</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-6">
              You are about to reject <strong>{rejectModalMs?.title}</strong>.
            </p>
            <div className="flex flex-col gap-4 bg-secondary/20 p-4 rounded-xl border border-border/50 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send push notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={rejectPushNotify}
                  onClick={() => setRejectPushNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                  style={{ backgroundColor: rejectPushNotify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: rejectPushNotify ? "translateX(22px)" : "translateX(2px)" }} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send email notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={rejectEmailNotify}
                  onClick={() => setRejectEmailNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                  style={{ backgroundColor: rejectEmailNotify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: rejectEmailNotify ? "translateX(22px)" : "translateX(2px)" }} />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={submitReject}
              disabled={isRejecting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-bold tracking-wide hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isRejecting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              CONFIRM REJECTION
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ImageViewer 
        images={viewingImage ? [viewingImage] : []}
        currentIndex={viewingImage ? 0 : null}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
}

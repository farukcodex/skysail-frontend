import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Field } from "@/components/shared/Field";
import { Project } from "../page";
import { apiFetch } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EditProjectModal({ project, onClose, onSuccess }: { project: Project, onClose: () => void, onSuccess: () => void }) {
  const clientId = project.clientId || "";
  const [projectName, setProjectName] = useState(project.name);
  const [projectAddress, setProjectAddress] = useState(project.location);
  const [startDate, setStartDate] = useState(project.started || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(project.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Please select a client.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT"); // Laravel handles PUT via FormData using _method field
      formData.append("client_id", clientId);
      formData.append("name", projectName);
      formData.append("address", projectAddress);
      formData.append("started_at", startDate);
      if (imageFile) formData.append("image", imageFile);

      const res = await apiFetch(`/api/admin/projects/${project.id}`, {
        method: "POST", // POST + _method=PUT is required for Laravel to parse FormData
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to update project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell id="edit-project-title" title="Edit Project" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Read-only Client */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Client
            </label>
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-secondary/20">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={project.clientAvatar || ""} alt={project.client} />
                <AvatarFallback>{project.client?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{project.client}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{project.email}</span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Field label="Project Name" id="edit-project-name" placeholder="The Sterling Penthouse" value={projectName} onChange={e => setProjectName(e.target.value)} required />
          </div>
          <Field label="Project Address" id="edit-project-address" placeholder="Central Park West, NY" value={projectAddress} onChange={e => setProjectAddress(e.target.value)} required />
          <Field label="Start Date" type="date" id="edit-project-start" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          
          {/* Read-only Vendors */}
          <div className="sm:col-span-2 flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Assigned Vendors
            </label>
            {project.vendors && project.vendors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.vendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center gap-2 bg-secondary/50 rounded-full py-1 pl-1 pr-3 border border-border">
                    <Avatar className="size-6 shrink-0">
                      <AvatarImage src={vendor.avatar} alt={vendor.name} />
                      <AvatarFallback className="text-[10px]">{vendor.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{vendor.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No vendors assigned.</p>
            )}
          </div>

          <div className="sm:col-span-2 mt-2">
            <Field label="Update Cover Image (Optional)" type="file" id="edit-project-image" accept="image/*" onChange={e => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              } else {
                setImageFile(null);
                setPreviewUrl(project.image || null);
              }
            }} />
            {previewUrl && (
              <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-border bg-muted">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
            <X size={14} /> Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

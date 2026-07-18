import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Field } from "@/components/shared/Field";
import { ClientMultiSelect } from "./ClientMultiSelect";
import { VendorMultiSelect } from "./VendorMultiSelect";
import { apiFetch } from "@/lib/api";

export function AddProjectModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientIds.length === 0) {
      toast.error("Please select at least one client.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      clientIds.forEach(id => formData.append("client_ids[]", id));
      formData.append("name", projectName);
      formData.append("address", projectAddress);
      formData.append("started_at", startDate);
      vendorIds.forEach(id => formData.append("vendor_ids[]", id));
      if (imageFile) formData.append("image", imageFile);

      const res = await apiFetch(`/api/admin/projects`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell id="add-project-title" title="Add Project" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="sm:col-span-2">
            <ClientMultiSelect selectedClientIds={clientIds} onChange={setClientIds} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Project Name" id="add-project-name" placeholder="The Sterling Penthouse" value={projectName} onChange={e => setProjectName(e.target.value)} required />
          </div>
          <Field label="Project Address" id="add-project-address" placeholder="Central Park West, NY" value={projectAddress} onChange={e => setProjectAddress(e.target.value)} required />
          <Field label="Start Date" type="date" id="add-project-start" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          <div className="sm:col-span-2">
            <VendorMultiSelect selectedVendorIds={vendorIds} onChange={setVendorIds} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Cover Image" type="file" id="add-project-image" accept="image/*" onChange={e => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              } else {
                setImageFile(null);
                setPreviewUrl(null);
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
            Add Project
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

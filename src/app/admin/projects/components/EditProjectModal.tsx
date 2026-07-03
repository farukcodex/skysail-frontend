import { X } from "lucide-react";
import React, { useState } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Field } from "@/components/shared/Field";
import { ClientCombobox } from "./ClientCombobox";
import { Project } from "../page";

export function EditProjectModal({ project, onClose }: { project: Project, onClose: () => void }) {
  const [clientId, setClientId] = useState(project.clientId || "");
  const [projectName, setProjectName] = useState(project.name);
  const [projectAddress, setProjectAddress] = useState(project.location);
  const [startDate, setStartDate] = useState(project.started);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to ProjectController once implemented
    console.log("Edit project:", { clientId, projectName, projectAddress, startDate });
    onClose();
  };

  return (
    <ModalShell id="edit-project-title" title="Edit Project" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="sm:col-span-2">
            <ClientCombobox value={clientId} onChange={setClientId} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Project Name" id="edit-project-name" placeholder="The Sterling Penthouse" value={projectName} onChange={e => setProjectName(e.target.value)} required />
          </div>
          <Field label="Project Address" id="edit-project-address" placeholder="Central Park West, NY" value={projectAddress} onChange={e => setProjectAddress(e.target.value)} required />
          <Field label="Start Date" type="date" id="edit-project-start" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
            <X size={14} /> Cancel
          </button>
          <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity">
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

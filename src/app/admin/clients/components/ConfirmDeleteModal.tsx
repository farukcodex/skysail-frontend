import { Loader2, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Client } from "../page";

interface ConfirmDeleteModalProps {
  client: Client;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteModal({ client, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onClose();
  };

  return (
    <ModalShell id="confirm-delete-title" title="Delete Client" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-center size-10 rounded-full bg-red-500/20 text-red-500 shrink-0">
            <AlertTriangle size={18} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete <strong className="text-foreground">{client.firstName} {client.lastName}</strong>? 
            They will be permanently removed from all associated projects, but the projects themselves will remain intact.
            <br/><br/>
            <strong className="text-red-500">This action cannot be undone.</strong>
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading} 
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirm}
            disabled={isLoading} 
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Yes, Delete Client"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

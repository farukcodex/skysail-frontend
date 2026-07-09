import { X, Loader2, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Client } from "../page";

interface ConfirmBlockModalProps {
  client: Client;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmBlockModal({ client, onClose, onConfirm }: ConfirmBlockModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isBlocked = client.status === 'blocked';

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onClose();
  };

  return (
    <ModalShell id="confirm-block-title" title={isBlocked ? "Unblock Client" : "Block Client"} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center justify-center size-10 rounded-full bg-background border border-border shrink-0">
            <AlertTriangle className={isBlocked ? "text-green-500" : "text-red-500"} size={18} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to {isBlocked ? 'unblock' : 'block'} <strong className="text-foreground">{client.firstName} {client.lastName}</strong>? 
            {isBlocked 
              ? " They will regain access to their account and projects." 
              : " They will no longer be able to log in or access their projects."}
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
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-background text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 ${isBlocked ? 'bg-foreground' : 'bg-red-500'}`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : isBlocked ? "Yes, Unblock" : "Yes, Block"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

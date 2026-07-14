import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModalShell } from "@/components/shared/ModalShell";
import { Client } from "../page"; // We'll export the interface from page.tsx

export function ClientDetailsModal({ client, onClose }: { client: Client, onClose: () => void }) {
  return (
    <ModalShell
      id="client-details-title"
      title="Client details"
      onClose={onClose}
    >
      {/* Client section */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            Client
          </p>
          <p className="text-2xl font-bold leading-tight">
            {client.firstName} {client.lastName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
          {client.phone && (
            <p className="text-sm text-muted-foreground mt-0.5">{client.phone}</p>
          )}
        </div>
        <Avatar className="size-16 shrink-0">
          <AvatarImage
            src={client.avatar}
            alt={`${client.firstName} ${client.lastName}`}
          />
          <AvatarFallback className="text-lg">
            {client.firstName[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Active Projects
          </p>
          <p className="text-base font-bold">{client.active_projects ?? 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Completed Projects
          </p>
          <p className="text-base font-bold">{client.completed_projects ?? 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Cancelled Projects
          </p>
          <p className="text-base font-bold">{client.cancelled_projects ?? 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Account Status
          </p>
          <p className="text-base font-bold capitalize">{client.status}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Creation Date
          </p>
          <p className="text-base font-bold">{client.creationDate}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full bg-foreground text-background py-4 rounded-2xl text-sm font-semibold hover:opacity-80 transition-opacity"
      >
        Back to dashboard
      </button>
    </ModalShell>
  );
}

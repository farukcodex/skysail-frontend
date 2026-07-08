import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModalShell } from "@/components/shared/ModalShell";
import { Vendor } from "../page";

export function VendorDetailsModal({ vendor, onClose }: { vendor: Vendor, onClose: () => void }) {
  return (
    <ModalShell
      id="vendor-details-title"
      title="Vendor details"
      onClose={onClose}
    >
      {/* Vendor section */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            Vendor
          </p>
          <p className="text-2xl font-bold leading-tight">
            {vendor.firstName} {vendor.lastName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{vendor.email}</p>
          {vendor.phone && (
            <p className="text-sm text-muted-foreground mt-0.5">{vendor.phone}</p>
          )}
        </div>
        <Avatar className="size-16 shrink-0">
          <AvatarImage
            src={vendor.avatar}
            alt={`${vendor.firstName} ${vendor.lastName}`}
          />
          <AvatarFallback className="text-lg">
            {vendor.firstName[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Designation
          </p>
          <p className="text-base font-bold">{vendor.designation}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Account Status
          </p>
          <p className="text-base font-bold capitalize">{vendor.status}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Creation Date
          </p>
          <p className="text-base font-bold">{vendor.creationDate}</p>
        </div>
      </div>

      {/* Projects and Milestones */}
      <div className="flex flex-col gap-6 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Assigned Projects
          </p>
          {(!vendor.projects || vendor.projects.length === 0) ? (
            <p className="text-sm text-muted-foreground">No projects assigned.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {vendor.projects.map((p) => (
                <div key={p.id} className="text-sm font-semibold bg-secondary/50 px-3 py-2 rounded-lg border border-border">
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Milestone Progress
          </p>
          {(!vendor.milestones || vendor.milestones.length === 0) ? (
            <p className="text-sm text-muted-foreground">No milestones assigned.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {vendor.milestones.map((m) => (
                <div key={m.id} className="flex flex-col gap-1.5 bg-secondary/50 p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs font-bold text-[#C49A3C]">{m.completion_percent}%</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                    <span>{m.project_name || "Unknown Project"}</span>
                    <span>{m.status}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-linear-to-r from-[#C49A3C] to-[#A46909]" 
                      style={{ width: `${m.completion_percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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

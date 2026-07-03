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

import { Pencil } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Project } from "../page";

const GOLD = "#C49A3C";

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] font-semibold tracking-widest uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  );
}

export function ProjectCard({
  project,
  onEdit,
  onManageVendors,
  onComplete,
  onCancel,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onManageVendors: (p: Project) => void;
  onComplete?: (p: Project) => void;
  onCancel?: (p: Project) => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-background overflow-hidden flex flex-col shadow-sm">
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-muted">
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover"
          unoptimized
        />
        <span
          className={`absolute top-3 left-3 backdrop-blur-sm text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white ${
            project.status === 'completed' 
              ? 'bg-green-600/90' 
              : project.status === 'cancelled' 
                ? 'bg-red-600/90' 
                : 'bg-black/70'
          }`}
        >
          {project.phase}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-4 flex-1">
        {/* Title + edit */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold leading-snug">{project.name}</h3>
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity"
            style={{ color: GOLD }}
            aria-label="Edit project"
          >
            <Pencil size={16} />
          </button>
        </div>

        {/* Meta 2×2 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <MetaField label="Client" value={project.client} />
          <MetaField label="Email" value={project.email} />
          <MetaField label="Started" value={project.started} />
          <MetaField label="Location" value={project.location} />
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={() => onManageVendors(project)}
            className="w-full py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Add / Manage vendors
          </button>
          {project.status !== 'completed' && project.status !== 'cancelled' && onComplete && (
            <button
              type="button"
              onClick={() => onComplete(project)}
              className="w-full py-3 rounded-2xl border border-border bg-background text-foreground text-sm font-semibold hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
            >
              Mark as Completed
            </button>
          )}
          {project.status !== 'completed' && project.status !== 'cancelled' && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(project)}
              className="w-full py-3 rounded-2xl border border-border bg-background text-foreground text-sm font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
            >
              Cancel Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

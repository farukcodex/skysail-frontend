"use client";

import { ChevronLeft, ChevronRight, Pencil, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 6;

interface Project {
  id: number;
  name: string;
  phase: string;
  client: string;
  clientFirstName: string;
  clientLastName: string;
  email: string;
  started: string;
  location: string;
  image: string;
}

const ALL_PROJECTS: Project[] = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  name: "The Henderson Residence",
  phase: "Phase 3: Framing",
  client: "Bob Henderson",
  clientFirstName: "Bob",
  clientLastName: "Henderson",
  email: "j.@sterling.com",
  started: "May 2025",
  location: "Central Park West, NY",
  image: `https://placehold.co/600x340/1a2332/ffffff?text=Project+${i + 1}`,
}));

// ─── Shared modal shell ───────────────────────────────────────────────────────

function ModalShell({
  id,
  title,
  onClose,
  children,
}: {
  id: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="bg-background rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative z-10 max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id={id} className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  defaultValue,
  placeholder,
}: {
  label: string;
  id: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
      />
    </div>
  );
}

// ─── Add Project Modal ────────────────────────────────────────────────────────

function AddProjectModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell id="add-project-title" title="Add Project" onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field
          label="Project Name"
          id="add-project-name"
          placeholder="The Sterling Penthouse"
        />
        <Field
          label="Add Client"
          id="add-project-client-email"
          placeholder="client@example.com"
        />
        <Field
          label="Client First Name"
          id="add-project-first"
          placeholder="The Sterling Penthouse"
        />
        <Field
          label="Client Second Name"
          id="add-project-last"
          placeholder="client@example.com"
        />
        <Field
          label="Project Address"
          id="add-project-address"
          placeholder="Central Park West, NY"
        />
        <Field
          label="Start Date"
          id="add-project-start"
          placeholder="October 24, 2023"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
        >
          <X size={14} />
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          Add Project
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Edit Project Modal ───────────────────────────────────────────────────────

function EditProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <ModalShell id="edit-project-title" title="Edit Project" onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field
          label="Project Name"
          id="edit-project-name"
          defaultValue={project.name}
          placeholder="The Sterling Penthouse"
        />
        <Field
          label="Add Client"
          id="edit-project-client-email"
          defaultValue={project.email}
          placeholder="client@example.com"
        />
        <Field
          label="Client First Name"
          id="edit-project-first"
          defaultValue={project.clientFirstName}
          placeholder="The Sterling Penthouse"
        />
        <Field
          label="Client Second Name"
          id="edit-project-last"
          defaultValue={project.clientLastName}
          placeholder="client@example.com"
        />
        <Field
          label="Project Address"
          id="edit-project-address"
          defaultValue={project.location}
          placeholder="Central Park West, NY"
        />
        <Field
          label="Start Date"
          id="edit-project-start"
          defaultValue={project.started}
          placeholder="October 24, 2023"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
        >
          <X size={14} />
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          Save Changes
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function ProjectCard({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: (p: Project) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden flex flex-col">
      <div className="relative w-full aspect-[16/9] bg-muted">
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover"
          unoptimized
        />
        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
          {project.phase}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug">{project.name}</h3>
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="shrink-0 mt-0.5 hover:opacity-60 transition-opacity"
            style={{ color: GOLD }}
            aria-label="Edit project"
          >
            <Pencil size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <MetaField label="Client" value={project.client} />
          <MetaField label="Email" value={project.email} />
          <MetaField label="Started" value={project.started} />
          <MetaField label="Location" value={project.location} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AllProjectsPage() {
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const totalPages = Math.ceil(ALL_PROJECTS.length / PAGE_SIZE);
  const pageProjects = ALL_PROJECTS.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

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

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} />}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
        />
      )}

      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="font-bold">All </span>
            <span className="text-muted-foreground font-normal">projects</span>
          </h1>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-6 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Add Project
            <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
              <PlusIcon size={16} className="text-white" />
            </span>
          </button>
        </div>

        {/* Card section */}
        <div className="rounded-2xl border border-border p-5 flex flex-col gap-5">
          <p className="text-sm font-semibold">Active projects</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={setEditProject}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, ALL_PROJECTS.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {ALL_PROJECTS.length}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis separator
                  key={`ellipsis-${i}`}
                  className="px-1 text-xs text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p as number)}
                  className="size-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
                  style={
                    page === p
                      ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD }
                      : {}
                  }
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

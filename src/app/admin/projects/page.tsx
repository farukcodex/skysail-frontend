"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Pagination } from "@/components/shared/Pagination";
import { AddProjectModal } from "./components/AddProjectModal";
import { EditProjectModal } from "./components/EditProjectModal";
import { ProjectCard } from "./components/ProjectCard";

const PAGE_SIZE = 6;

export interface Project {
  id: number;
  name: string;
  phase: string;
  client: string;
  clientId?: string;
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
  email: "j.@sterling.com",
  started: "2025-05-01",
  location: "Central Park West, NY",
  image: `https://placehold.co/600x340/1a2332/ffffff?text=Project+${i + 1}`,
}));

export default function AllProjectsPage() {
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const totalPages = Math.ceil(ALL_PROJECTS.length / PAGE_SIZE);
  const pageProjects = ALL_PROJECTS.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

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
        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          totalItems={ALL_PROJECTS.length}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}

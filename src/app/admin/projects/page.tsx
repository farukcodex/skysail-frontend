"use client";

import { PlusIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Pagination } from "@/components/shared/Pagination";
import { AddProjectModal } from "./components/AddProjectModal";
import { EditProjectModal } from "./components/EditProjectModal";
import { ManageVendorsModal } from "./components/ManageVendorsModal";
import { ProjectCard } from "./components/ProjectCard";
import { apiFetch } from "@/lib/api";

const PAGE_SIZE = 6;

export interface Project {
  id: number;
  name: string;
  phase: string;
  client: string;
  clientId?: string;
  clientAvatar?: string;
  email: string;
  started: string;
  location: string;
  image: string;
  vendors?: { id: number; name: string; avatar: string }[];
}



export default function AllProjectsPage() {
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [manageVendorsProject, setManageVendorsProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/projects?page=${page}&per_page=${PAGE_SIZE}`);
      const data = await res.json();
      if (res.ok) {
        setProjects(data.data);
        setTotalPages(data.meta.last_page);
        setTotalItems(data.meta.total);
      } else {
        console.error("Failed to fetch projects", data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} onSuccess={fetchProjects} />}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSuccess={fetchProjects}
        />
      )}
      {manageVendorsProject && (
        <ManageVendorsModal
          project={manageVendorsProject}
          onClose={() => setManageVendorsProject(null)}
          onSuccess={fetchProjects}
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
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={40} />
            </div>
          ) : projects.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No projects found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={setEditProject}
                  onManageVendors={setManageVendorsProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
}

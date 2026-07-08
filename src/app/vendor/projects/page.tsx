"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

const GOLD = "#C49A3C";
const PAGE_SIZE = 6;

interface Project {
  id: number;
  name: string;
  phase: string;
  client: string;
  email: string;
  started: string;
  location: string;
  image: string;
}



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

function ProjectCard({ project }: { project: Project }) {
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
        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
          {project.phase}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-5 flex flex-col gap-4 flex-1">
        {/* Title */}
        <h3 className="text-xl font-bold leading-snug">{project.name}</h3>

        {/* Meta 2×2 */}
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

export default function VendorProjectsPage() {
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/vendor/projects?per_page=${PAGE_SIZE}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setTotalItems(data.meta.total || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="font-bold">All </span>
            <span className="text-muted-foreground font-normal">projects</span>
          </h1>
        </div>

        {/* Card section */}
        <div className="rounded-2xl border border-border p-5 flex flex-col gap-5">
          <p className="text-sm font-semibold">Active projects</p>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <p className="text-sm font-medium">No active projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, totalItems)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalItems}
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
                      ? {
                          backgroundColor: GOLD,
                          color: "#fff",
                          borderColor: GOLD,
                        }
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
        )}
      </div>
    </div>
  );
}

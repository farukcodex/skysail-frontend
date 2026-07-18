"use client";

import { PlusIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Pagination } from "@/components/shared/Pagination";
import { AddProjectModal } from "./components/AddProjectModal";
import { EditProjectModal } from "./components/EditProjectModal";
import { ManageVendorsModal } from "./components/ManageVendorsModal";
import { ProjectCard } from "./components/ProjectCard";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const PAGE_SIZE = 6;

export interface Project {
  id: number;
  status: string;
  name: string;
  phase: string;
  client: string;
  clientIds?: string[];
  clients?: { id: number; name: string; avatar: string }[];
  clientAvatar?: string;
  email: string;
  started: string;
  location: string;
  image: string;
  vendors?: { id: number; name: string; avatar: string }[];
}



export default function AllProjectsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [manageVendorsProject, setManageVendorsProject] = useState<Project | null>(null);
  const [completeProject, setCompleteProject] = useState<Project | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [cancelProject, setCancelProject] = useState<Project | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [sendEmail, setSendEmail] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await apiFetch(`/api/admin/projects?page=${page}&per_page=${PAGE_SIZE}${statusParam}`);
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
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCompleteProject = async () => {
    if (!completeProject) return;
    setIsCompleting(true);
    try {
      const res = await apiFetch(`/api/admin/projects/${completeProject.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send_email: sendEmail, send_notification: sendNotification }),
      });
      if (!res.ok) throw new Error("Failed to complete project");
      setCompleteProject(null);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelProject = async () => {
    if (!cancelProject) return;
    setIsCancelling(true);
    try {
      const res = await apiFetch(`/api/admin/projects/${cancelProject.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send_email: sendEmail, send_notification: sendNotification }),
      });
      if (!res.ok) throw new Error("Failed to cancel project");
      setCancelProject(null);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  const executeDelete = async (projectId: number) => {
    try {
      const res = await apiFetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Project deleted successfully");
        if (projects.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchProjects();
        }
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete project");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the project");
    }
  };

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
      {projectToDelete && (
        <ConfirmDeleteModal
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirm={() => executeDelete(projectToDelete.id)}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm font-semibold">All projects</p>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 max-w-[200px]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
                  onComplete={setCompleteProject}
                  onCancel={setCancelProject}
                  onDelete={setProjectToDelete}
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

      {completeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 border border-border">
            <div>
              <h2 className="text-xl font-bold">Mark as Completed</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to mark <strong>{completeProject.name}</strong> as completed?
              </p>
              <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-sm text-orange-800 font-medium">
                  Warning: This action will also mark all milestones for this project as 100% completed and approved.
                </p>
              </div>

              <div className="mt-2 flex flex-col gap-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Send push notification to client?</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sendNotification}
                    onClick={() => setSendNotification((v) => !v)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                    style={{ backgroundColor: sendNotification ? "#1a1a1a" : "#e5e7eb" }}
                  >
                    <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: sendNotification ? "translateX(22px)" : "translateX(2px)" }} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Send email to client?</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sendEmail}
                    onClick={() => setSendEmail((v) => !v)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                    style={{ backgroundColor: sendEmail ? "#1a1a1a" : "#e5e7eb" }}
                  >
                    <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: sendEmail ? "translateX(22px)" : "translateX(2px)" }} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCompleteProject(null)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-bold tracking-wide hover:bg-black/5 transition-colors"
                disabled={isCompleting}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleCompleteProject}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white text-sm font-bold tracking-wide hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={isCompleting}
              >
                {isCompleting ? <Loader2 size={16} className="animate-spin" /> : "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 border border-border">
            <div>
              <h2 className="text-xl font-bold">Cancel Project</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to cancel <strong>{cancelProject.name}</strong>?
              </p>
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800 font-medium">
                  Warning: This action will also mark all pending milestones for this project as cancelled. This cannot be easily undone.
                </p>
              </div>

              <div className="mt-2 flex flex-col gap-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Send push notification to client?</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sendNotification}
                    onClick={() => setSendNotification((v) => !v)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                    style={{ backgroundColor: sendNotification ? "#1a1a1a" : "#e5e7eb" }}
                  >
                    <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: sendNotification ? "translateX(22px)" : "translateX(2px)" }} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Send email to client?</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sendEmail}
                    onClick={() => setSendEmail((v) => !v)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
                    style={{ backgroundColor: sendEmail ? "#1a1a1a" : "#e5e7eb" }}
                  >
                    <span className="inline-block size-5 rounded-full bg-white shadow transition-transform" style={{ transform: sendEmail ? "translateX(22px)" : "translateX(2px)" }} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCancelProject(null)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-bold tracking-wide hover:bg-black/5 transition-colors"
                disabled={isCancelling}
              >
                BACK
              </button>
              <button
                type="button"
                onClick={handleCancelProject}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white text-sm font-bold tracking-wide hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isCancelling}
              >
                {isCancelling ? <Loader2 size={16} className="animate-spin" /> : "CONFIRM CANCEL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

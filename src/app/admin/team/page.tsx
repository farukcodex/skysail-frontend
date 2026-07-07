"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";
import { ProjectCombobox } from "../updates/ProjectCombobox";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  avatar: string;
  status: string;
}

interface Project {
  id: number;
  name: string;
  client: string;
  email?: string;
  clientAvatar?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageNumbers(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 0) return [];
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

// ─── Page ────────────────────────────────────────────────────────────────────

const PREVIEW_AVATAR =
  "https://api.dicebear.com/9.x/avataaars/png?seed=WadeWarren&size=64&backgroundColor=1a2332";

export default function TeamPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // form
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("General Vendor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState(PREVIEW_AVATAR);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await apiFetch("/api/admin/projects?all=1");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    }
    loadProjects();
  }, []);

  const fetchVendors = async (pageNumber: number, projectId: string) => {
    setIsLoading(true);
    try {
      let url = `/api/admin/vendors?page=${pageNumber}&per_page=${PAGE_SIZE}`;
      if (projectId && projectId !== "all") {
        url += `&project_id=${projectId}`;
      }
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data);
        setTotalPages(data.meta.last_page);
        setTotalItems(data.meta.total);
      }
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(page, selectedProjectId);
  }, [page, selectedProjectId]);



  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewAvatar(URL.createObjectURL(selectedFile));
    }
  }

  async function handleAdd() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Name, email, and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("designation", designation);
      if (file) {
        formData.append("profile_photo", file);
      }

      const res = await apiFetch("/api/admin/vendors", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setDesignation("General Vendor");
        setPreviewAvatar(PREVIEW_AVATAR);
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        
        // Reload current page
        fetchVendors(page, selectedProjectId);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to create vendor");
      }
    } catch (error) {
      console.error("Failed to add vendor", error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">All members</p>
        </div>

        {/* Client / Project selector */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Client / Project
          </p>
          <div className="relative">
            <ProjectCombobox
              projects={projects as any}
              value={selectedProjectId}
              onChange={(val) => {
                setSelectedProjectId(val);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start mt-4">
          {/* LEFT — Member list */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Member list</p>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : members.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No members found.
                </div>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="size-11 rounded-full overflow-hidden bg-muted shrink-0">
                      <Image
                        src={m.avatar}
                        alt={`${m.firstName} ${m.lastName}`}
                        width={44}
                        height={44}
                        className="object-cover size-11"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.designation}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && members.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-border mt-auto">
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
                    className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={13} />
                  </button>

                  {pageNumbers(page, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span
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
                        className="size-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
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
                    className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Add member form */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Add member</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Avatar preview + upload */}
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                  <Image
                    src={previewAvatar}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="object-cover size-16"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <p className="text-base font-bold truncate">
                    {name || "Wade Warren"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email || "tan@gmail.com"}
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  <UploadCloud size={13} />
                  Upload Image
                </button>
              </div>

              {/* Member name */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Member Name
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Remy DiAngelo"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Member designation (Select) */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Member Designation
                </p>
                <div className="relative border-b border-border pb-3">
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm focus:outline-none"
                  >
                    <option value="General Vendor">General Vendor</option>
                    <option value="Architect">Architect</option>
                    <option value="Designer">Designer</option>
                    <option value="Builder">Builder</option>
                  </select>
                </div>
              </div>

              {/* Member email */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Member Email
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. email@example.com"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Member password */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Temporary Password
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={handleAdd}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 mt-2 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? "ADDING..." : "ADD MEMBER"}
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

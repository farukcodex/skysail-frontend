"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PlusIcon,
  X,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

const PROJECTS = [
  "The Henderson Residence",
  "The Mercer Custom Build",
  "The Larsen Pool & Addition",
];

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  project: string;
  location: string;
  creationDate: string;
  avatar: string;
}

const ALL_CLIENTS: Client[] = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  firstName: "Jonathan",
  lastName: "Sterling",
  email: "j.sterling@sterling-investments.com",
  project: "The Sterling Penthouse",
  location: "Central Park West, NY",
  creationDate: "October 24, 2023",
  avatar: `https://api.dicebear.com/9.x/avataaars/png?seed=client${i}&size=96&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`,
}));

const PAGE_SIZE = 5;

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

// ─── Client Details Modal ─────────────────────────────────────────────────────

function ClientDetailsModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
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
            Project Title
          </p>
          <p className="text-base font-bold">{client.project}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            Location
          </p>
          <p className="text-base font-bold">{client.location}</p>
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

// ─── Add Client Modal ─────────────────────────────────────────────────────────

function AddClientModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell id="add-client-title" title="Add Client" onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field label="First Name" id="add-first-name" placeholder="Jonathan" />
        <Field label="Last Name" id="add-last-name" placeholder="Jonathan" />
        <Field
          label="Email Address"
          id="add-email"
          placeholder="client@example.com"
        />
        <Field
          label="Project Name"
          id="add-project"
          placeholder="The Sterling Penthouse"
        />
        <Field
          label="Project Address"
          id="add-location"
          placeholder="Central Park West, NY"
        />
        <Field
          label="Start Date"
          id="add-start-date"
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
          Add Client
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Edit Client Modal ────────────────────────────────────────────────────────

function EditClientModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  return (
    <ModalShell id="edit-client-title" title="Edit Client" onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field
          label="First Name"
          id="edit-first-name"
          defaultValue={client.firstName}
          placeholder="Jonathan"
        />
        <Field
          label="Last Name"
          id="edit-last-name"
          defaultValue={client.lastName}
          placeholder="Sterling"
        />
        <Field
          label="Email Address"
          id="edit-email"
          defaultValue={client.email}
          placeholder="client@example.com"
        />
        <Field
          label="Project Name"
          id="edit-project"
          defaultValue={client.project}
          placeholder="The Sterling Penthouse"
        />
        <Field
          label="Project Address"
          id="edit-location"
          defaultValue={client.location}
          placeholder="Central Park West, NY"
        />
        <Field
          label="Start Date"
          id="edit-start-date"
          defaultValue={client.creationDate}
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientManagementPage() {
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const totalPages = Math.ceil(ALL_CLIENTS.length / PAGE_SIZE);
  const pageClients = ALL_CLIENTS.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function pageNumbers() {
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
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} />}
      {viewClient && (
        <ClientDetailsModal
          client={viewClient}
          onClose={() => setViewClient(null)}
        />
      )}
      {editClient && (
        <EditClientModal
          client={editClient}
          onClose={() => setEditClient(null)}
        />
      )}

      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-muted-foreground font-normal">All </span>
            Client
          </h1>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-6 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Add Client
            <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
              <PlusIcon size={16} className="text-white" />
            </span>
          </button>
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Project
          </p>
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium"
            >
              {selectedProject}
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden">
                {PROJECTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedProject(p);
                      setDropdownOpen(false);
                      setPage(1);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Client list */}
        <div className="flex flex-col gap-3">
          {pageClients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col w-full gap-4 p-4 rounded-2xl border border-border bg-background"
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-3 w-full">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage
                    src={client.avatar}
                    alt={`${client.firstName} ${client.lastName}`}
                  />
                  <AvatarFallback className="text-sm">
                    {client.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">
                    {client.firstName} {client.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {client.project}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setViewClient(client)}
                  className="text-xs font-bold px-4 py-1.5 rounded-full text-background bg-linear-to-b from-[#865B15] to-[#E1C283]"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditClient(client)}
                  className="text-xs font-bold px-4 py-1.5 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-xs ml-auto font-bold px-4 py-1.5 text-red-500 hover:opacity-70 transition-opacity"
                >
                  Block
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, ALL_CLIENTS.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {ALL_CLIENTS.length}
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
      </div>
    </div>
  );
}

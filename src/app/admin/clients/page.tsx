"use client";

import { PlusIcon, Loader2, Search, MessageSquare, Bell } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared/Pagination";
import { apiFetch } from "@/lib/api";
import { AddClientModal } from "./components/AddClientModal";
import { EditClientModal } from "./components/EditClientModal";
import { ClientDetailsModal } from "./components/ClientDetailsModal";
import { ConfirmBlockModal } from "./components/ConfirmBlockModal";
import { NotifyUsersModal } from "@/components/shared/NotifyUsersModal";

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  projects_count: number;
  active_projects?: number;
  completed_projects?: number;
  cancelled_projects?: number;
  creationDate: string;
  avatar: string;
  status: string;
}

const PAGE_SIZE = 15;

export default function ClientManagementPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [clientToBlock, setClientToBlock] = useState<Client | null>(null);

  const fetchClients = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/clients?page=${page}&search=${encodeURIComponent(searchQuery)}&per_page=${PAGE_SIZE}`);
      const data = await res.json();
      if (res.ok) {
        setClients(data.data);
        setTotalPages(data.meta.last_page);
        setTotalItems(data.meta.total);
      } else {
        console.error("Failed to fetch clients", data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const executeBlockToggle = async (clientId: number) => {
    try {
      const res = await apiFetch(`/api/admin/clients/${clientId}/block`, {
        method: "POST"
      });
      if (res.ok) {
        fetchClients(true);
      }
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onSuccess={() => {
        if (page === 1 && searchQuery === "") {
          fetchClients();
        } else {
          setPage(1);
          setSearchQuery("");
        }
      }} />}
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
          onSuccess={fetchClients}
        />
      )}
      {clientToBlock && (
        <ConfirmBlockModal
          client={clientToBlock}
          onClose={() => setClientToBlock(null)}
          onConfirm={() => executeBlockToggle(clientToBlock.id)}
        />
      )}

      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-muted-foreground font-normal">All </span>
            Client
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-background border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowNotify(true)}
              className="flex items-center justify-center gap-6 w-full sm:w-fit bg-secondary border border-border text-foreground rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
            >
              Notify Clients
              <span className="flex items-center justify-center bg-background border border-border rounded-full w-9 h-9">
                <Bell size={16} className="text-foreground" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center justify-center gap-6 w-full sm:w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
            >
              Add Client
              <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
                <PlusIcon size={16} className="text-white" />
              </span>
            </button>
          </div>
        </div>

        {/* Client list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
            {clients.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 md:col-span-2 lg:col-span-3">No clients found.</p>
            ) : (
              clients.map((client) => (
                <div
                  key={client.id}
                  className="flex flex-col h-full w-full gap-4 p-5 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Avatar + Info */}
                  <div className="flex items-start gap-4 w-full">
                    <Avatar className="size-14 shrink-0">
                      <AvatarImage
                        src={client.avatar}
                        alt={`${client.firstName} ${client.lastName}`}
                      />
                      <AvatarFallback className="text-sm">
                        {client.firstName?.[0] || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold truncate">
                        {client.firstName} {client.lastName}
                        {client.status === 'blocked' && (
                          <span className="ml-2 text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Blocked</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {client.email}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground/80 truncate mt-1">
                        {client.active_projects ?? 0} Active Projects
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full pt-4 border-t border-border mt-auto">
                    <button
                      type="button"
                      onClick={() => setViewClient(client)}
                      className="text-xs font-bold px-4 py-2 rounded-full text-background bg-linear-to-b from-[#865B15] to-[#E1C283] hover:opacity-90 transition-opacity"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditClient(client)}
                      className="text-xs font-bold px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/messages?client_id=${client.id}`}
                      className="px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                    >
                      Message
                    </Link>
                    <button
                      type="button"
                      onClick={() => setClientToBlock(client)}
                      className="text-xs font-bold px-4 py-2 text-red-500 hover:opacity-70 transition-opacity ml-auto"
                    >
                      {client.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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

      <NotifyUsersModal
        isOpen={showNotify}
        onClose={() => setShowNotify(false)}
        users={clients.map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, email: c.email }))}
        userType="client"
      />
    </div>
  );
}

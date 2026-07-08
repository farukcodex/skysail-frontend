"use client";

import { PlusIcon, Loader2, Search, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared/Pagination";
import { apiFetch } from "@/lib/api";
import { AddClientModal } from "./components/AddClientModal";
import { EditClientModal } from "./components/EditClientModal";
import { ClientDetailsModal } from "./components/ClientDetailsModal";

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  projects_count: number;
  creationDate: string;
  avatar: string;
  status: string;
}

const PAGE_SIZE = 5;

export default function ClientManagementPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleBlockToggle = async (clientId: number) => {
    try {
      const res = await apiFetch(`/api/admin/clients/${clientId}/block`, {
        method: "POST"
      });
      if (res.ok) {
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onSuccess={fetchClients} />}
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
          <div className="flex flex-col gap-3">
            {clients.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No clients found.</p>
            ) : (
              clients.map((client) => (
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
                        {client.firstName?.[0] || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {client.firstName} {client.lastName}
                        {client.status === 'blocked' && (
                          <span className="ml-2 text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Blocked</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {client.email}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground/80 truncate mt-0.5">
                        {client.projects_count} Active Projects
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
                    <Link
                      href={`/admin/messages?client_id=${client.id}`}
                      className="px-4 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                    >
                      Message
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleBlockToggle(client.id)}
                      className="text-xs ml-auto font-bold px-4 py-1.5 text-red-500 hover:opacity-70 transition-opacity"
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
    </div>
  );
}

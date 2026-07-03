"use client";

import { PlusIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/shared/Pagination";
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
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = (localStorage.getItem("token") || sessionStorage.getItem("token"));
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
      const res = await fetch(`${baseUrl}/api/admin/clients`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data.data);
      } else {
        console.error("Failed to fetch clients", data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleBlockToggle = async (clientId: number) => {
    try {
      const token = (localStorage.getItem("token") || sessionStorage.getItem("token"));
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
      const res = await fetch(`${baseUrl}/api/admin/clients/${clientId}/block`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(clients.length / PAGE_SIZE);
  const pageClients = clients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

        {/* Client list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={40} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pageClients.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No clients found.</p>
            ) : (
              pageClients.map((client) => (
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
                    <div className="flex-1">
                      <p className="text-sm font-bold">
                        {client.firstName} {client.lastName}
                        {client.status === 'blocked' && (
                          <span className="ml-2 text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Blocked</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
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
        {!isLoading && clients.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            totalItems={clients.length}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Client } from "../../clients/page";
import { apiFetch } from "@/lib/api";
import { X } from "lucide-react";

export function ClientMultiSelect({ 
  selectedClientIds, 
  onChange,
  initialSelectedClients = []
}: { 
  selectedClientIds: string[]; 
  onChange: (vals: string[]) => void;
  initialSelectedClients?: { id: number; name: string; avatar: string }[];
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClientsData, setSelectedClientsData] = useState<{ id: number; name: string; avatar: string }[]>(initialSelectedClients);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/admin/clients?search=${encodeURIComponent(search)}&per_page=15`);
        const data = await res.json();
        if (res.ok) {
          setClients(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchClients, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (clientIdStr: string) => {
    if (!clientIdStr) return;
    const clientId = parseInt(clientIdStr);
    
    // Don't add if already selected
    if (selectedClientIds.includes(clientId.toString())) {
      setSearch("");
      return;
    }

    const client = clients.find(c => c.id === clientId);
    if (client) {
      const newSelected = [...selectedClientsData, {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
        avatar: client.avatar
      }];
      setSelectedClientsData(newSelected);
      onChange([...selectedClientIds, client.id.toString()]);
    }
    
    // Clear search
    setSearch("");
  };

  const handleRemove = (idToRemove: number) => {
    setSelectedClientsData(prev => prev.filter(c => c.id !== idToRemove));
    onChange(selectedClientIds.filter(id => id !== idToRemove.toString()));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        Assign Clients
      </label>
      
      {/* Selected clients bubbles */}
      {selectedClientsData.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedClientsData.map(client => (
            <div key={client.id} className="flex items-center gap-2 bg-secondary/80 rounded-full py-1 pl-1 pr-3 border border-border">
              <Avatar className="size-6 shrink-0">
                <AvatarImage src={client.avatar} alt={client.name} />
                <AvatarFallback className="text-[10px]">{client.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{client.name}</span>
              <button 
                type="button" 
                onClick={() => handleRemove(client.id)}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Combobox to search and add */}
      <Combobox 
        value={null} 
        onValueChange={(val) => {
          if (val) handleSelect(val as string);
        }}
        inputValue={search} 
        onInputValueChange={setSearch}
      >
        <ComboboxInput 
          placeholder={loading ? "Loading clients..." : "Search for a client to add..."}
          className="w-full bg-secondary/60 rounded-xl"
        />
        <ComboboxContent>
          <ComboboxList>
            {clients
              .filter(c => !selectedClientIds.includes(c.id.toString()))
              .map((client) => (
              <ComboboxItem 
                key={client.id} 
                value={client.id.toString()}
              >
                <div className="flex items-center gap-3 py-1">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={client.avatar} alt={client.firstName} />
                    <AvatarFallback className="text-xs">{client.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{client.firstName} {client.lastName}</span>
                    <span className="text-xs text-muted-foreground mt-1">{client.email}</span>
                  </div>
                </div>
              </ComboboxItem>
            ))}
            {clients.filter(c => !selectedClientIds.includes(c.id.toString())).length === 0 && search && !loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No clients found.
              </div>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Client } from "../../clients/page";

export function ClientCombobox({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        Select Client
      </label>
      <Combobox>
        <ComboboxInput 
          placeholder={loading ? "Loading clients..." : "Search for a client..."}
          className="w-full bg-secondary/60 rounded-xl"
        />
        <ComboboxContent>
          <ComboboxEmpty>No clients found</ComboboxEmpty>
          <ComboboxList>
            {clients.map((client) => (
              <ComboboxItem 
                key={client.id} 
                textValue={`${client.firstName} ${client.lastName}`}
                value={client.id.toString()}
                onSelect={() => onChange(client.id.toString())}
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
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

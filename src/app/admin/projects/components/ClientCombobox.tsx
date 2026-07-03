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

export function ClientCombobox({ 
  value, 
  onChange,
  initialLabel = ""
}: { 
  value: string; 
  onChange: (val: string) => void;
  initialLabel?: string;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialLabel);

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

  const handleInputValueChange = (newVal: string) => {
    // @base-ui automatically sets inputValue to the selected ComboboxItem's value (which is the ID).
    // We intercept it here and replace it with the client's name.
    const selected = clients.find(c => c.id.toString() === newVal);
    if (selected) {
      setSearch(`${selected.firstName} ${selected.lastName}`);
    } else {
      setSearch(newVal);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        Select Client
      </label>
      <Combobox 
        value={value || null} 
        onValueChange={(val) => {
          if (val) onChange(val as string);
        }}
        inputValue={search} 
        onInputValueChange={handleInputValueChange}
      >
        <ComboboxInput 
          placeholder={loading ? "Loading clients..." : "Search for a client..."}
          className="w-full bg-secondary/60 rounded-xl"
        />
        <ComboboxContent>
          <ComboboxList>
            {clients.map((client) => (
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
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

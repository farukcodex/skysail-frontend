import React, { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/api";
import { X } from "lucide-react";

export interface Vendor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  avatar: string;
}

export function VendorMultiSelect({ 
  selectedVendorIds, 
  onChange,
  initialSelectedVendors = []
}: { 
  selectedVendorIds: string[]; 
  onChange: (vals: string[]) => void;
  initialSelectedVendors?: { id: number; name: string; avatar: string }[];
}) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedVendorsData, setSelectedVendorsData] = useState<{ id: number; name: string; avatar: string }[]>(initialSelectedVendors);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/admin/vendors?search=${encodeURIComponent(search)}&per_page=15`);
        const data = await res.json();
        if (res.ok) {
          setVendors(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchVendors, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (vendorIdStr: string) => {
    if (!vendorIdStr) return;
    const vendorId = parseInt(vendorIdStr);
    
    // Don't add if already selected
    if (selectedVendorIds.includes(vendorId.toString())) {
      setSearch("");
      return;
    }

    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      const newSelected = [...selectedVendorsData, {
        id: vendor.id,
        name: `${vendor.firstName} ${vendor.lastName}`,
        avatar: vendor.avatar
      }];
      setSelectedVendorsData(newSelected);
      onChange([...selectedVendorIds, vendor.id.toString()]);
    }
    
    // Clear search
    setSearch("");
  };

  const handleRemove = (idToRemove: number) => {
    setSelectedVendorsData(prev => prev.filter(v => v.id !== idToRemove));
    onChange(selectedVendorIds.filter(id => id !== idToRemove.toString()));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        Assign Vendors
      </label>
      
      {/* Selected vendors bubbles */}
      {selectedVendorsData.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedVendorsData.map(vendor => (
            <div key={vendor.id} className="flex items-center gap-2 bg-secondary/80 rounded-full py-1 pl-1 pr-3 border border-border">
              <Avatar className="size-6 shrink-0">
                <AvatarImage src={vendor.avatar} alt={vendor.name} />
                <AvatarFallback className="text-[10px]">{vendor.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{vendor.name}</span>
              <button 
                type="button" 
                onClick={() => handleRemove(vendor.id)}
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
          placeholder={loading ? "Loading vendors..." : "Search for a vendor to add..."}
          className="w-full bg-secondary/60 rounded-xl"
        />
        <ComboboxContent>
          <ComboboxList>
            {vendors
              .filter(v => !selectedVendorIds.includes(v.id.toString()))
              .map((vendor) => (
              <ComboboxItem 
                key={vendor.id} 
                value={vendor.id.toString()}
              >
                <div className="flex items-center gap-3 py-1">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={vendor.avatar} alt={vendor.firstName} />
                    <AvatarFallback className="text-xs">{vendor.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{vendor.firstName} {vendor.lastName}</span>
                    <span className="text-xs text-muted-foreground mt-1">{vendor.designation} &middot; {vendor.email}</span>
                  </div>
                </div>
              </ComboboxItem>
            ))}
            {vendors.filter(v => !selectedVendorIds.includes(v.id.toString())).length === 0 && search && !loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No vendors found.
              </div>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

import { X, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Project } from "../page";
import { apiFetch } from "@/lib/api";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Vendor } from "./VendorMultiSelect";

export function ManageVendorsModal({ project, onClose, onSuccess }: { project: Project, onClose: () => void, onSuccess: () => void }) {
  const [vendorIds, setVendorIds] = useState<string[]>(project.vendors?.map(v => v.id.toString()) || []);
  const [assignedVendors, setAssignedVendors] = useState<{ id: number; name: string; avatar: string; designation?: string; email?: string }[]>(
    project.vendors || []
  );
  
  const [search, setSearch] = useState("");
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Search vendors
  useEffect(() => {
    const fetchVendors = async () => {
      setIsSearching(true);
      try {
        const res = await apiFetch(`/api/admin/vendors?search=${encodeURIComponent(search)}&per_page=15`);
        const data = await res.json();
        if (res.ok) {
          setAllVendors(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(fetchVendors, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectVendor = (vendorIdStr: string) => {
    if (!vendorIdStr) return;
    const vendorId = parseInt(vendorIdStr);
    
    if (vendorIds.includes(vendorId.toString())) {
      setSearch("");
      return;
    }

    const vendor = allVendors.find(v => v.id === vendorId);
    if (vendor) {
      setAssignedVendors([...assignedVendors, {
        id: vendor.id,
        name: `${vendor.firstName} ${vendor.lastName}`,
        email: vendor.email,
        designation: vendor.designation,
        avatar: vendor.avatar
      }]);
      setVendorIds([...vendorIds, vendor.id.toString()]);
    }
    setSearch("");
  };

  const handleRemove = (idToRemove: number) => {
    setAssignedVendors(prev => prev.filter(v => v.id !== idToRemove));
    setVendorIds(prev => prev.filter(id => id !== idToRemove.toString()));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/admin/projects/${project.id}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ vendor_ids: vendorIds }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Vendors assigned successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to update vendors");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving vendors.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell id="manage-vendors-title" title={`Manage Vendors for ${project.name}`} onClose={onClose}>
      <div className="flex flex-col gap-6">
        
        {/* Combobox to add new vendors */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Search & Add Vendor
          </label>
          <Combobox 
            value={null} 
            onValueChange={(val) => {
              if (val) handleSelectVendor(val as string);
            }}
            inputValue={search} 
            onInputValueChange={setSearch}
          >
            <ComboboxInput 
              placeholder={isSearching ? "Searching..." : "Search by name or email..."}
              className="w-full bg-secondary/60 rounded-xl"
            />
            <ComboboxContent>
              <ComboboxList>
                {allVendors
                  .filter(v => !vendorIds.includes(v.id.toString()))
                  .map((vendor) => (
                  <ComboboxItem 
                    key={vendor.id} 
                    textValue={`${vendor.firstName} ${vendor.lastName}`}
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
                {allVendors.filter(v => !vendorIds.includes(v.id.toString())).length === 0 && search && !isSearching && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No vendors found.
                  </div>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* List of currently assigned vendors */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold">Assigned Vendors ({assignedVendors.length})</h4>
          
          {assignedVendors.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              No vendors assigned to this project yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
              {assignedVendors.map(vendor => (
                <div key={vendor.id} className="flex items-center gap-4 p-3 rounded-2xl border border-border bg-background">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={vendor.avatar} alt={vendor.name} />
                    <AvatarFallback>{vendor.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 flex flex-col truncate">
                    <span className="text-sm font-bold truncate">{vendor.name}</span>
                    {(vendor.designation || vendor.email) && (
                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                        {vendor.designation ? `${vendor.designation} • ` : ""}{vendor.email || "No email"}
                      </span>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleRemove(vendor.id)}
                    className="shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Remove Vendor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button type="button" onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
            <X size={14} /> Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving} 
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            Save Vendors
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

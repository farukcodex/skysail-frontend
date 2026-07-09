import React, { useState } from "react";
import { Check, ChevronDown, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type VendorType = { id: number; name: string; email?: string; avatar?: string; role?: string };

export function VendorCombobox({
  vendors,
  value,
  onChange,
  initialLabel = "",
  disabled = false,
  onAddVendorToProject,
}: {
  vendors: VendorType[];
  value: string;
  onChange: (val: string) => void;
  initialLabel?: string;
  disabled?: boolean;
  onAddVendorToProject?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedVendor = vendors.find((v) => v.id.toString() === value);

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        Assign Vendor
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 disabled:opacity-50",
              !selectedVendor && "text-muted-foreground"
            )}
          >
            {selectedVendor ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={selectedVendor.avatar} alt={selectedVendor.name} />
                  <AvatarFallback className="text-xs">
                    {selectedVendor.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
                  <span className="text-sm font-semibold leading-none truncate text-foreground w-full text-left">
                    {selectedVendor.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-left">
                    {selectedVendor.role || "Vendor"} {selectedVendor.email ? `• ${selectedVendor.email}` : ""}
                  </span>
                </div>
              </div>
            ) : initialLabel && value ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {initialLabel[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
                  <span className="text-sm font-semibold leading-none truncate text-foreground w-full text-left">
                    {initialLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-left">
                    Vendor
                  </span>
                </div>
              </div>
            ) : (
              <span>Select a vendor...</span>
            )}
            <ChevronDown size={16} className="text-muted-foreground opacity-50 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search vendors..." />
            <CommandList>
              <CommandEmpty>No vendors assigned to project.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="unassigned"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  <div className="size-8 shrink-0 rounded-full bg-secondary/50 flex items-center justify-center">
                    <span className="text-xs">--</span>
                  </div>
                  <span className="text-sm font-medium leading-none">Unassigned</span>
                </CommandItem>
                {vendors.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    value={`${vendor.name} ${vendor.email || ""} ${vendor.role || ""}`}
                    onSelect={() => {
                      onChange(vendor.id.toString());
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={vendor.avatar} alt={vendor.name} />
                      <AvatarFallback className="text-xs">
                        {vendor.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold leading-none truncate">
                        {vendor.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1 truncate">
                        {vendor.role || "Vendor"} {vendor.email ? `• ${vendor.email}` : ""}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 text-[#C49A3C]",
                        value === vendor.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              {onAddVendorToProject && (
                <>
                  <div className="h-px bg-border my-1" />
                  <CommandGroup>
                    <CommandItem
                      value="add_new_vendor_to_project"
                      onSelect={() => {
                        setOpen(false);
                        onAddVendorToProject();
                      }}
                      className="flex items-center gap-3 py-2 cursor-pointer"
                    >
                      <div className="size-8 shrink-0 rounded-full bg-[#C49A3C]/10 flex items-center justify-center">
                        <Plus size={14} className="text-[#C49A3C]" />
                      </div>
                      <span className="text-sm font-semibold text-[#C49A3C]">Add Vendor to Project</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

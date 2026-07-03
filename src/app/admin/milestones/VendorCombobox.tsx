import React, { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function VendorCombobox({
  vendors,
  value,
  onChange,
  initialLabel = "",
}: {
  vendors: { id: number; name: string; email?: string; avatar?: string }[];
  value: string;
  onChange: (val: string) => void;
  initialLabel?: string;
}) {
  const [search, setSearch] = useState(initialLabel);

  const filteredVendors = vendors.filter((v) => {
    const s = search.toLowerCase();
    return v.name.toLowerCase().includes(s) || (v.email && v.email.toLowerCase().includes(s));
  });

  const handleInputValueChange = (newVal: string) => {
    // @base-ui automatically sets inputValue to the selected ComboboxItem's value (which is the ID).
    // We intercept it here and replace it with the vendor's name.
    const selected = vendors.find((v) => v.id.toString() === newVal);
    if (selected) {
      setSearch(selected.name);
    } else {
      setSearch(newVal);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
        Assign Vendor
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
          placeholder={vendors.length === 0 ? "No vendors assigned to project" : "Search for a vendor..."}
          className="w-full bg-background border border-border rounded-xl"
        />
        {vendors.length > 0 && (
          <ComboboxContent>
            <ComboboxList>
              {/* Optional: Add an "Unassigned" option */}
              <ComboboxItem value="">
                <div className="flex items-center gap-3 py-1 text-muted-foreground">
                  <div className="size-8 shrink-0 rounded-full bg-secondary/50 flex items-center justify-center">
                    <span className="text-xs">--</span>
                  </div>
                  <span className="text-sm font-medium leading-none">Unassigned</span>
                </div>
              </ComboboxItem>
              {filteredVendors.map((vendor) => (
                <ComboboxItem
                  key={vendor.id}
                  value={vendor.id.toString()}
                >
                  <div className="flex items-center gap-3 py-1">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={vendor.avatar} alt={vendor.name} />
                      <AvatarFallback className="text-xs">
                        {vendor.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">
                        {vendor.name}
                      </span>
                      {vendor.email && (
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {vendor.email}
                        </span>
                      )}
                    </div>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        )}
      </Combobox>
    </div>
  );
}

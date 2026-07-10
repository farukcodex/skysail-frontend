"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ProjectOption {
  id: number;
  name: string;
}

interface VendorProjectDropdownProps {
  projects: ProjectOption[];
  value: string | number | null;
  onChange: (val: string) => void;
  showAllOption?: boolean;
  className?: string;
}

export function VendorProjectDropdown({
  projects,
  value,
  onChange,
  showAllOption = false,
  className
}: VendorProjectDropdownProps) {
  if (!projects || projects.length === 0) return null;

  const defaultVal = showAllOption ? "all" : (projects[0]?.id.toString() || "");

  return (
    <Select
      value={value ? value.toString() : defaultVal}
      onValueChange={onChange}
    >
      <SelectTrigger className={className || "w-full sm:w-[250px] bg-white text-black rounded-full border-input focus:ring-0"}>
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            All Projects
          </SelectItem>
        )}
        {projects.map((p) => (
          <SelectItem 
            key={p.id} 
            value={p.id.toString()}
          >
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

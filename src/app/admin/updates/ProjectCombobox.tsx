import React, { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
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

type ProjectType = { id: number; name: string; client: string; email?: string; clientAvatar?: string };

export function ProjectCombobox({
  projects,
  value,
  onChange,
  label,
}: {
  projects: ProjectType[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedProject = projects.find((p) => p.id.toString() === value);

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      {label && (
        <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40",
              !selectedProject && "text-muted-foreground"
            )}
          >
            {selectedProject ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={selectedProject.clientAvatar} alt={selectedProject.client} />
                  <AvatarFallback className="text-xs">
                    {selectedProject.client?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
                  <span className="text-sm font-semibold leading-none truncate text-foreground w-full text-left">
                    {selectedProject.client} - {selectedProject.name}
                  </span>
                  {selectedProject.email && (
                    <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-left">
                      {selectedProject.email}
                    </span>
                  )}
                </div>
              </div>
            ) : value === "all" ? (
              <span className="font-semibold text-foreground">All Projects</span>
            ) : (
              <span>Select a project...</span>
            )}
            <ChevronDown size={16} className="text-muted-foreground opacity-50 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search by project, client, or email..." />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="All Projects"
                  onSelect={() => {
                    onChange("all");
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2 cursor-pointer font-medium"
                >
                  All Projects
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 text-[#C49A3C]",
                      value === "all" ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`${project.client} ${project.name} ${project.email || ""}`}
                    onSelect={() => {
                      onChange(project.id.toString());
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={project.clientAvatar} alt={project.client} />
                      <AvatarFallback className="text-xs">
                        {project.client?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold leading-none truncate">
                        {project.client} - {project.name}
                      </span>
                      {project.email && (
                        <span className="text-[10px] text-muted-foreground mt-1 truncate">
                          {project.email}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 text-[#C49A3C]",
                        value === project.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ProjectFilterCombobox({
  projects,
  value,
  onChange,
}: {
  projects: ProjectType[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedProject = value === "all" ? null : projects.find((p) => p.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-lg border-none bg-secondary/50 px-4 py-2 text-sm font-medium transition focus:outline-none",
            !selectedProject && "text-muted-foreground"
          )}
        >
          {selectedProject ? (
            <div className="flex items-center gap-2 truncate">
              <Avatar className="size-5 shrink-0">
                <AvatarImage src={selectedProject.clientAvatar} alt={selectedProject.client} />
                <AvatarFallback className="text-[10px]">
                  {selectedProject.client?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-foreground font-semibold">
                {selectedProject.client}
              </span>
            </div>
          ) : (
            <span className="text-foreground">All Projects</span>
          )}
          <ChevronDown size={14} className="opacity-50 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Filter by client..." />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All Projects"
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
                className="cursor-pointer py-2 font-medium"
              >
                All Projects
              </CommandItem>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`${project.client} ${project.name} ${project.email || ""}`}
                  onSelect={() => {
                    onChange(project.id.toString());
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={project.clientAvatar} alt={project.client} />
                    <AvatarFallback className="text-xs">
                      {project.client?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold leading-none truncate">
                      {project.client}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 truncate">
                      {project.name} {project.email ? `• ${project.email}` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

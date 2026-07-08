"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  seed: string;
  avatar?: string;
}

interface Project {
  id: number;
  name: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MemberCard({ member }: { member: TeamMember }) {
  const avatarUrl = member.avatar || `https://api.dicebear.com/9.x/avataaars/png?seed=${member.seed}&size=80&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="size-12 rounded-full overflow-hidden shrink-0 bg-muted border border-border">
          <Image
            src={avatarUrl}
            alt={member.name}
            width={48}
            height={48}
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{member.name}</p>
          <p className="text-xs text-muted-foreground truncate">{member.role}</p>
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {member.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const projectsRes = await apiFetch("/api/client/projects?all=1");
        if (!projectsRes.ok) throw new Error("Failed to load projects");
        
        const projectsData = await projectsRes.json();
        const pList = projectsData.data || [];
        setProjects(pList);
        
        if (pList.length > 0) {
          setActiveProjectId(pList[0].id.toString());
        } else {
          setIsLoading(false); // No projects, stop loading
        }
      } catch (err) {
        console.error("Error loading projects:", err);
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Load team when active project changes
  useEffect(() => {
    if (!activeProjectId) return;
    
    async function loadTeam() {
      setIsLoading(true);
      try {
        const teamRes = await apiFetch(`/api/client/projects/${activeProjectId}/team`);
        if (!teamRes.ok) throw new Error("Failed to load team");
        
        const teamData = await teamRes.json();
        setTeam(teamData.data);
      } catch (err) {
        console.error("Error loading team:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTeam();
  }, [activeProjectId]);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your project team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Everyone involved in your build
            </p>
          </div>
          
          {/* Project Selector */}
          {projects.length > 0 && (
            <Select value={activeProjectId} onValueChange={setActiveProjectId}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Team grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-2xl animate-pulse">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="size-12 rounded-full bg-muted border border-border" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : team.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-border border-dashed">
            No team members found for this project.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

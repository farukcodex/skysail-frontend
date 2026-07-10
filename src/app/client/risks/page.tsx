"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { ClientProjectDropdown } from "@/components/shared/ClientProjectDropdown";

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskStatus = "active" | "monitoring" | "resolved" | "monitor";

interface Risk {
  id: number;
  project_id?: number;
  project_name?: string;
  title: string;
  body: string;
  status: RiskStatus;
  date: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RiskStatus }) {
  if (status === "active")
    return (
      <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2.5 py-1 rounded-full">
        Active
      </span>
    );
  if (status === "monitoring" || status === "monitor")
    return (
      <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-[#C49A3C] bg-[#C49A3C]/10 border border-[#C49A3C]/20 px-2.5 py-1 rounded-full">
        Monitoring
      </span>
    );
  return (
    <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-green-600 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 px-2.5 py-1 rounded-full">
      Resolved
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<{id: number, name: string}[]>([]);
  const [projectId, setProjectId] = useState<string>("all");

  useEffect(() => {
    const fetchProjectsList = async () => {
      try {
        const res = await apiFetch("/api/client/projects?all=true");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjectsList();
  }, []);

  const fetchRisks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/client/risks?project_id=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setRisks(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch risks", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="mb-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Priority Risk Log
            </h1>
          </div>
          <div className="w-full sm:w-auto flex sm:justify-end">
            <ClientProjectDropdown
              projects={projects}
              value={projectId}
              onChange={(val) => setProjectId(val)}
              showAllOption={true}
            />
          </div>
        </div>

        {/* Risk cards */}
        <div className="flex flex-col gap-4 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : risks.length === 0 ? (
            <div className="border border-border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground">
              <p className="text-sm font-medium">No active risks logged.</p>
            </div>
          ) : (
            risks.map((r) => (
              <Card key={r.id} className="rounded-2xl">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <h2 className="text-sm font-bold leading-snug break-all">{r.title}</h2>
                      {r.project_name && (
                        <span className="text-[10px] font-bold text-[#C49A3C] uppercase tracking-widest">{r.project_name}</span>
                      )}
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <p
                    className={`text-sm leading-relaxed break-all ${
                      r.status === "resolved"
                        ? "text-muted-foreground italic"
                        : "text-muted-foreground"
                    }`}
                  >
                    {r.body}
                  </p>

                  {r.status === "resolved" && r.date && (
                    <p className="text-sm text-muted-foreground italic mt-1">
                      Closed {r.date}.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

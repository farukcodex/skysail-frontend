"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageViewer } from "@/components/shared/ImageViewer";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type Urgency = "high" | "medium" | "low" | "critical" | "normal";

interface Decision {
  id: number;
  project_id: number;
  project_name: string;
  title: string;
  description: string;
  due_date: string | null;
  urgency: Urgency;
  status: string;
  image_url: string | null;
  creator_name: string;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function UrgencyBadge({ urgency, label }: { urgency: Urgency; label: string }) {
  if (urgency === "high" || urgency === "critical")
    return (
      <span className="inline-flex w-min whitespace-nowrap items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-3 py-1 rounded-full">
        <AlertTriangle size={11} />
        {label}
      </span>
    );
  return (
    <span className="inline-flex w-min whitespace-nowrap items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[#C49A3C] bg-[#C49A3C]/10 border border-[#C49A3C]/20 px-3 py-1 rounded-full">
      <CalendarClock size={11} />
      {label}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/client/decisions");
      if (res.ok) {
        const data = await res.json();
        setDecisions(data.data || []);
      } else {
        toast.error("Failed to load decisions");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while loading decisions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const handleApprove = async (id: number) => {
    try {
      const res = await apiFetch(`/api/client/decisions/${id}/approve`, { method: "POST" });
      if (res.ok) {
        toast.success("Decision approved");
        fetchDecisions();
      } else {
        toast.error("Failed to approve decision");
      }
    } catch (error) {
      toast.error("Error approving decision");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await apiFetch(`/api/client/decisions/${id}/reject`, { method: "POST" });
      if (res.ok) {
        toast.success("Decision rejected");
        fetchDecisions();
      } else {
        toast.error("Failed to reject decision");
      }
    } catch (error) {
      toast.error("Error rejecting decision");
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pending Decisions
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            A curated selection of critical project choices requiring your
            immediate oversight to ensure construction continuity.
          </p>
        </div>

        {/* Decision cards */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
          ) : decisions.length === 0 ? (
            <div className="border border-border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-muted-foreground">
              <p className="text-sm font-medium">No pending decisions found.</p>
            </div>
          ) : (
            decisions.map((d) => (
              <Card key={d.id} className="rounded-2xl overflow-hidden">
                <CardContent className="flex flex-col sm:flex-row p-0">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-60 bg-muted flex justify-center items-center shrink-0">
                    {d.image_url ? (
                      <div 
                        className="w-full h-full sm:aspect-square cursor-pointer overflow-hidden relative group"
                        onClick={() => setViewingImage(d.image_url)}
                      >
                        <Image
                          src={d.image_url}
                          alt={d.title}
                          height={240}
                          width={240}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm backdrop-blur-sm bg-black/40 px-3 py-1.5 rounded-full transition-opacity">
                            Click to enlarge
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full aspect-square flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col gap-3 justify-center">
                    <div className="flex justify-between items-start gap-4">
                       <UrgencyBadge urgency={d.urgency} label={d.due_date ? `DUE ${new Date(d.due_date).toLocaleDateString()}` : "NO DUE DATE"} />
                       {d.status !== "approved" && (
                         <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                           {d.status.replace("_", " ")}
                         </span>
                       )}
                    </div>

                    <h2 className="text-lg font-bold leading-snug">{d.title}</h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {d.description || "No description provided."}
                    </p>

                    {d.status === "approved" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(d.id)}
                          className="bg-foreground text-background hover:opacity-80 rounded-full gap-1.5 text-xs font-bold tracking-widest uppercase px-5"
                        >
                          <CheckCircle2 size={13} />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(d.id)}
                          className="rounded-full gap-1.5 text-xs font-bold tracking-widest uppercase px-5 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 dark:border-red-800"
                        >
                          <XCircle size={13} />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ImageViewer 
        images={viewingImage ? [viewingImage] : []}
        currentIndex={viewingImage ? 0 : null}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
}

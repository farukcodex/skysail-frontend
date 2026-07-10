"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Calendar,
  Send,
  CheckCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { VendorProjectDropdown } from "@/components/shared/VendorProjectDropdown";

const GOLD = "#C49A3C";

export default function VendorDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const fetchDashboardData = useCallback(async (projectId: number | null = null) => {
    setIsLoading(true);
    try {
      let url = "/api/vendor/dashboard";
      if (projectId) {
        url += `?project_id=${projectId}`;
      }
      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        if (json.data.activeProject?.id && !selectedProjectId) {
           setSelectedProjectId(json.data.activeProject.id);
        }
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (err) {
      toast.error("An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchDashboardData(selectedProjectId);
  }, [fetchDashboardData, selectedProjectId]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col min-h-dvh bg-background items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const projects = data?.projects || [];
  const activeProject = data?.activeProject || { name: "No Active Project" };
  const stats = data?.stats || { totalUploads: 0, approved: 0, pending: 0 };
  const recentDocs = data?.recentDocs || [];
  const pendingDecisions = data?.pendingDecisions || [];
  const milestones = data?.milestones || [];
  const messages = data?.messages || [];

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header & Project Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            <span>Vendor </span>
            <span className="text-muted-foreground font-normal">Dashboard</span>
          </h1>
          <div className="w-full sm:w-auto flex sm:justify-end">
            <VendorProjectDropdown
              projects={projects}
              value={selectedProjectId ? selectedProjectId.toString() : "all"}
              onChange={(val) => {
                setSelectedProjectId(Number(val));
              }}
            />
          </div>
        </div>

        {/* Hero image */}
        <div className="relative w-full overflow-hidden rounded-2xl h-[320px]">
          <Image
            src={activeProject.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop"}
            alt={activeProject.name || "Vendor Dashboard"}
            fill
            className="object-cover"
            unoptimized
          />
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0) 100%)"
            }} 
          />
          <div className="absolute bottom-[16px] left-[16px] flex flex-col items-start gap-[8px]">
            <div
              className="flex items-center justify-center rounded-[16px] px-[12px] py-[7px]"
              style={{
                background: "linear-gradient(195.71deg, #865B15 4.8%, #E1C283 89.02%)",
                height: "30px",
              }}
            >
              <span className="text-[12px] font-bold leading-[16px] tracking-[0.6px] uppercase text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {activeProject.status ? activeProject.status.replace("_", " ") : "ACTIVE"}
              </span>
            </div>
            <p className="text-white text-[32px] font-normal leading-[40px] tracking-[-0.32px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {activeProject.name || "The Henderson Residence"}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 — dark */}
          <div className="rounded-2xl bg-foreground text-background px-5 py-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-white/70" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/50">
                Total Uploads
              </p>
              <p className="text-3xl font-bold text-white leading-none mt-1">
                {stats.totalUploads}
              </p>
              <p className="text-xs text-white/40 mt-0.5">Files</p>
            </div>
          </div>

          {/* Card 2 — light */}
          <div className="rounded-2xl border border-border bg-background px-5 py-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Approved
              </p>
              <p
                className="text-3xl font-bold leading-none mt-1"
                style={{ color: GOLD }}
              >
                {stats.approved}
              </p>
              <p className="text-xs text-green-600 mt-0.5">Verified</p>
            </div>
          </div>

          {/* Card 3 — light */}
          <div className="rounded-2xl border border-border bg-background px-5 py-5 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Pending Review
              </p>
              <p className="text-3xl font-bold leading-none mt-1">{stats.pending}</p>
              <p className="text-xs text-amber-600 mt-0.5">Awaiting</p>
            </div>
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Recent Documents */}
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold">Recent Documents</p>
                <Link
                  href="/vendor/documents"
                  className="text-xs font-semibold hover:opacity-60 transition-opacity"
                  style={{ color: GOLD }}
                >
                  View All →
                </Link>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {recentDocs.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No recent documents
                  </div>
                ) : (
                  recentDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="px-5 py-3 flex items-center gap-3"
                    >
                      <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.size}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          doc.status === "Approved"
                            ? "text-green-600"
                            : doc.status === "Rejected"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending decisions */}
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold">Pending decisions</p>
                <Link
                  href="/vendor/decisions"
                  className="text-xs font-semibold hover:opacity-60 transition-opacity"
                  style={{ color: GOLD }}
                >
                  View All →
                </Link>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {pendingDecisions.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No pending decisions
                  </div>
                ) : (
                  pendingDecisions.map((d: any) => (
                    <div key={d.id} className="px-5 py-3 flex items-start gap-3">
                      <span
                        className={`mt-1.5 inline-block size-2 rounded-full shrink-0 ${d.dot}`}
                      />
                      <div>
                        <p className="text-sm font-bold">{d.title}</p>
                        <p className={`text-xs mt-0.5 ${d.descColor}`}>
                          {d.desc}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Messages from admin */}
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Messages from admin</p>
                  {messages.length > 0 && <span className="size-2 rounded-full bg-amber-500" />}
                </div>
                <Link
                  href="/vendor/messages"
                  className="text-xs font-semibold hover:opacity-60 transition-opacity"
                  style={{ color: GOLD }}
                >
                  View All →
                </Link>
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No recent messages
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isYou = msg.sender === "You";
                    return (
                      <div key={msg.id} className={`flex items-start gap-3 ${isYou ? "flex-row-reverse" : ""}`}>
                        <Image
                          src={msg.avatar}
                          alt={msg.sender}
                          width={36}
                          height={36}
                          className="rounded-full shrink-0"
                          unoptimized
                        />
                        <div className={isYou ? "flex flex-col items-end text-right" : "flex flex-col items-start"}>
                          <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                            {msg.sender}
                          </p>
                          <div className={`rounded-2xl px-4 py-3 text-sm ${isYou ? "rounded-tr-sm bg-[#C49A3C] text-white" : "rounded-tl-sm bg-secondary"}`}>
                            {msg.content}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}


              </div>
            </div>

            {/* My Milestones */}
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold">My Milestones</p>
                <Link
                  href="/vendor/milestones"
                  className="text-xs font-semibold hover:opacity-60 transition-opacity"
                  style={{ color: GOLD }}
                >
                  View All →
                </Link>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {milestones.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No milestones found
                  </div>
                ) : (
                  milestones.map((m: any) => (
                    <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                      {/* Icon */}
                      {m.filled ? (
                        <span className="size-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                          <CheckCircle size={12} className="text-white" />
                        </span>
                      ) : (
                        <span
                          className={`size-5 rounded-full shrink-0 ${m.iconBg}`}
                          style={
                            m.status === "Inprocess" ? { borderColor: GOLD } : {}
                          }
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.title}</p>
                        {m.status === "Inprocess" && (
                          <div className="mt-1 h-1 rounded-full bg-border w-full">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${m.progress}%`,
                                background: `linear-gradient(to right, #865B15, #E1C283)`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold shrink-0 ${m.statusColor}`}
                      >
                        {m.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

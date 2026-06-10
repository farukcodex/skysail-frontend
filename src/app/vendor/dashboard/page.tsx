"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  Calendar,
  Send,
  CheckCircle,
} from "lucide-react";

const GOLD = "#C49A3C";

const RECENT_DOCS = [
  { id: 1, name: "Living room mood board v2", size: "2.1 MB", status: "Pending" as const },
  { id: 2, name: "Interior finishes schedule", size: "2.1 MB", status: "Approved" as const },
  { id: 3, name: "Living room mood board v2", size: "2.1 MB", status: "Pending" as const },
  { id: 4, name: "Living room mood board v2", size: "2.1 MB", status: "Pending" as const },
  { id: 5, name: "Living room mood board v2", size: "2.1 MB", status: "Pending" as const },
];

const PENDING_DECISIONS = [
  {
    id: 1,
    dot: "bg-red-500",
    title: "Primary kitchen tile selection",
    desc: "Overdue by 2 days — please action immediately",
    descColor: "text-red-500",
  },
  {
    id: 2,
    dot: "bg-amber-500",
    title: "Window casing profile — master suite",
    desc: "Due May 29 · 6 days left",
    descColor: "text-amber-600",
  },
  {
    id: 3,
    dot: "bg-green-500",
    title: "HVAC system specification sign-off",
    desc: "Due May 29 · 12 days left",
    descColor: "text-green-600",
  },
];

const MILESTONES = [
  {
    id: 1,
    title: "Site prep & demolition",
    status: "Completed",
    statusColor: "text-green-600",
    iconBg: "bg-green-500",
    filled: true,
    progress: 100,
  },
  {
    id: 2,
    title: "Framing",
    status: "Inprocess",
    statusColor: "text-amber-600",
    iconBg: "border-2 border-amber-500",
    filled: false,
    progress: 60,
  },
  {
    id: 3,
    title: "Interior Finishes",
    status: "Not Start",
    statusColor: "text-muted-foreground",
    iconBg: "border-2 border-border",
    filled: false,
    progress: 0,
  },
  {
    id: 4,
    title: "Final punch list & handover",
    status: "Not Start",
    statusColor: "text-muted-foreground",
    iconBg: "border-2 border-border",
    filled: false,
    progress: 0,
  },
];

export default function VendorDashboardPage() {
  const [replyText, setReplyText] = useState("");

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span>Vendor </span>
            <span className="text-muted-foreground font-normal">Dashboard</span>
          </h1>
        </div>

        {/* PROJECT selector */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="vendor-dash-project"
            className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground whitespace-nowrap"
          >
            Client / Project
          </label>
          <select
            id="vendor-dash-project"
            className="rounded-xl bg-secondary/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
          >
            <option>Bob Henderson — The Henderson Residence</option>
          </select>
        </div>

        {/* Hero image */}
        <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: "21/7" }}>
          <Image
            src="https://placehold.co/1200x400/1a2332/ffffff?text=The+Henderson+Residence"
            alt="The Henderson Residence"
            fill
            className="object-cover"
            unoptimized
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 flex flex-col gap-2">
            <span
              className="text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full w-fit"
              style={{
                background: "linear-gradient(to bottom, #865B15, #E1C283)",
                color: "#fff",
              }}
            >
              ACTIVE PROJECT
            </span>
            <p className="text-white text-xl font-bold">
              The Henderson Residence
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
                4
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
              <p className="text-3xl font-bold leading-none mt-1" style={{ color: GOLD }}>
                1
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
              <p className="text-3xl font-bold leading-none mt-1">1</p>
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
                {RECENT_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    className="px-5 py-3 flex items-center gap-3"
                  >
                    <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.size}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        doc.status === "Approved"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
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
                {PENDING_DECISIONS.map((d) => (
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
                ))}
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
                  <span className="size-2 rounded-full bg-amber-500" />
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
                {/* Message bubble */}
                <div className="flex items-start gap-3">
                  <Image
                    src="https://api.dicebear.com/9.x/avataaars/png?seed=RemyDiangelo&size=40&backgroundColor=b6e3f4"
                    alt="Remy Diangelo"
                    width={36}
                    height={36}
                    className="rounded-full shrink-0"
                    unoptimized
                  />
                  <div>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                      Remy Diangelo
                    </p>
                    <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm">
                      Marco, I&apos;ve reviewed the latest mood board. Let&apos;s look at
                      the two options for the living room in our next meeting.
                      The velvet textures are spot on.
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      09:12 AM
                    </p>
                  </div>
                </div>

                {/* Reply input */}
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Reply..."
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center size-8 rounded-xl bg-foreground text-background hover:opacity-80 transition-opacity shrink-0"
                  >
                    <Send size={13} />
                  </button>
                </div>
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
                {MILESTONES.map((m) => (
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
                          m.status === "Inprocess"
                            ? { borderColor: GOLD }
                            : {}
                        }
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.title}</p>
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
                    <span className={`text-xs font-semibold ${m.statusColor}`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

const VENDOR_TABS = ["Architect", "Designer", "Builder", "General Vendor"] as const;
type VendorTab = (typeof VENDOR_TABS)[number];

interface Vendor {
  id: number;
  name: string;
  role: VendorTab;
  avatar: string;
}

const ALL_VENDORS: Vendor[] = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  name: "Bob Henderson",
  role: VENDOR_TABS[i % VENDOR_TABS.length],
  avatar: `https://api.dicebear.com/9.x/avataaars/png?seed=Vendor${i}&size=40&backgroundColor=b6e3f4`,
}));

const DESIGNATIONS = ["Architect", "Designer", "Builder", "General Vendor"] as const;

function AddVendorModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vendor-title"
        className="bg-background rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="add-vendor-title" className="text-lg font-bold">
            Add Vendor
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="vendor-first"
              className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
            >
              First Name
            </label>
            <input
              id="vendor-first"
              type="text"
              placeholder="Jonathan"
              className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="vendor-last"
              className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
            >
              Last Name
            </label>
            <input
              id="vendor-last"
              type="text"
              placeholder="Jonathan"
              className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="vendor-email"
              className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
            >
              Email Address
            </label>
            <input
              id="vendor-email"
              type="email"
              placeholder="client@example.com"
              className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="vendor-designation"
              className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground"
            >
              Designation
            </label>
            <select
              id="vendor-designation"
              defaultValue="Architect"
              className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition appearance-none"
            >
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <X size={14} />
            Cancle
          </button>
          <button
            type="button"
            className="flex-1 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            Add Vendor
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorRow({ vendor }: { vendor: Vendor }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="size-10 rounded-full overflow-hidden bg-muted shrink-0">
        <Image
          src={vendor.avatar}
          alt={vendor.name}
          width={40}
          height={40}
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">{vendor.name}</p>
        <p className="text-xs text-muted-foreground">{vendor.role}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
          style={{ background: `linear-gradient(to bottom, #865B15, #E1C283)` }}
        >
          View Details
        </button>
        <button
          type="button"
          className="px-4 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors ml-auto"
        >
          Block
        </button>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState<VendorTab>("Architect");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = ALL_VENDORS.filter((v) => v.role === activeTab);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageVendors = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleTabChange(tab: VendorTab) {
    setActiveTab(tab);
    setPage(1);
  }

  function pageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} />}
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="font-bold">All </span>
            <span className="text-muted-foreground font-normal">Vendor</span>
          </h1>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-6 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Add Vendor
            <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
              <PlusIcon size={16} className="text-white" />
            </span>
          </button>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Animated tabs */}
          <div className="relative flex gap-0 border-b border-border px-5">
            {VENDOR_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className="relative px-4 py-3 text-sm font-medium transition-colors z-10"
                style={{
                  color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {tab}
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 origin-left"
                  style={{
                    backgroundColor: "var(--foreground)",
                    transform: activeTab === tab ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
              </button>
            ))}
          </div>

          {/* List */}
          <div className="px-5">
            {pageVendors.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No vendors found.</p>
            ) : (
              pageVendors.map((v) => <VendorRow key={v.id} vendor={v} />)
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {pageNumbers().map((p, i) =>
                p === "..." ? (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis separator
                    key={`ellipsis-${i}`}
                    className="px-1 text-xs text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className="size-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
                    style={
                      page === p
                        ? { backgroundColor: GOLD, color: "#fff", borderColor: GOLD }
                        : {}
                    }
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
                className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

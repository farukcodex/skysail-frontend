"use client";

import { ChevronLeft, ChevronRight, PlusIcon, Loader2, Search, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { AddVendorModal } from "./components/AddVendorModal";
import { EditVendorModal } from "./components/EditVendorModal";
import { VendorDetailsModal } from "./components/VendorDetailsModal";

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

const VENDOR_TABS = ["All", "Architect", "Designer", "Builder", "General Vendor"] as const;
export type VendorTab = (typeof VENDOR_TABS)[number];

export interface Vendor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation: VendorTab;
  creationDate: string;
  avatar: string;
  status: string;
  projects?: { id: number; name: string }[];
  milestones?: { id: number; name: string; completion_percent: number; status: string; project_name: string | null }[];
}

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState<VendorTab>("All");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/vendors?page=${page}&search=${encodeURIComponent(searchQuery)}&designation=${encodeURIComponent(activeTab)}&per_page=${PAGE_SIZE}`);
      const data = await res.json();
      if (res.ok) {
        setVendors(data.data);
        setTotalPages(data.meta.last_page);
        setTotalItems(data.meta.total);
      } else {
        console.error("Failed to fetch vendors", data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, activeTab]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleBlockToggle = async (vendorId: number) => {
    try {
      const res = await apiFetch(`/api/admin/vendors/${vendorId}/block`, {
        method: "POST"
      });
      if (res.ok) {
        fetchVendors();
      }
    } catch (err) {
      console.error(err);
    }
  };



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
      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} onSuccess={fetchVendors} />}
      {viewVendor && (
        <VendorDetailsModal
          vendor={viewVendor}
          onClose={() => setViewVendor(null)}
        />
      )}
      {editVendor && (
        <EditVendorModal
          vendor={editVendor}
          onClose={() => setEditVendor(null)}
          onSuccess={fetchVendors}
        />
      )}

      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-muted-foreground font-normal">All </span>
            Vendor
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-background border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center justify-center gap-6 w-full sm:w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
            >
              Add Vendor
              <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
                <PlusIcon size={16} className="text-white" />
              </span>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          {/* Animated tabs */}
          <div className="relative flex gap-0 border-b border-border px-5 overflow-x-auto scrollbar-hide">
            {VENDOR_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className="relative px-4 py-3 text-sm font-medium transition-colors z-10 whitespace-nowrap"
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
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-muted-foreground" size={40} />
              </div>
            ) : vendors.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No vendors found.</p>
            ) : (
              vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                  <div className="size-10 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {vendor.avatar ? (
                      <Image
                        src={vendor.avatar}
                        alt={`${vendor.firstName} ${vendor.lastName}`}
                        width={40}
                        height={40}
                        className="object-cover size-full"
                        unoptimized
                      />
                    ) : (
                      vendor.firstName?.[0] || 'V'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight flex items-center gap-2 truncate">
                      {vendor.firstName} {vendor.lastName}
                      {vendor.status === 'blocked' && (
                        <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Blocked</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {vendor.email}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground/80 truncate mt-0.5">
                      {vendor.designation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewVendor(vendor)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-background bg-linear-to-b from-[#865B15] to-[#E1C283]"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditVendor(vendor)}
                      className="px-4 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/messages?vendor_id=${vendor.id}`}
                      className="px-4 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                    >
                      Message
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleBlockToggle(vendor.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors ml-auto"
                    >
                      {vendor.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalItems > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">{totalItems}</span>
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
          )}
        </div>
      </div>
    </div>
  );
}

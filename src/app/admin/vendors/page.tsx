"use client";

import { PlusIcon, Loader2, Search, MessageSquare, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Pagination } from "@/components/shared/Pagination";
import { AddVendorModal } from "./components/AddVendorModal";
import { EditVendorModal } from "./components/EditVendorModal";
import { VendorDetailsModal } from "./components/VendorDetailsModal";
import { ConfirmBlockModal } from "./components/ConfirmBlockModal";
import { NotifyUsersModal } from "@/components/shared/NotifyUsersModal";

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
  const [showNotify, setShowNotify] = useState(false);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [vendorToBlock, setVendorToBlock] = useState<Vendor | null>(null);

  const fetchVendors = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
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
      if (!silent) setIsLoading(false);
    }
  }, [page, searchQuery, activeTab]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const executeBlockToggle = async (vendorId: number) => {
    try {
      const res = await apiFetch(`/api/admin/vendors/${vendorId}/block`, {
        method: "POST"
      });
      if (res.ok) {
        fetchVendors(true);
      }
    } catch (err) {
      console.error(err);
    }
  };



  function handleTabChange(tab: VendorTab) {
    setActiveTab(tab);
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} onSuccess={() => {
        if (page === 1 && searchQuery === "") {
          fetchVendors();
        } else {
          setPage(1);
          setSearchQuery("");
        }
      }} />}
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
      {vendorToBlock && (
        <ConfirmBlockModal
          vendor={vendorToBlock}
          onClose={() => setVendorToBlock(null)}
          onConfirm={() => executeBlockToggle(vendorToBlock.id)}
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
              onClick={() => setShowNotify(true)}
              className="flex items-center justify-center gap-6 w-full sm:w-fit bg-secondary border border-border text-foreground rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
            >
              Notify Vendors
              <span className="flex items-center justify-center bg-background border border-border rounded-full w-9 h-9">
                <Bell size={16} className="text-foreground" />
              </span>
            </button>
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

        {/* Animated tabs */}
        <div className="relative flex gap-0 border-b border-border overflow-x-auto scrollbar-hide mb-6">
          {VENDOR_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className="relative px-6 py-4 text-sm font-medium transition-colors z-10 whitespace-nowrap"
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
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
            {vendors.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground md:col-span-2 lg:col-span-3">No vendors found.</p>
            ) : (
              vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex flex-col h-full w-full gap-4 p-5 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className="size-14 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {vendor.avatar ? (
                        <Image
                          src={vendor.avatar}
                          alt={`${vendor.firstName} ${vendor.lastName}`}
                          width={56}
                          height={56}
                          className="object-cover size-full"
                          unoptimized
                        />
                      ) : (
                        vendor.firstName?.[0] || 'V'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold leading-tight flex items-center gap-2 truncate">
                        {vendor.firstName} {vendor.lastName}
                        {vendor.status === 'blocked' && (
                          <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Blocked</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {vendor.email}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground/80 truncate mt-1">
                        {vendor.designation}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full pt-4 border-t border-border mt-auto">
                    <button
                      type="button"
                      onClick={() => setViewVendor(vendor)}
                      className="text-xs font-bold px-4 py-2 rounded-full text-background bg-linear-to-b from-[#865B15] to-[#E1C283] hover:opacity-90 transition-opacity"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditVendor(vendor)}
                      className="text-xs font-bold px-4 py-2 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/admin/messages?vendor_id=${vendor.id}`}
                      className="px-4 py-2 rounded-full border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                    >
                      Message
                    </Link>
                    <button
                      type="button"
                      onClick={() => setVendorToBlock(vendor)}
                      className="text-xs font-bold px-4 py-2 text-red-500 hover:opacity-70 transition-opacity ml-auto"
                    >
                      {vendor.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>

      <NotifyUsersModal
        isOpen={showNotify}
        onClose={() => setShowNotify(false)}
        users={vendors.map(v => ({ id: v.id, firstName: v.firstName, lastName: v.lastName, email: v.email }))}
        userType="vendor"
      />
    </div>
  );
}

"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { NavLink } from "./app-sidebar";
import { VENDOR_NAV_SECTIONS } from "./vendor-sidebar";
import { useLogout } from "@/hooks/useLogout";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";

export function VendorAppSidebar() {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const getAvatarUrl = (path: string | null, name: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
    return `${baseUrl}/storage/${path}`;
  };

  const getInitials = (name: string) => {
    if (!name) return "VN";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="flex flex-col h-full w-full bg-foreground overflow-hidden">
      {/* Logo */}
      <div className="flex justify-center pt-8 pb-6 px-4">
        <Image
          src="/image/logo.svg"
          alt="Skysail Coastal Estates"
          width={100}
          height={38}
          className="object-contain"
          priority
        />
      </div>

      {/* User profile */}
      <div className="flex flex-col items-center gap-2 px-4 pb-6">
        <div className="ring-2 ring-[#C49A3C] ring-offset-2 ring-offset-foreground rounded-full">
          <Avatar size="lg" className="size-14">
            <AvatarImage
              src={getAvatarUrl(user?.profile_photo_path || user?.avatar, user?.name || user?.firstName)}
              alt={user?.name || user?.firstName || "Vendor"}
            />
            <AvatarFallback className="bg-white/10 text-white">
              {getInitials(user?.name || user?.firstName)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white leading-tight">
            {user?.name || user?.firstName ? (user?.name || `${user.firstName} ${user.lastName || ''}`) : "Vendor User"}
          </p>
          <p className="text-xs text-white/40 mt-0.5">SkySail Vendor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {VENDOR_NAV_SECTIONS.map((section, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          <div key={i} className="flex flex-col gap-0.5">
            {section.label && (
              <p className="text-[9px] font-semibold tracking-widest uppercase text-white/25 px-3 mb-1 mt-3">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Log Out */}
      <div className="px-3 py-5 border-t border-white/10">
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          <span>{isLoggingOut ? "Logging Out..." : "Log Out"}</span>
        </button>
      </div>
    </aside>
  );
}

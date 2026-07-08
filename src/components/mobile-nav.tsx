"use client";

import { LogOut, MenuIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ADMIN_NAV_SECTIONS } from "./admin-sidebar";
import { NavLink } from "./app-sidebar";
import { NAV_SECTIONS } from "./user-sidebar";
import { VENDOR_NAV_SECTIONS } from "./vendor-sidebar";
import { useLogout } from "@/hooks/useLogout";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout, isLoggingOut } = useLogout();
  const isAdminPath = pathname.startsWith("/admin");
  const isVendorPath = pathname.startsWith("/vendor");
  const isClientPath = pathname.startsWith("/client");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isEffectiveAdmin = isAdminPath || (!isVendorPath && !isClientPath && user?.role === "admin");
  const isEffectiveVendor = isVendorPath || (!isAdminPath && !isClientPath && user?.role && user.role !== "admin" && user.role !== "client");

  const sections = isEffectiveAdmin
    ? ADMIN_NAV_SECTIONS
    : isEffectiveVendor
      ? VENDOR_NAV_SECTIONS
      : NAV_SECTIONS;

  const getAvatarUrl = (path: string | null, name: string) => {
    const defaultName = isEffectiveAdmin ? 'Admin' : (isEffectiveVendor ? 'Vendor' : 'Client');
    if (!path) return `https://api.dicebear.com/10.x/micah/svg?seed=${name?.replace(/ /g, '') || defaultName}&backgroundColor=b6e3f4`;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
    return `${baseUrl}/storage/${path}`;
  };

  const getInitials = (name: string) => {
    const defaultInitials = isEffectiveAdmin ? 'AD' : (isEffectiveVendor ? 'VN' : 'CL');
    if (!name) return defaultInitials;
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-foreground border-white/10 w-64 p-0 flex flex-col overflow-hidden"
      >
        {/* Glow — mirrors sidebar */}
        <div className="bg-radial from-[#A46909]/60 to-transparent absolute -top-40 -left-40 w-96 h-96 blur-3xl rounded-full pointer-events-none" />

        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

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
                alt={user?.name || user?.firstName || "User"}
              />
              <AvatarFallback className="bg-white/10 text-white">
                {getInitials(user?.name || user?.firstName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white leading-tight">
              {user?.name || user?.firstName ? (user?.name || `${user.firstName} ${user.lastName || ''}`) : (isEffectiveAdmin ? "Admin User" : (isEffectiveVendor ? "Vendor User" : "Client User"))}
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              {isEffectiveAdmin ? "SkySail Operations" : (isEffectiveVendor ? "SkySail Vendor" : "SkySail Client")}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 flex flex-col gap-5 overflow-y-auto">
          {sections.map((section, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <div key={i} className="flex flex-col gap-0.5">
              {section.label && (
                <p className="text-[9px] font-semibold tracking-widest uppercase text-white/25 px-3 mb-1">
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
        <div className="px-5 py-6 border-t border-white/10 mt-auto shrink-0">
          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
          >
            <LogOut size={18} />
            <span>{isLoggingOut ? "Logging Out..." : "Log Out"}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

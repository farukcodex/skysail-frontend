"use client";

import { LogOut, MenuIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

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

export function MobileNav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isVendor = pathname.startsWith("/vendor");
  const sections = isAdmin ? ADMIN_NAV_SECTIONS : isVendor ? VENDOR_NAV_SECTIONS : NAV_SECTIONS;

  return (
    <Sheet>
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
            src="/image/logo.webp"
            alt="Skysail Coastal Estates"
            width={100}
            height={38}
            className="object-contain invert"
            priority
          />
        </div>

        {/* User profile */}
        <div className="flex flex-col items-center gap-2 px-4 pb-6">
          <div className="ring-2 ring-[#C49A3C] ring-offset-2 ring-offset-foreground rounded-full">
            <Avatar size="lg" className="size-14">
              <AvatarImage
                src="https://api.dicebear.com/10.x/micah/svg?seed=Felix"
                alt="Bob Henderson"
              />
              <AvatarFallback className="bg-white/10 text-white">
                BH
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white leading-tight">
              Bob Henderson
            </p>
            <p className="text-xs text-white/40 mt-0.5">New York, USA</p>
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
        <div className="px-3 py-5 border-t border-white/10">
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

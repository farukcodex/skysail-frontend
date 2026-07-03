import { VendorAppSidebar } from "@/components/vendor-app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh w-full bg-foreground">
      {/* Sidebar */}
      <div className="sticky top-0 w-64 shrink-0 hidden md:flex flex-col h-dvh">
        {/* Glow */}
        <div className="bg-radial from-[#A46909]/60 to-transparent absolute -top-40 -left-40 w-96 h-96 blur-3xl rounded-full pointer-events-none" />
        <VendorAppSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 bg-background overflow-hidden min-h-dvh">
        {/* ── Top bar ── */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-8 border-b border-border">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3 border-l pl-4">
            <div className="text-right">
              <Link
                href="/profile"
                className="text-sm font-bold bg-linear-to-r from-[#C49A3C] to-[#A46909] bg-clip-text text-transparent"
              >
                Bob Henderson
              </Link>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                Interior Designer
              </p>
            </div>
            <div className="relative ml-2">
              <Link href="/notifications">
                <BellIcon size={16} />
              </Link>
              <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500 ring-2 ring-background" />
            </div>
          </div>
        </header>
        {children}
        {/* ── Footer ── */}
        <footer className="px-6 lg:px-8 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
            © 2026 Skysail Coastal Rstates
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms and Conditions
            </Link>
          </div>
        </footer>
      </main>
    </div>
    </AuthGuard>
  );
}

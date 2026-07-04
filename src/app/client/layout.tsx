import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { TopNavProfile } from "@/components/top-nav-profile";

export default function ViewLayout({
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
        <AppSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 bg-background overflow-hidden min-h-dvh">
        {/* ── Top bar ── */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-8 border-b border-border">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="hidden md:block" />
          <TopNavProfile defaultRole="Client" messagesLink="/client/messages" hideMessages={true} />
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
              Privacy Poilicy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms and Condition
            </Link>
          </div>
        </footer>
      </main>
    </div>
    </AuthGuard>
  );
}

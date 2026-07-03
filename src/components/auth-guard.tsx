"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const user = getUser();
      const role = user?.role || "";

      if (pathname.startsWith("/admin") && role !== "admin") {
        router.push("/");
        return;
      }
      
      if (pathname.startsWith("/vendor") && !role.startsWith("vendor_")) {
        router.push("/");
        return;
      }

      if (pathname.startsWith("/client") && (role === "admin" || role.startsWith("vendor_"))) {
        router.push("/");
        return;
      }

      setIsChecking(false);
    };
    checkAuth();
    
    // Also listen for focus events in case they logged out in another tab
    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, [pathname, router]);

  // Aggressive check during render to thwart Next.js client-side route caching (Back button)
  if (typeof window !== "undefined") {
    const token = getToken();
    const user = getUser();
    const role = user?.role || "";
    
    let blocked = false;
    if (!token) blocked = true;
    else if (pathname.startsWith("/admin") && role !== "admin") blocked = true;
    else if (pathname.startsWith("/vendor") && !role.startsWith("vendor_")) blocked = true;
    else if (pathname.startsWith("/client") && (role === "admin" || role.startsWith("vendor_"))) blocked = true;

    if (blocked) {
      return (
        <div className="flex h-dvh w-full items-center justify-center bg-background">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      );
    }
  }

  if (isChecking) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}

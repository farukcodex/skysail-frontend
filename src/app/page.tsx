"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const user = getUser();
    if (user?.role === "admin") {
      router.push("/admin");
    } else if (user?.role?.startsWith("vendor_")) {
      router.push("/vendor");
    } else {
      router.push("/client");
    }
  }, [router]);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background">
      <Loader2 className="animate-spin text-muted-foreground" size={32} />
    </div>
  );
}

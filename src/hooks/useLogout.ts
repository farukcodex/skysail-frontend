import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuth, getToken } from "@/lib/auth";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const token = getToken();
      if (token) {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
        await fetch(`${baseUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      clearAuth();
      router.push("/auth/login");
    }
  };

  return { logout, isLoggingOut };
}

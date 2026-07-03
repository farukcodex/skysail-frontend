import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuth, getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const token = getToken();
      if (token) {
        await apiFetch(`/api/auth/logout`, {
          method: "POST"
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

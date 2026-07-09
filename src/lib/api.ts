/**
 * Centralized API Fetch Wrapper
 * Automatically handles Base URL, auth tokens, JSON headers, and 401 interception.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });

  // Intercept 401 Unauthorized globally
  if (res.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
      // User's token expired or is invalid. Log them out.
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
  }

  return res;
}

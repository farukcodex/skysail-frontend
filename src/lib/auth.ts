export function getToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function setAuth(token: string, user: any, remember: boolean) {
  if (typeof window === "undefined") return;
  if (remember) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  } else {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

const DEFAULT_API_PATH = "/api";

export function apiBase() {
  return String(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_PATH).replace(/\/$/, "");
}

export function apiOrigin() {
  const base = apiBase();
  if (!base.startsWith("http")) return "";
  return base.replace(/\/api$/i, "");
}

export function apiUrl(path = "") {
  const suffix = String(path).startsWith("/") ? String(path) : `/${path}`;
  return `${apiBase()}${suffix}`;
}

export function api(path, options = {}) {
  return fetch(apiUrl(path), { credentials: "include", ...options });
}

const DEFAULT_API_PATH = "/api";

function configuredBase() {
  return String(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_PATH).replace(/\/$/, "");
}

export function apiBase() {
  const configured = configuredBase();
  if (typeof window !== "undefined" && configured.startsWith("http")) {
    try {
      if (new URL(configured).origin !== window.location.origin) {
        return DEFAULT_API_PATH;
      }
    } catch {
      return DEFAULT_API_PATH;
    }
  }
  return configured || DEFAULT_API_PATH;
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

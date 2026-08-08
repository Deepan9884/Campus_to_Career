const API_BASE = import.meta.env.VITE_API_URL || "/api";

let accessToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem("cf-admin-token") : null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem("cf-admin-token", token);
  else localStorage.removeItem("cf-admin-token");
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  statusCode: number;
  errors: string[];
  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers, credentials: "include" });

  let json: any;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError(
      res.status || 500,
      res.ok ? "Invalid response format" : `Server error (${res.status})`
    );
  }

  if (!res.ok || json.success === false) {
    if (res.status === 401 || json.message === "Invalid token" || json.message === "Authentication token is required") {
      setAccessToken(null);
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    throw new ApiError(
      json.statusCode || res.status,
      json.message || "Request failed",
      json.errors || []
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
};

// lib/api-client.ts
const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await response.json();
      if (typeof data === "string") return data;
      if (typeof data?.detail === "string") return data.detail;
      if (Array.isArray(data?.detail)) {
        const firstDetail = data.detail[0];
        if (typeof firstDetail?.msg === "string") return firstDetail.msg;
      }
      return JSON.stringify(data);
    } catch {
      // fall back to text below
    }
  }

  const text = await response.text();
  return text || `Request failed with status ${response.status}`;
};

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Auth endpoints must never trigger the refresh-and-retry flow (a 401 from them is
// a genuine auth failure, and refreshing on /auth/refresh would recurse).
const AUTH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
];

// A single in-flight refresh shared by every request that 401s at the same time,
// so an expired access token triggers exactly one /auth/refresh, not one per call.
let refreshPromise: Promise<boolean> | null = null;

const refreshSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${getApiUrl()}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const api = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const apiUrl = getApiUrl();

  const doFetch = () =>
    fetch(`${apiUrl}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

  try {
    let response = await doFetch();

    // Transparent access-token renewal: on a 401 (expired access token), try a
    // single refresh using the refresh-token cookie, then replay the request once.
    if (response.status === 401 && !AUTH_PATHS.some((p) => path.startsWith(p))) {
      const refreshed = await refreshSession();
      if (refreshed) {
        response = await doFetch();
      }
    }

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message) {
      if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
        throw new Error("Unable to reach the server. Please check your connection and try again.");
      }
      throw error;
    }

    throw new Error("Unexpected request error");
  }
};

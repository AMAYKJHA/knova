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

export const api = async <T>(path: string, options?: RequestInit): Promise<T> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message) {
      if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
        throw new Error("Unable to reach the server. Make sure the backend is running on localhost:8000.");
      }
      throw error;
    }

    throw new Error("Unexpected request error");
  }
};
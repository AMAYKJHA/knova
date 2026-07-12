// lib/api-client.ts
export const api = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};
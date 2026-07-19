// lib/interests.ts

import { api } from "@/lib/api";

export interface Interest {
  topic_id: string;
  name: string;
  affinity_score: number;
  source: string | null;
}

interface InterestListResponse {
  interests: Interest[];
}

// The current user's interest topics (drives the recommendation feed).
export const getMyInterests = async (): Promise<Interest[]> => {
  const res = await api<InterestListResponse>("/api/v1/users/me/interests");
  return res.interests;
};

// Replace the user's explicit interests with the given topic names.
export const updateMyInterests = async (names: string[]): Promise<Interest[]> => {
  const res = await api<InterestListResponse>("/api/v1/users/me/interests", {
    method: "PUT",
    body: JSON.stringify({ interests: names }),
  });
  return res.interests;
};

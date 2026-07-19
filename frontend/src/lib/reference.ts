// lib/reference.ts

import { api } from "@/lib/api";

export interface Topic {
  id: string;
  name: string;
  parent_id: string | null;
}

interface TopicListResponse {
  topics: Topic[];
  total: number;
}

// Fetches the full topic vocabulary. The onboarding picker relies on this so its
// options always match the DB/model topics (the names are saved as interests and
// must resolve to a Topic row + exist in the TF-IDF training vocabulary).
export const getTopics = async (): Promise<Topic[]> => {
  const res = await api<TopicListResponse>("/api/v1/reference/topics");
  return res.topics;
};

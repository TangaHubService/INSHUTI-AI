export type Language = "EN" | "RW";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export interface ChatTopic {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
}

export interface ChatSource {
  id: string;
  titleEn: string;
  titleRw: string;
}

export interface ChatResponse {
  reply: string;
  topic: ChatTopic | null;
  sources: ChatSource[];
  quickReplies: string[];
}

export async function sendChatMessage(message: string, language: Language): Promise<ChatResponse> {
  const res = await apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, language }),
  });
  if (!res.ok) {
    throw new Error(`Chat request failed (${res.status})`);
  }
  return res.json();
}

export interface HistoryTopic {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
  icon: string;
  colorToken: string;
}

export interface ConversationSummary {
  id: string;
  createdAt: string;
  language: Language;
  firstUserMessage: string | null;
  topic: HistoryTopic | null;
}

export interface TopicCount {
  topic: Pick<HistoryTopic, "id" | "slug" | "nameEn" | "nameRw" | "colorToken"> | null;
  count: number;
}

export interface HistoryResponse {
  conversations: ConversationSummary[];
  topicCounts: TopicCount[];
}

export async function getHistory(): Promise<HistoryResponse> {
  const res = await apiFetch("/api/history");
  if (!res.ok) {
    throw new Error(`History request failed (${res.status})`);
  }
  return res.json();
}

export async function clearHistory(): Promise<void> {
  const res = await apiFetch("/api/history", { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Clear history failed (${res.status})`);
  }
}

export interface Suggestion {
  tag: string;
  title: string;
  body: string;
  ctaText: string;
  topicSlug: string | null;
}

export async function getSuggestions(language: Language): Promise<Suggestion[]> {
  const res = await apiFetch(`/api/suggestions?language=${language}`);
  if (!res.ok) {
    throw new Error(`Suggestions request failed (${res.status})`);
  }
  const data: { suggestions: Suggestion[] } = await res.json();
  return data.suggestions;
}

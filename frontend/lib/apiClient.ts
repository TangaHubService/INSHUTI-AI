export type Language = "EN" | "RW" | "FR" | "SW";

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
  bodySnippet?: string;
  externalUrl?: string | null;
}

export interface ChatResponse {
  conversationId?: string;
  reply: string;
  topic: ChatTopic | null;
  sources: ChatSource[];
  quickReplies: string[];
  canRequestHumanFollowUp?: boolean;
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

export interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  topic: {
    id: string;
    slug: string;
    nameEn: string;
    nameRw: string;
  } | null;
}

export interface ConversationDetail {
  id: string;
  language: Language;
  createdAt: string;
  messages: ConversationMessage[];
}

export async function getConversationMessages(conversationId: string): Promise<ConversationDetail> {
  const res = await apiFetch(`/api/chat/conversations/${conversationId}`);
  if (!res.ok) {
    throw new Error(`Failed to load conversation (${res.status})`);
  }
  const data: { conversation: ConversationDetail } = await res.json();
  return data.conversation;
}

export interface CrisisResource {
  id: string;
  name: string;
  contact: string;
  region: string;
  order: number;
}

export async function getCrisisResources(): Promise<CrisisResource[]> {
  const res = await apiFetch("/api/chat/crisis-resources");
  if (!res.ok) {
    throw new Error(`Crisis resources request failed (${res.status})`);
  }
  const data: { resources: CrisisResource[] } = await res.json();
  return data.resources;
}

export type FacilityType = "HOSPITAL" | "HEALTH_CENTRE" | "CLINIC" | "PHARMACY";

export interface HealthFacility {
  id: string;
  name: string;
  type: FacilityType;
  latitude: number;
  longitude: number;
  district: string;
  sector: string;
  services: string[];
  contact: string | null;
}

export async function getFacilities(filters?: { type?: FacilityType; district?: string; search?: string }): Promise<{
  facilities: HealthFacility[];
  facilityTypes: FacilityType[];
}> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.district) params.set("district", filters.district);
  if (filters?.search) params.set("search", filters.search);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/api/facilities${query}`);
  if (!res.ok) throw new Error(`Facilities request failed (${res.status})`);
  return res.json();
}

export interface ContactInquiryResult {
  id: string;
  createdAt: string;
}

export async function sendContactInquiry(input: { name: string; email: string; message: string }): Promise<ContactInquiryResult> {
  const res = await apiFetch("/api/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to send message");
  }
  const data: { inquiry: ContactInquiryResult } = await res.json();
  return data.inquiry;
}

export interface PublicLibraryTopic {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
  nameFr: string;
  nameSw: string;
  icon: string;
  colorToken: string;
  articleCount: number;
}

export interface PublicLibraryArticle {
  id: string;
  topicId: string;
  topic: { id: string; slug: string; nameEn: string; nameRw: string };
  title: string;
  body: string;
  tags: string[];
  externalUrl: string | null;
  reviewedAt: string | null;
  updatedAt: string;
}

export async function getPublicLibraryTopics(): Promise<PublicLibraryTopic[]> {
  const res = await apiFetch("/api/library/topics");
  if (!res.ok) throw new Error(`Failed to load library topics (${res.status})`);
  const data: { topics: PublicLibraryTopic[] } = await res.json();
  return data.topics;
}

export async function getPublicLibraryArticle(id: string, language: string): Promise<PublicLibraryArticle> {
  const res = await apiFetch(`/api/library/articles/${id}?language=${language}`);
  if (!res.ok) throw new Error(`Failed to load article (${res.status})`);
  const data: { article: PublicLibraryArticle } = await res.json();
  return data.article;
}

export async function getPublicLibraryArticles(language: string, topicId?: string): Promise<PublicLibraryArticle[]> {
  const params = new URLSearchParams({ language });
  if (topicId) params.set("topicId", topicId);
  const res = await apiFetch(`/api/library/articles?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load library articles (${res.status})`);
  const data: { articles: PublicLibraryArticle[] } = await res.json();
  return data.articles;
}

import { apiFetch, type Language } from "./apiClient";

export type AdminRole = "SUPER_ADMIN" | "CONTENT_REVIEWER" | "MODERATOR";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthorizedError";
  }
}

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await apiFetch(path, init);
  if (res.status === 401) {
    throw new UnauthorizedError();
  }
  return res;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Login failed");
  }
  const data: { admin: AdminUser } = await res.json();
  return data.admin;
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  const res = await adminFetch("/api/auth/me");
  if (!res.ok) throw new UnauthorizedError();
  const data: { admin: AdminUser } = await res.json();
  return data.admin;
}

export interface DashboardTopic {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
  colorToken: string;
}

export interface DashboardStats {
  totalConversations: number;
  totalSessions: number;
  mostAskedTopic: DashboardTopic | null;
  flaggedCount: number;
  languageSplit: Record<Language, number>;
  topicEngagement: { topic: DashboardTopic; count: number }[];
}

export async function getDashboard(): Promise<DashboardStats> {
  const res = await adminFetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export interface KbTopic {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
  icon: string;
  colorToken: string;
  articleCount: number;
  reviewedCount: number;
}

export async function getKbTopics(): Promise<KbTopic[]> {
  const res = await adminFetch("/api/kb/topics");
  if (!res.ok) throw new Error("Failed to load topics");
  const data: { topics: KbTopic[] } = await res.json();
  return data.topics;
}

export type ArticleStatus = "REVIEWED" | "NEEDS_REVIEW";

export interface KbArticle {
  id: string;
  topicId: string;
  titleEn: string;
  titleRw: string;
  titleFr: string;
  titleSw: string;
  bodyEn: string;
  bodyRw: string;
  bodyFr: string;
  bodySw: string;
  tags: string[];
  status: ArticleStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getKbArticles(topicId?: string): Promise<KbArticle[]> {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : "";
  const res = await adminFetch(`/api/kb/articles${query}`);
  if (!res.ok) throw new Error("Failed to load articles");
  const data: { articles: KbArticle[] } = await res.json();
  return data.articles;
}

export async function getKbArticle(id: string): Promise<KbArticle> {
  const res = await adminFetch(`/api/kb/articles/${id}`);
  if (!res.ok) throw new Error("Failed to load article");
  const data: { article: KbArticle } = await res.json();
  return data.article;
}

export async function createKbArticle(input: {
  topicId: string;
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  titleSw?: string;
  bodyEn?: string;
  bodyRw?: string;
  bodyFr?: string;
  bodySw?: string;
  tags?: string[];
}): Promise<KbArticle> {
  const res = await adminFetch("/api/kb/articles", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create article");
  }
  const data: { article: KbArticle } = await res.json();
  return data.article;
}

export async function updateKbArticle(
  id: string,
  input: Partial<Pick<KbArticle, "titleEn" | "titleRw" | "titleFr" | "titleSw" | "bodyEn" | "bodyRw" | "bodyFr" | "bodySw" | "tags" | "status">>,
): Promise<KbArticle> {
  const res = await adminFetch(`/api/kb/articles/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update article");
  }
  const data: { article: KbArticle } = await res.json();
  return data.article;
}

export async function deleteKbArticle(id: string): Promise<void> {
  const res = await adminFetch(`/api/kb/articles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete article");
}

export type FlagReason = "CRISIS_LANGUAGE" | "LOW_CONFIDENCE" | "USER_REPORTED";
export type FlagStatus = "FLAGGED" | "PENDING" | "RESOLVED";

export interface FlaggedItemSummary {
  id: string;
  reason: FlagReason;
  status: FlagStatus;
  reviewerNotes: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  messagePreview: string;
  topic: { id: string; nameEn: string; nameRw: string } | null;
  conversationLanguage: Language;
}

export async function getFlaggedItems(filters?: { reason?: FlagReason; status?: FlagStatus }): Promise<FlaggedItemSummary[]> {
  const params = new URLSearchParams();
  if (filters?.reason) params.set("reason", filters.reason);
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await adminFetch(`/api/flagged${query}`);
  if (!res.ok) throw new Error("Failed to load flagged items");
  const data: { items: FlaggedItemSummary[] } = await res.json();
  return data.items;
}

export interface FlaggedItemDetail {
  item: {
    id: string;
    reason: FlagReason;
    status: FlagStatus;
    reviewerNotes: string | null;
    resolvedBy: string | null;
    resolvedAt: string | null;
    createdAt: string;
    flaggedMessageId: string;
  };
  conversation: { id: string; language: Language; createdAt: string };
  transcript: { id: string; role: "USER" | "ASSISTANT"; content: string; createdAt: string }[];
}

export async function getFlaggedItem(id: string): Promise<FlaggedItemDetail> {
  const res = await adminFetch(`/api/flagged/${id}`);
  if (!res.ok) throw new Error("Failed to load flagged item");
  return res.json();
}

export async function updateFlaggedItem(
  id: string,
  input: { reviewerNotes?: string; status?: FlagStatus },
): Promise<void> {
  const res = await adminFetch(`/api/flagged/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) throw new Error("Failed to update flagged item");
}

export interface AppSettings {
  id: string;
  aiProvider: string;
  aiModel: string;
  responseStyleNote: string;
  restrictToKnowledgeBase: boolean;
  autoFlagCrisisLanguage: boolean;
  autoDetectLanguage: boolean;
}

export async function getSettings(): Promise<AppSettings> {
  const res = await adminFetch("/api/settings");
  if (!res.ok) throw new Error("Failed to load settings");
  const data: { settings: AppSettings } = await res.json();
  return data.settings;
}

export async function updateSettings(input: Partial<Omit<AppSettings, "id">>): Promise<AppSettings> {
  const res = await adminFetch("/api/settings", { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) throw new Error("Failed to update settings");
  const data: { settings: AppSettings } = await res.json();
  return data.settings;
}

export interface CrisisResource {
  id: string;
  name: string;
  contact: string;
  region: string;
  order: number;
}

export async function getCrisisResources(): Promise<CrisisResource[]> {
  const res = await adminFetch("/api/settings/crisis-resources");
  if (!res.ok) throw new Error("Failed to load crisis resources");
  const data: { resources: CrisisResource[] } = await res.json();
  return data.resources;
}

export async function createCrisisResource(input: Omit<CrisisResource, "id">): Promise<CrisisResource> {
  const res = await adminFetch("/api/settings/crisis-resources", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) throw new Error("Failed to create crisis resource");
  const data: { resource: CrisisResource } = await res.json();
  return data.resource;
}

export async function updateCrisisResource(id: string, input: Partial<Omit<CrisisResource, "id">>): Promise<CrisisResource> {
  const res = await adminFetch(`/api/settings/crisis-resources/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) throw new Error("Failed to update crisis resource");
  const data: { resource: CrisisResource } = await res.json();
  return data.resource;
}

export async function deleteCrisisResource(id: string): Promise<void> {
  const res = await adminFetch(`/api/settings/crisis-resources/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete crisis resource");
}

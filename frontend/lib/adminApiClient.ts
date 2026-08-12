import { apiFetch, type Language } from "./apiClient";
import { uploadFileWithProgress } from "./uploadClient";

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
  createdAt: string;
  updatedAt: string;
}

export type FacilityInput = Omit<HealthFacility, "id" | "createdAt" | "updatedAt">;

export async function getAdminFacilities(): Promise<HealthFacility[]> {
  const res = await adminFetch("/api/facilities");
  if (!res.ok) throw new Error("Failed to load facilities");
  const data: { facilities: HealthFacility[] } = await res.json();
  return data.facilities;
}

export async function createFacility(input: FacilityInput): Promise<HealthFacility> {
  const res = await adminFetch("/api/facilities", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create facility");
  }
  const data: { facility: HealthFacility } = await res.json();
  return data.facility;
}

export async function updateFacility(id: string, input: Partial<FacilityInput>): Promise<HealthFacility> {
  const res = await adminFetch(`/api/facilities/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update facility");
  }
  const data: { facility: HealthFacility } = await res.json();
  return data.facility;
}

export async function deleteFacility(id: string): Promise<void> {
  const res = await adminFetch(`/api/facilities/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete facility");
}

export type ManagedUserRole = "TEENAGER" | "PARENT_GUARDIAN" | "HEALTHCARE_PROFESSIONAL" | "GOVERNMENT_USER";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: ManagedUserRole;
  active: boolean;
  createdAt: string;
  healthcareProfessional: { id: string; professionalType: string; approvalStatus: ApprovalStatus } | null;
  governmentUser: { level: string; regionName: string } | null;
}

export async function getManagedUsers(role?: ManagedUserRole): Promise<ManagedUser[]> {
  const res = await adminFetch(`/api/admin/users${role ? `?role=${role}` : ""}`);
  if (!res.ok) throw new Error("Failed to load users");
  const data: { users: ManagedUser[] } = await res.json();
  return data.users;
}

export async function setUserActive(id: string, active: boolean): Promise<void> {
  const res = await adminFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ active }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update user");
  }
}

export async function setProfessionalApproval(userId: string, approvalStatus: ApprovalStatus): Promise<void> {
  const res = await adminFetch(`/api/admin/users/${userId}/approval`, { method: "PATCH", body: JSON.stringify({ approvalStatus }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update approval status");
  }
}

export interface ManagedAdmin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
}

export async function getManagedAdmins(): Promise<ManagedAdmin[]> {
  const res = await adminFetch("/api/admin/admins");
  if (!res.ok) throw new Error("Failed to load admin team");
  const data: { admins: ManagedAdmin[] } = await res.json();
  return data.admins;
}

export async function createManagedAdmin(input: { email: string; password: string; name: string; role: AdminRole }): Promise<ManagedAdmin> {
  const res = await adminFetch("/api/admin/admins", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create admin");
  }
  return res.json();
}

export async function updateManagedAdmin(id: string, input: Partial<{ name: string; role: AdminRole; active: boolean }>): Promise<ManagedAdmin> {
  const res = await adminFetch(`/api/admin/admins/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update admin");
  }
  return res.json();
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  adminId: string | null;
  adminEmail: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function getAuditLogs(params?: { page?: number; limit?: number }): Promise<{ logs: AuditLogEntry[]; pagination: AuditLogPagination }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const res = await adminFetch(`/api/audit-logs${query.toString() ? `?${query.toString()}` : ""}`);
  if (!res.ok) throw new Error("Failed to load audit logs");
  return res.json();
}

// --- Consultation Oversight (supervisory list only — never message content) ---

export interface AdminConsultationSummary {
  id: string;
  status: string;
  priority: number;
  userName: string;
  professionalName: string | null;
  professionalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminConsultations(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ consultations: AdminConsultationSummary[]; total: number; page: number; pageCount: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const res = await adminFetch(`/api/consultations/admin${query.toString() ? `?${query.toString()}` : ""}`);
  if (!res.ok) throw new Error("Failed to load consultations");
  return res.json();
}

export async function reassignConsultation(consultationId: string, professionalId: string): Promise<void> {
  const res = await adminFetch(`/api/consultations/${consultationId}/reassign`, { method: "PATCH", body: JSON.stringify({ professionalId }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to reassign consultation");
  }
}

export async function escalateConsultation(consultationId: string): Promise<void> {
  const res = await adminFetch(`/api/consultations/${consultationId}/escalate`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to escalate consultation");
  }
}

export interface ReassignableProfessional {
  id: string;
  name: string;
  professionalType: string;
}

export async function getConsultationProfessionals(): Promise<ReassignableProfessional[]> {
  const res = await adminFetch("/api/consultations/admin/professionals");
  if (!res.ok) throw new Error("Failed to load professionals");
  const data: { professionals: ReassignableProfessional[] } = await res.json();
  return data.professionals;
}

// --- Health Education Library ---

export interface HealthEducationAttachment {
  id: string;
  resourceId: string;
  originalFileName: string;
  fileName: string;
  fileUrl: string;
  secureUrl: string;
  publicId: string;
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  resourceType: "image" | "video" | "raw";
  sortOrder: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthEducationResource {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  topic: string;
  targetAudience: string;
  language: Language;
  tags: string[];
  author: string;
  publishedDate: string;
  thumbnailUrl: string | null;
  thumbnailSecureUrl: string | null;
  thumbnailPublicId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: HealthEducationAttachment[];
  attachmentCount?: number;
  availableFileTypes?: string[];
}

export type HealthEducationResourceInput = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  topic: string;
  targetAudience: string;
  language: Language;
  tags: string[];
  author: string;
  publishedDate: string;
};

export async function getHealthEducationResources(filters?: {
  search?: string;
  category?: string;
  topic?: string;
  language?: string;
  page?: number;
  limit?: number;
}): Promise<{ resources: HealthEducationResource[]; total: number; page: number; pageCount: number }> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.topic) params.set("topic", filters.topic);
  if (filters?.language) params.set("language", filters.language);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await adminFetch(`/api/health-education/resources${query}`);
  if (!res.ok) throw new Error("Failed to load resources");
  return res.json();
}

export async function getHealthEducationResource(id: string): Promise<HealthEducationResource> {
  const res = await adminFetch(`/api/health-education/resources/${id}`);
  if (!res.ok) throw new Error("Failed to load resource");
  const data: { resource: HealthEducationResource } = await res.json();
  return data.resource;
}

export async function createHealthEducationResource(input: HealthEducationResourceInput): Promise<HealthEducationResource> {
  const res = await adminFetch("/api/health-education/resources", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create resource");
  }
  const data: { resource: HealthEducationResource } = await res.json();
  return data.resource;
}

export async function updateHealthEducationResource(
  id: string,
  input: Partial<HealthEducationResourceInput>,
): Promise<HealthEducationResource> {
  const res = await adminFetch(`/api/health-education/resources/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update resource");
  }
  const data: { resource: HealthEducationResource } = await res.json();
  return data.resource;
}

export async function deleteHealthEducationResource(id: string): Promise<void> {
  const res = await adminFetch(`/api/health-education/resources/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete resource");
}

export async function deleteHealthEducationThumbnail(resourceId: string): Promise<HealthEducationResource> {
  const res = await adminFetch(`/api/health-education/resources/${resourceId}/thumbnail`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove thumbnail");
  const data: { resource: HealthEducationResource } = await res.json();
  return data.resource;
}

export async function deleteHealthEducationAttachment(attachmentId: string): Promise<void> {
  const res = await adminFetch(`/api/health-education/attachments/${attachmentId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete attachment");
}

export async function reorderHealthEducationAttachments(resourceId: string, attachmentIds: string[]): Promise<void> {
  const res = await adminFetch(`/api/health-education/resources/${resourceId}/attachments/order`, {
    method: "PATCH",
    body: JSON.stringify({ attachmentIds }),
  });
  if (!res.ok) throw new Error("Failed to reorder attachments");
}

// Multipart uploads use XHR (via uploadFileWithProgress) for real progress
// events and a working Cancel button — adminFetch's JSON fetch() wrapper
// can't report upload progress. Cookies still ride along (withCredentials).

export function uploadHealthEducationThumbnail(resourceId: string, file: File, onProgress?: (pct: number) => void) {
  const formData = new FormData();
  formData.append("thumbnail", file);
  return uploadFileWithProgress(`/api/health-education/resources/${resourceId}/thumbnail`, "POST", formData, onProgress);
}

export function uploadHealthEducationAttachment(resourceId: string, file: File, onProgress?: (pct: number) => void) {
  const formData = new FormData();
  formData.append("file", file);
  return uploadFileWithProgress(`/api/health-education/resources/${resourceId}/attachments`, "POST", formData, onProgress);
}

export function replaceHealthEducationAttachment(attachmentId: string, file: File, onProgress?: (pct: number) => void) {
  const formData = new FormData();
  formData.append("file", file);
  return uploadFileWithProgress(`/api/health-education/attachments/${attachmentId}/replace`, "PUT", formData, onProgress);
}

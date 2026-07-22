import { apiFetch } from "./apiClient";

export type UserRole = "TEENAGER" | "PARENT_GUARDIAN" | "HEALTHCARE_PROFESSIONAL" | "GOVERNMENT_USER";
export type ProfessionalType = "CHW" | "NURSE" | "MIDWIFE" | "PSYCHOLOGIST" | "DOCTOR";
export type GovLevel = "NATIONAL" | "PROVINCIAL" | "DISTRICT" | "SECTOR" | "CELL";

export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: UserRole;
  preferredLanguage: string;
  healthcareProfessional: {
    professionalType: ProfessionalType;
    specialization: string | null;
    approvalStatus: string;
  } | null;
  governmentUser: {
    level: GovLevel;
    regionName: string;
  } | null;
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  preferredLanguage?: string;
  professionalType?: ProfessionalType;
  specialization?: string;
  govLevel?: GovLevel;
  regionName?: string;
}): Promise<UserProfile> {
  const res = await apiFetch("/api/users/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Registration failed");
  }
  const data: { user: UserProfile } = await res.json();
  return data.user;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const res = await apiFetch("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Login failed");
  }
  const data: { user: UserProfile } = await res.json();
  return data.user;
}

export async function logoutUser(): Promise<void> {
  await apiFetch("/api/users/logout", { method: "POST" });
}

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "HEALTHCARE_PROFESSIONAL":
      return "/professional";
    case "GOVERNMENT_USER":
      return "/government";
    case "PARENT_GUARDIAN":
      return "/parent";
    default:
      return "/dashboard";
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const res = await apiFetch("/api/users/me");
  if (!res.ok) return null;
  const data: { user: UserProfile } = await res.json();
  return data.user;
}

export async function updateProfile(input: { name?: string; phone?: string; preferredLanguage?: string }): Promise<UserProfile> {
  const res = await apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update profile");
  }
  const data: { user: UserProfile } = await res.json();
  return data.user;
}

export type AppointmentStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED";

export interface Professional {
  id: string;
  name: string;
  professionalType: ProfessionalType;
  specialization: string | null;
  availability: string | null;
}

export interface Appointment {
  id: string;
  requestedTime: string;
  status: AppointmentStatus;
  notes: string | null;
  outcome: string | null;
  professional: { id: string; name: string; professionalType: ProfessionalType };
}

export interface ProfessionalAppointment {
  id: string;
  requestedTime: string;
  status: AppointmentStatus;
  notes: string | null;
  outcome: string | null;
  user: { name: string; email: string };
}

export async function getProfessionals(type?: ProfessionalType): Promise<{ professionals: Professional[]; professionalTypes: ProfessionalType[] }> {
  const res = await apiFetch(`/api/appointments/professionals${type ? `?type=${type}` : ""}`);
  if (!res.ok) throw new Error(`Failed to load professionals (${res.status})`);
  return res.json();
}

export async function requestAppointment(input: { professionalId: string; requestedTime: string; notes?: string }): Promise<Appointment> {
  const res = await apiFetch("/api/appointments", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to request appointment");
  }
  const data: { appointment: Appointment } = await res.json();
  return data.appointment;
}

export async function getMyAppointments(): Promise<Appointment[]> {
  const res = await apiFetch("/api/appointments/mine");
  if (!res.ok) throw new Error(`Failed to load appointments (${res.status})`);
  const data: { appointments: Appointment[] } = await res.json();
  return data.appointments;
}

export async function rescheduleAppointment(id: string, requestedTime: string): Promise<Appointment> {
  const res = await apiFetch(`/api/appointments/${id}/reschedule`, { method: "PATCH", body: JSON.stringify({ requestedTime }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to reschedule appointment");
  }
  const data: { appointment: Appointment } = await res.json();
  return data.appointment;
}

export async function cancelAppointment(id: string): Promise<void> {
  const res = await apiFetch(`/api/appointments/${id}/cancel`, { method: "PATCH" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to cancel appointment");
  }
}

export async function getProfessionalCalendar(): Promise<ProfessionalAppointment[]> {
  const res = await apiFetch("/api/appointments/professional/calendar");
  if (!res.ok) throw new Error(`Failed to load calendar (${res.status})`);
  const data: { appointments: ProfessionalAppointment[] } = await res.json();
  return data.appointments;
}

export async function respondToAppointment(id: string, accept: boolean): Promise<void> {
  const res = await apiFetch(`/api/appointments/${id}/respond`, { method: "PATCH", body: JSON.stringify({ accept }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to respond to appointment");
  }
}

export async function recordAppointmentOutcome(id: string, outcome: string): Promise<void> {
  const res = await apiFetch(`/api/appointments/${id}/outcome`, { method: "PATCH", body: JSON.stringify({ outcome }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to record outcome");
  }
}

export type NotificationType = "REGISTRATION_CONFIRMATION" | "APPOINTMENT_REMINDER" | "CONSULTATION_UPDATE" | "REFERRAL" | "PASSWORD_RESET";
export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export type NotificationPrefs = Record<NotificationType, Record<NotificationChannel, boolean>>;

export async function getNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  const res = await apiFetch("/api/notifications");
  if (!res.ok) throw new Error(`Failed to load notifications (${res.status})`);
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  if (!res.ok) throw new Error(`Failed to mark notification read (${res.status})`);
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await apiFetch("/api/notifications/read-all", { method: "PATCH" });
  if (!res.ok) throw new Error(`Failed to mark notifications read (${res.status})`);
}

export async function getNotificationPrefs(): Promise<{ prefs: NotificationPrefs; types: NotificationType[]; channels: NotificationChannel[] }> {
  const res = await apiFetch("/api/users/me/notification-prefs");
  if (!res.ok) throw new Error(`Failed to load preferences (${res.status})`);
  return res.json();
}

export async function updateNotificationPrefs(prefs: Partial<Record<NotificationType, Partial<Record<NotificationChannel, boolean>>>>): Promise<NotificationPrefs> {
  const res = await apiFetch("/api/users/me/notification-prefs", { method: "PUT", body: JSON.stringify({ prefs }) });
  if (!res.ok) throw new Error(`Failed to update preferences (${res.status})`);
  const data: { prefs: NotificationPrefs } = await res.json();
  return data.prefs;
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await apiFetch("/api/users/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  if (!res.ok) throw new Error("Failed to send reset link");
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<void> {
  const res = await apiFetch("/api/users/reset-password", { method: "POST", body: JSON.stringify({ email, token, newPassword }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to reset password");
  }
}

export type ConsultationStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";

export interface Consultation {
  id: string;
  status: ConsultationStatus;
  priority: number;
  assignedTo: string | null;
  createdAt: string;
}

export interface ProfessionalConsultation {
  id: string;
  status: ConsultationStatus;
  priority: number;
  patientName: string;
  language: string;
  createdAt: string;
}

export interface ConsultationMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export async function requestConsultation(conversationId: string): Promise<{ consultationId: string; assignedTo: string | null; status: string }> {
  const res = await apiFetch("/api/consultations/request", { method: "POST", body: JSON.stringify({ conversationId }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to request a consultation");
  }
  return res.json();
}

export async function getMyConsultations(): Promise<Consultation[]> {
  const res = await apiFetch("/api/consultations/my");
  if (!res.ok) throw new Error(`Failed to load consultations (${res.status})`);
  const data: { consultations: Consultation[] } = await res.json();
  return data.consultations;
}

export async function getProfessionalConsultations(): Promise<ProfessionalConsultation[]> {
  const res = await apiFetch("/api/consultations/professional");
  if (!res.ok) throw new Error(`Failed to load consultation queue (${res.status})`);
  const data: { consultations: ProfessionalConsultation[] } = await res.json();
  return data.consultations;
}

export async function getConsultationMessages(id: string): Promise<ConsultationMessage[]> {
  const res = await apiFetch(`/api/consultations/${id}/messages`);
  if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
  const data: { messages: ConsultationMessage[] } = await res.json();
  return data.messages;
}

export async function sendConsultationMessage(id: string, content: string): Promise<void> {
  const res = await apiFetch(`/api/consultations/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to send message");
  }
}

export interface GovernmentStats {
  scope: { level: GovLevel; regionName: string; coverage: string };
  totalConversations: number;
  languageSplit: Record<string, number>;
  topicEngagement: { topic: { id: string; slug: string; nameEn: string; nameRw: string; colorToken: string }; count: number }[];
  consultationsByStatus: Record<string, number>;
  referralCount: number;
  appointmentsByStatus: Record<string, number>;
  facilitiesByDistrict: Record<string, number>;
  facilitiesByType: Record<string, number>;
}

export async function getGovernmentStats(): Promise<GovernmentStats> {
  const res = await apiFetch("/api/government/stats");
  if (!res.ok) throw new Error(`Failed to load government stats (${res.status})`);
  return res.json();
}

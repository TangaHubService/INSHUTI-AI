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

export async function getCurrentUser(): Promise<UserProfile | null> {
  const res = await apiFetch("/api/users/me");
  if (!res.ok) return null;
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

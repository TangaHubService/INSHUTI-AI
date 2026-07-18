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

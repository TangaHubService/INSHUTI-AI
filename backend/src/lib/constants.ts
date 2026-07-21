// Source of truth for the "enum" fields stored as plain strings in Prisma
// (see the comment atop prisma/schema.prisma for why). Always write/compare
// these fields through the exported const arrays or Zod schemas below —
// never a raw string literal — so a typo is caught at compile/validation
// time instead of silently corrupting a row.
import { z } from "zod";

export const LANGUAGES = ["EN", "RW", "FR", "SW"] as const;
export const languageSchema = z.enum(LANGUAGES);
export type Language = (typeof LANGUAGES)[number];

export const ARTICLE_STATUSES = ["REVIEWED", "NEEDS_REVIEW"] as const;
export const articleStatusSchema = z.enum(ARTICLE_STATUSES);
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const MESSAGE_ROLES = ["USER", "ASSISTANT"] as const;
export const messageRoleSchema = z.enum(MESSAGE_ROLES);
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const FLAG_REASONS = ["CRISIS_LANGUAGE", "LOW_CONFIDENCE", "USER_REPORTED"] as const;
export const flagReasonSchema = z.enum(FLAG_REASONS);
export type FlagReason = (typeof FLAG_REASONS)[number];

export const FLAG_STATUSES = ["FLAGGED", "PENDING", "RESOLVED"] as const;
export const flagStatusSchema = z.enum(FLAG_STATUSES);
export type FlagStatus = (typeof FLAG_STATUSES)[number];

export const ADMIN_ROLES = ["SUPER_ADMIN", "CONTENT_REVIEWER", "MODERATOR"] as const;
export const adminRoleSchema = z.enum(ADMIN_ROLES);
export type AdminRole = (typeof ADMIN_ROLES)[number];

// Role hierarchy for requireAdmin(minRole) checks (Phase 4) — index order
// matters, higher index = more privileged.
export const ADMIN_ROLE_RANK: Record<AdminRole, number> = {
  MODERATOR: 0,
  CONTENT_REVIEWER: 1,
  SUPER_ADMIN: 2,
};

// User-facing roles (Phase 6)
export const USER_ROLES = ["TEENAGER", "PARENT_GUARDIAN", "HEALTHCARE_PROFESSIONAL", "GOVERNMENT_USER"] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = (typeof USER_ROLES)[number];

export const PROFESSIONAL_TYPES = ["CHW", "NURSE", "MIDWIFE", "PSYCHOLOGIST", "DOCTOR"] as const;
export const professionalTypeSchema = z.enum(PROFESSIONAL_TYPES);
export type ProfessionalType = (typeof PROFESSIONAL_TYPES)[number];

export const GOV_LEVELS = ["NATIONAL", "PROVINCIAL", "DISTRICT", "SECTOR", "CELL"] as const;
export const govLevelSchema = z.enum(GOV_LEVELS);
export type GovLevel = (typeof GOV_LEVELS)[number];

export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const approvalStatusSchema = z.enum(APPROVAL_STATUSES);
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

// Appointment lifecycle (Phase 8)
export const APPOINTMENT_STATUSES = ["REQUESTED", "CONFIRMED", "RESCHEDULED", "CANCELLED", "COMPLETED"] as const;
export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUSES);
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

// Notifications (Phase 9)
export const NOTIFICATION_TYPES = [
  "REGISTRATION_CONFIRMATION",
  "APPOINTMENT_REMINDER",
  "CONSULTATION_UPDATE",
  "REFERRAL",
  "PASSWORD_RESET",
] as const;
export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES);
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_CHANNELS = ["IN_APP", "EMAIL", "SMS"] as const;
export const notificationChannelSchema = z.enum(NOTIFICATION_CHANNELS);
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

// Default per-type channel preferences (a user's User.notificationPrefs JSON
// overrides these — see src/lib/notificationPrefs.ts). Everything defaults to
// in-app + email on; SMS defaults off since no gateway is wired up yet.
export const DEFAULT_NOTIFICATION_PREFS: Record<NotificationType, Record<NotificationChannel, boolean>> = {
  REGISTRATION_CONFIRMATION: { IN_APP: true, EMAIL: true, SMS: false },
  APPOINTMENT_REMINDER: { IN_APP: true, EMAIL: true, SMS: false },
  CONSULTATION_UPDATE: { IN_APP: true, EMAIL: true, SMS: false },
  REFERRAL: { IN_APP: true, EMAIL: true, SMS: false },
  PASSWORD_RESET: { IN_APP: false, EMAIL: true, SMS: false },
};

// Health facility locator (Phase 10)
export const FACILITY_TYPES = ["HOSPITAL", "HEALTH_CENTRE", "CLINIC", "PHARMACY"] as const;
export const facilityTypeSchema = z.enum(FACILITY_TYPES);
export type FacilityType = (typeof FACILITY_TYPES)[number];

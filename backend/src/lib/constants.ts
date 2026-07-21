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

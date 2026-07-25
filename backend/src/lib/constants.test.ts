import { describe, it, expect } from "vitest";
import {
  languageSchema,
  articleStatusSchema,
  adminRoleSchema,
  userRoleSchema,
  professionalTypeSchema,
  flagReasonSchema,
  flagStatusSchema,
  appointmentStatusSchema,
  notificationTypeSchema,
  facilityTypeSchema,
  ADMIN_ROLE_RANK,
} from "./constants.js";

describe("constants - Zod schemas", () => {
  it("validates valid languages", () => {
    expect(languageSchema.parse("EN")).toBe("EN");
    expect(languageSchema.parse("RW")).toBe("RW");
    expect(languageSchema.parse("FR")).toBe("FR");
    expect(languageSchema.parse("SW")).toBe("SW");
  });

  it("rejects invalid language", () => {
    expect(() => languageSchema.parse("DE")).toThrow();
  });

  it("validates article statuses", () => {
    expect(articleStatusSchema.parse("REVIEWED")).toBe("REVIEWED");
    expect(articleStatusSchema.parse("NEEDS_REVIEW")).toBe("NEEDS_REVIEW");
  });

  it("validates admin roles", () => {
    expect(adminRoleSchema.parse("SUPER_ADMIN")).toBe("SUPER_ADMIN");
    expect(() => adminRoleSchema.parse("INVALID")).toThrow();
  });

  it("validates user roles", () => {
    expect(userRoleSchema.parse("TEENAGER")).toBe("TEENAGER");
    expect(userRoleSchema.parse("HEALTHCARE_PROFESSIONAL")).toBe("HEALTHCARE_PROFESSIONAL");
  });

  it("validates professional types", () => {
    expect(professionalTypeSchema.parse("DOCTOR")).toBe("DOCTOR");
    expect(professionalTypeSchema.parse("CHW")).toBe("CHW");
  });

  it("validates flag reasons", () => {
    expect(flagReasonSchema.parse("CRISIS_LANGUAGE")).toBe("CRISIS_LANGUAGE");
    expect(flagReasonSchema.parse("USER_REPORTED")).toBe("USER_REPORTED");
  });

  it("validates flag statuses", () => {
    expect(flagStatusSchema.parse("FLAGGED")).toBe("FLAGGED");
    expect(flagStatusSchema.parse("RESOLVED")).toBe("RESOLVED");
  });

  it("validates appointment statuses", () => {
    expect(appointmentStatusSchema.parse("REQUESTED")).toBe("REQUESTED");
    expect(appointmentStatusSchema.parse("COMPLETED")).toBe("COMPLETED");
  });

  it("validates notification types", () => {
    expect(notificationTypeSchema.parse("APPOINTMENT_REMINDER")).toBe("APPOINTMENT_REMINDER");
    expect(() => notificationTypeSchema.parse("UNKNOWN")).toThrow();
  });

  it("validates facility types", () => {
    expect(facilityTypeSchema.parse("HOSPITAL")).toBe("HOSPITAL");
    expect(facilityTypeSchema.parse("PHARMACY")).toBe("PHARMACY");
  });

  it("enforces admin role hierarchy", () => {
    expect(ADMIN_ROLE_RANK.MODERATOR).toBeLessThan(ADMIN_ROLE_RANK.CONTENT_REVIEWER);
    expect(ADMIN_ROLE_RANK.CONTENT_REVIEWER).toBeLessThan(ADMIN_ROLE_RANK.SUPER_ADMIN);
  });
});

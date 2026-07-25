import { describe, it, expect } from "vitest";
import { decodeNotificationPrefs, encodeNotificationPrefs } from "./notificationPrefs.js";

describe("notificationPrefs", () => {
  it("returns defaults for empty input", () => {
    const prefs = decodeNotificationPrefs("{}");
    expect(prefs.REGISTRATION_CONFIRMATION.IN_APP).toBe(true);
    expect(prefs.PASSWORD_RESET.EMAIL).toBe(true);
    expect(prefs.APPOINTMENT_REMINDER.SMS).toBe(false);
  });

  it("merges user overrides with defaults", () => {
    const prefs = decodeNotificationPrefs('{"APPOINTMENT_REMINDER":{"SMS":true}}');
    expect(prefs.APPOINTMENT_REMINDER.SMS).toBe(true);
    expect(prefs.APPOINTMENT_REMINDER.IN_APP).toBe(true);
    expect(prefs.REGISTRATION_CONFIRMATION.IN_APP).toBe(true);
  });

  it("returns defaults for malformed JSON", () => {
    const prefs = decodeNotificationPrefs("{{{bad");
    expect(prefs.REGISTRATION_CONFIRMATION.EMAIL).toBe(true);
  });

  it("round-trips encode/decode", () => {
    const original = decodeNotificationPrefs("{}");
    original.REGISTRATION_CONFIRMATION.SMS = true;
    const encoded = encodeNotificationPrefs(original);
    const decoded = decodeNotificationPrefs(encoded);
    expect(decoded.REGISTRATION_CONFIRMATION.SMS).toBe(true);
  });
});

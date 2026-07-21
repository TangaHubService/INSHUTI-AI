import { DEFAULT_NOTIFICATION_PREFS, NOTIFICATION_TYPES, type NotificationChannel, type NotificationType } from "./constants.js";

export type NotificationPrefs = Record<NotificationType, Record<NotificationChannel, boolean>>;

// User.notificationPrefs is a JSON-encoded text column holding a (possibly
// partial) override of DEFAULT_NOTIFICATION_PREFS — merge rather than trust
// the stored value so an old/malformed row still yields a complete object.
export function decodeNotificationPrefs(raw: string): NotificationPrefs {
  let parsed: Partial<Record<NotificationType, Partial<Record<NotificationChannel, boolean>>>> = {};
  try {
    const value = JSON.parse(raw);
    if (value && typeof value === "object") parsed = value;
  } catch {
    parsed = {};
  }

  const result = {} as NotificationPrefs;
  for (const type of NOTIFICATION_TYPES) {
    result[type] = { ...DEFAULT_NOTIFICATION_PREFS[type], ...(parsed[type] ?? {}) };
  }
  return result;
}

export function encodeNotificationPrefs(prefs: NotificationPrefs): string {
  return JSON.stringify(prefs);
}

export type Locale = "EN" | "RW" | "FR" | "SW";

export const SUPPORTED_LOCALES: Locale[] = ["EN", "RW", "FR", "SW"];

export const localeLabels: Record<Locale, string> = {
  EN: "EN",
  RW: "RW",
  FR: "FR",
  SW: "SW",
};

const messageCache = new Map<Locale, Record<string, unknown>>();

export async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }
  const key = locale.toLowerCase();
  const messages = await import(`@/messages/${key}.json`);
  messageCache.set(locale, messages);
  return messages;
}

export function t(path: string, messages: Record<string, unknown>): string {
  const keys = path.split(".");
  let current: unknown = messages;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function tWithParams(
  path: string,
  messages: Record<string, unknown>,
  params?: Record<string, string | number>,
): string {
  let result = t(path, messages);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, String(value));
    }
  }
  return result;
}

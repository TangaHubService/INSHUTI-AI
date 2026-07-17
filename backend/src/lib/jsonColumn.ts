// tags (Article) and sourcesUsed (Message) are stored as JSON-encoded text
// columns (see prisma/schema.prisma comment) — always go through these
// helpers rather than JSON.parse/stringify inline, so a malformed row
// degrades to [] instead of throwing.
export function encodeJsonColumn(values: string[]): string {
  return JSON.stringify(values);
}

export function decodeJsonColumn(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

import crisisPatterns from "../data/crisisPatterns.json";

export const CRISIS_CATEGORIES = ["SUICIDAL_IDEATION", "SELF_HARM", "ABUSE_DISCLOSURE"] as const;
export type CrisisCategory = (typeof CRISIS_CATEGORIES)[number];

export interface CrisisCheckResult {
  isCrisis: boolean;
  category: CrisisCategory | null;
  matchedPattern: string | null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word-boundary regex per pattern, built once at module load. Boundaries
// keep short patterns (e.g. "die") from matching inside unrelated words
// (e.g. "diet"); phrases with internal spaces still match as a whole.
const compiledPatterns: Array<{ category: CrisisCategory; pattern: string; regex: RegExp }> = [];

type PatternsByCategory = Record<CrisisCategory, { en: string[]; rw: string[] }>;
const patternsByCategory = crisisPatterns as unknown as PatternsByCategory;

for (const category of CRISIS_CATEGORIES) {
  const byLanguage = patternsByCategory[category];
  for (const pattern of [...byLanguage.en, ...byLanguage.rw]) {
    compiledPatterns.push({
      category,
      pattern,
      regex: new RegExp(`\\b${escapeRegExp(pattern.toLowerCase())}\\b`),
    });
  }
}

export function checkForCrisisLanguage(message: string): CrisisCheckResult {
  const normalized = message.toLowerCase();
  for (const { category, pattern, regex } of compiledPatterns) {
    if (regex.test(normalized)) {
      return { isCrisis: true, category, matchedPattern: pattern };
    }
  }
  return { isCrisis: false, category: null, matchedPattern: null };
}

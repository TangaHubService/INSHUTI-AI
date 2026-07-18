import type { Language } from "./constants.js";

// Lightweight marker-word heuristic, not a real language model — good enough
// to catch "the UI is set to EN but this message is clearly Kinyarwanda" and
// vice versa. Ties and empty/ambiguous input fall back to the given default
// rather than guessing.
const RW_MARKERS = new Set([
  "ni", "cyangwa", "ese", "ndashaka", "sinshaka", "umuntu", "kubona", "gute",
  "kuki", "ubu", "aho", "ibyo", "uko", "kandi", "kuko", "niba", "nte", "ndi",
  "uri", "turi", "bari", "nshobora", "nyuma", "mbere", "byiza", "bibi",
]);
const EN_MARKERS = new Set([
  "the", "is", "are", "what", "how", "can", "do", "does", "when", "where",
  "why", "and", "that", "this", "with", "have", "i", "you", "my", "me",
]);
const FR_MARKERS = new Set([
  "le", "la", "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
  "est", "suis", "sont", "quoi", "comment", "peux", "peut", "veux", "veut",
  "fait", "faire", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
  "pour", "avec", "dans", "sur", "pas", "tout", "tous", "une", "des",
]);
const SW_MARKERS = new Set([
  "ni", "na", "mimi", "wewe", "yeye", "sisi", "nyinyi", "wao",
  "je", "una", "ana", "tuna", "mna", "wana", "nini", "vipi", "jinsi",
  "nini", "kwa", "kwenye", "ya", "wa", "cha", "vya", "hii", "hiyo",
  "kama", "lakini", "au", "hapa", "huko", "nde",
]);

export function detectLanguage(message: string, fallback: Language): Language {
  const tokens = message.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  if (tokens.length === 0) {
    return fallback;
  }

  let rwScore = 0;
  let enScore = 0;
  let frScore = 0;
  let swScore = 0;
  for (const token of tokens) {
    if (RW_MARKERS.has(token)) rwScore += 1;
    if (EN_MARKERS.has(token)) enScore += 1;
    if (FR_MARKERS.has(token)) frScore += 1;
    if (SW_MARKERS.has(token)) swScore += 1;
  }

  const max = Math.max(rwScore, enScore, frScore, swScore);
  if (max === 0) return fallback;
  if (rwScore === max) return "RW";
  if (enScore === max) return "EN";
  if (frScore === max) return "FR";
  return "SW";
}

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

export function detectLanguage(message: string, fallback: Language): Language {
  const tokens = message.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  if (tokens.length === 0) {
    return fallback;
  }

  let rwScore = 0;
  let enScore = 0;
  for (const token of tokens) {
    if (RW_MARKERS.has(token)) rwScore += 1;
    if (EN_MARKERS.has(token)) enScore += 1;
  }

  if (rwScore === enScore) {
    return fallback;
  }
  return rwScore > enScore ? "RW" : "EN";
}

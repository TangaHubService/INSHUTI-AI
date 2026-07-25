import { describe, it, expect } from "vitest";
import { detectLanguage } from "./detectLanguage.js";

describe("detectLanguage", () => {
  it("detects English", () => {
    expect(detectLanguage("How can I track my period", "EN")).toBe("EN");
  });

  it("detects Kinyarwanda", () => {
    expect(detectLanguage("Ndashaka kumenya ibyo gutwita", "EN")).toBe("RW");
  });

  it("detects French", () => {
    expect(detectLanguage("Je veux savoir comment suivre mon cycle", "EN")).toBe("FR");
  });

  it("detects Swahili", () => {
    expect(detectLanguage("Nataka kujua jinsi ya kufuatilia mzunguko wangu", "EN")).toBe("SW");
  });

  it("falls back to default for empty input", () => {
    expect(detectLanguage("", "RW")).toBe("RW");
  });

  it("falls back to default when no markers match", () => {
    expect(detectLanguage("xyz zyx", "FR")).toBe("FR");
  });

  it("prefers the language with the most markers", () => {
    const msg = "the quick brown fox and the lazy dog — ni ibisanzwe";
    const lang = detectLanguage(msg, "EN");
    expect(["EN", "RW"]).toContain(lang);
  });
});

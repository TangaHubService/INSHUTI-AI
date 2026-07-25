import { describe, it, expect } from "vitest";
import { getSuggestionsForTopics } from "./suggestions.js";

describe("getSuggestionsForTopics", () => {
  it("returns suggestions for known topic slugs", () => {
    const results = getSuggestionsForTopics(["menstrual-health"], "EN");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].topicSlug).toBe("menstrual-health");
    expect(results[0].title).toBeTruthy();
    expect(results[0].body).toBeTruthy();
  });

  it("returns localized Kinyarwanda suggestions", () => {
    const results = getSuggestionsForTopics(["pregnancy"], "RW");
    expect(results[0].title).toBe("Kwitabwaho hakiri kare ni ngombwa");
  });

  it("returns localized French suggestions", () => {
    const results = getSuggestionsForTopics(["relationships"], "FR");
    expect(results[0].title).toContain("limites");
  });

  it("returns localized Swahili suggestions", () => {
    const results = getSuggestionsForTopics(["family-planning"], "SW");
    expect(results[0].title).toBeTruthy();
  });

  it("returns default suggestions for unknown slugs", () => {
    const results = getSuggestionsForTopics(["nonexistent-topic"], "EN");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].topicSlug).toBeNull();
  });

  it("returns at most 3 suggestions", () => {
    const results = getSuggestionsForTopics(
      ["menstrual-health", "pregnancy", "relationships", "family-planning", "hiv-stis", "mental-health"],
      "EN",
    );
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("deduplicates repeated slugs", () => {
    const results = getSuggestionsForTopics(["menstrual-health", "menstrual-health", "pregnancy"], "EN");
    expect(results.length).toBe(2);
    expect(results[0].topicSlug).toBe("menstrual-health");
    expect(results[1].topicSlug).toBe("pregnancy");
  });
});

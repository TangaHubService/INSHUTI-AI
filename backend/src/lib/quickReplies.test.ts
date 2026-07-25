import { describe, it, expect } from "vitest";
import { getQuickReplies } from "./quickReplies.js";

describe("getQuickReplies", () => {
  it("returns topic-specific quick replies in English", () => {
    const replies = getQuickReplies("menstrual-health", "EN");
    expect(replies.length).toBe(3);
    expect(replies[0]).toContain("period");
  });

  it("returns topic-specific quick replies in Kinyarwanda", () => {
    const replies = getQuickReplies("pregnancy", "RW");
    expect(replies.length).toBe(3);
    expect(replies[0]).toBeTruthy();
  });

  it("returns default quick replies for null topic", () => {
    const replies = getQuickReplies(null, "EN");
    expect(replies.length).toBe(3);
    expect(replies[0]).toContain("tell me more");
  });

  it("returns default quick replies for unknown topic", () => {
    const replies = getQuickReplies("unknown-topic", "EN");
    expect(replies.length).toBe(3);
  });
});

import { describe, it, expect } from "vitest";
import { checkForCrisisLanguage } from "./crisisDetector.js";

describe("crisisDetector", () => {
  it("detects suicidal ideation in English", () => {
    const result = checkForCrisisLanguage("I want to kill myself");
    expect(result.isCrisis).toBe(true);
    expect(result.category).toBe("SUICIDAL_IDEATION");
  });

  it("detects suicidal ideation in Kinyarwanda", () => {
    const result = checkForCrisisLanguage("ndashaka kwiyahura");
    expect(result.isCrisis).toBe(true);
    expect(result.category).toBe("SUICIDAL_IDEATION");
  });

  it("detects self-harm language", () => {
    const result = checkForCrisisLanguage("I cut myself last night");
    expect(result.isCrisis).toBe(true);
    expect(result.category).toBe("SELF_HARM");
  });

  it("detects abuse disclosure", () => {
    const result = checkForCrisisLanguage("he's abusing me");
    expect(result.isCrisis).toBe(true);
    expect(result.category).toBe("ABUSE_DISCLOSURE");
  });

  it("returns false for benign messages", () => {
    const result = checkForCrisisLanguage("I have a headache today");
    expect(result.isCrisis).toBe(false);
    expect(result.category).toBeNull();
    expect(result.matchedPattern).toBeNull();
  });

  it("is case-insensitive", () => {
    const result = checkForCrisisLanguage("I Want To End My Life");
    expect(result.isCrisis).toBe(true);
  });

  it("does not false-positive on substring matches", () => {
    const result = checkForCrisisLanguage("My diet is going well");
    expect(result.isCrisis).toBe(false);
  });
});

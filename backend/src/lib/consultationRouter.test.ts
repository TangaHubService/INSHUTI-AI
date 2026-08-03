import { describe, expect, it } from "vitest";

import { determineRequiredProfessional } from "./consultationRouter.js";

describe("determineRequiredProfessional", () => {
  it.each([
    ["pregnancy", "MIDWIFE"],
    ["mental-health", "PSYCHOLOGIST"],
    ["hiv-stis", "DOCTOR"],
    ["menstrual-health", "NURSE"],
    ["unknown", "CHW"],
  ])("routes %s to %s", (topicSlug, expected) => {
    expect(determineRequiredProfessional({ topicSlug }).professionalType).toBe(expected);
  });

  it("lets risk override the topic", () => {
    expect(determineRequiredProfessional({ topicSlug: "pregnancy", riskFlags: ["CRISIS_LANGUAGE"] }))
      .toEqual({ priority: 3, professionalType: "DOCTOR" });
  });
});

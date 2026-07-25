import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/suggestions", () => {
  it("returns default suggestions when no language is specified", async () => {
    const res = await request(app).get("/api/suggestions");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("suggestions");
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  it("returns suggestions with required fields", async () => {
    const res = await request(app).get("/api/suggestions?language=EN");
    expect(res.status).toBe(200);
    for (const s of res.body.suggestions) {
      expect(s).toHaveProperty("tag");
      expect(s).toHaveProperty("title");
      expect(s).toHaveProperty("body");
      expect(s).toHaveProperty("ctaText");
      expect(s).toHaveProperty("topicSlug");
    }
  });

  it("accepts all language values", async () => {
    for (const lang of ["EN", "RW", "FR", "SW"]) {
      const res = await request(app).get(`/api/suggestions?language=${lang}`);
      expect(res.status).toBe(200);
    }
  });
});

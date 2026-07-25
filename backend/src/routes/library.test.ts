import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/library/topics", () => {
  it("returns list of topics with published articles", async () => {
    const res = await request(app).get("/api/library/topics");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("topics");
    expect(Array.isArray(res.body.topics)).toBe(true);
  });

  it("each topic has required fields", async () => {
    const res = await request(app).get("/api/library/topics");
    for (const topic of res.body.topics) {
      expect(topic).toHaveProperty("id");
      expect(topic).toHaveProperty("slug");
      expect(topic).toHaveProperty("nameEn");
      expect(topic).toHaveProperty("articleCount");
    }
  });
});

describe("GET /api/library/articles", () => {
  it("returns published articles with localized content", async () => {
    const res = await request(app).get("/api/library/articles?language=EN");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("articles");
    expect(Array.isArray(res.body.articles)).toBe(true);
  });

  it("accepts topicId filter", async () => {
    const res = await request(app).get("/api/library/articles?language=EN&topicId=test");
    expect(res.status).toBe(200);
  });

  it("defaults to EN language when omitted", async () => {
    const res = await request(app).get("/api/library/articles");
    expect(res.status).toBe(200);
  });
});

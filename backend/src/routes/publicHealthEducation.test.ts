import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/resources", () => {
  it("returns a paginated list shape", async () => {
    const res = await request(app).get("/api/resources");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("resources");
    expect(Array.isArray(res.body.resources)).toBe(true);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page");
    expect(res.body).toHaveProperty("pageCount");
  });

  it("accepts search/category/topic/language/sort/tags query params", async () => {
    const res = await request(app).get(
      "/api/resources?search=health&category=Nutrition&topic=Wellness&language=EN&sort=alpha&tags=teen,parent&page=1&limit=5",
    );
    expect(res.status).toBe(200);
  });
});

describe("GET /api/resources/filters", () => {
  it("returns distinct filter option lists", async () => {
    const res = await request(app).get("/api/resources/filters");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("categories");
    expect(res.body).toHaveProperty("topics");
    expect(res.body).toHaveProperty("languages");
    expect(res.body).toHaveProperty("tags");
    expect(res.body).toHaveProperty("fileTypes");
  });
});

describe("GET /api/resources/:id", () => {
  it("404s for an unknown resource id", async () => {
    const res = await request(app).get("/api/resources/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/resources/attachments/:attachmentId/download", () => {
  it("404s for an unknown attachment id", async () => {
    const res = await request(app).get("/api/resources/attachments/does-not-exist/download");
    expect(res.status).toBe(404);
  });
});

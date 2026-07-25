import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/monitoring/health", () => {
  it("returns detailed health info", async () => {
    const res = await request(app).get("/api/monitoring/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("database");
    expect(res.body).toHaveProperty("requestsTotal");
    expect(res.body).toHaveProperty("memory");
    expect(res.body).toHaveProperty("nodeVersion");
  });
});

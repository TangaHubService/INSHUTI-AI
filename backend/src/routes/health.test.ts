import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { ADMIN_SESSION_COOKIE_NAME, signAdminToken } from "../lib/auth.js";

const app = createApp();

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// /api/monitoring/health exposes internal operational metrics (memory,
// request counters, node version) — admin-only, see rbacHardening.test.ts
// for the 401-when-unauthenticated coverage.
describe("GET /api/monitoring/health", () => {
  it("returns detailed health info for an authenticated admin", async () => {
    const token = signAdminToken({ sub: "admin-1", email: "admin@example.com", name: "Test Admin", role: "MODERATOR" });
    const res = await request(app).get("/api/monitoring/health").set("Cookie", `${ADMIN_SESSION_COOKIE_NAME}=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("database");
    expect(res.body).toHaveProperty("requestsTotal");
    expect(res.body).toHaveProperty("memory");
    expect(res.body).toHaveProperty("nodeVersion");
  });
});

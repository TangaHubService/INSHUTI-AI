import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import type { Response } from "express";

import { createApp } from "../app.js";
import { ADMIN_SESSION_COOKIE_NAME, signAdminToken } from "../lib/auth.js";
import { setUserCookie } from "../lib/userAuth.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();

function adminCookie(role: "SUPER_ADMIN" | "CONTENT_REVIEWER" | "MODERATOR") {
  const token = signAdminToken({ sub: "admin-1", email: `${role.toLowerCase()}@example.com`, name: "Test Admin", role });
  return `${ADMIN_SESSION_COOKIE_NAME}=${token}`;
}

// setUserCookie signs and calls res.cookie(...) — capture the value it would
// have set rather than duplicating the (private) token-serialization logic.
function userCookie(userId: string, role: "TEENAGER" | "GOVERNMENT_USER") {
  let value = "";
  const fakeRes = { cookie: (_name: string, v: string) => { value = v; } } as unknown as Response;
  setUserCookie(fakeRes, userId, role);
  return `inshuti_user_token=${value}`;
}

describe("GET /api/monitoring/health (RBAC hardening)", () => {
  it("401s without an admin session — previously fully public", async () => {
    const res = await request(app).get("/api/monitoring/health");
    expect(res.status).toBe(401);
  });

  it("200s for any authenticated admin", async () => {
    const res = await request(app).get("/api/monitoring/health").set("Cookie", adminCookie("MODERATOR"));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/reports/conversations (RBAC hardening)", () => {
  it("401s without an admin session", async () => {
    const res = await request(app).get("/api/reports/conversations");
    expect(res.status).toBe(401);
  });

  it("403s for MODERATOR — previously allowed, now requires CONTENT_REVIEWER+", async () => {
    const res = await request(app).get("/api/reports/conversations").set("Cookie", adminCookie("MODERATOR"));
    expect(res.status).toBe(403);
  });

  it("200s for CONTENT_REVIEWER", async () => {
    const res = await request(app).get("/api/reports/conversations").set("Cookie", adminCookie("CONTENT_REVIEWER"));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/government/stats (explicit role check)", () => {
  it("403s for a non-government user role, even with a valid session", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user-1",
      role: "TEENAGER",
      active: true,
      lastActivityAt: new Date(),
    } as never);

    const res = await request(app).get("/api/government/stats").set("Cookie", userCookie("user-1", "TEENAGER"));
    expect(res.status).toBe(403);
  });

  it("200s for an associated government user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user-2",
      role: "GOVERNMENT_USER",
      active: true,
      lastActivityAt: new Date(),
    } as never);
    vi.mocked(prisma.governmentUser.findUnique).mockResolvedValueOnce({
      id: "gov-1",
      userId: "user-2",
      level: "NATIONAL",
      regionName: "",
    } as never);

    const res = await request(app).get("/api/government/stats").set("Cookie", userCookie("user-2", "GOVERNMENT_USER"));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalConversations");
  });
});

describe("GET /api/consultations/admin (new oversight list)", () => {
  it("401s without an admin session", async () => {
    const res = await request(app).get("/api/consultations/admin");
    expect(res.status).toBe(401);
  });

  it("200s for any authenticated admin and never includes message content", async () => {
    const res = await request(app).get("/api/consultations/admin").set("Cookie", adminCookie("MODERATOR"));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("consultations");
    for (const c of res.body.consultations) {
      expect(c).not.toHaveProperty("content");
      expect(c).not.toHaveProperty("messages");
    }
  });
});

describe("GET /api/consultations/admin/professionals", () => {
  it("401s without an admin session", async () => {
    const res = await request(app).get("/api/consultations/admin/professionals");
    expect(res.status).toBe(401);
  });

  it("200s for any authenticated admin", async () => {
    const res = await request(app).get("/api/consultations/admin/professionals").set("Cookie", adminCookie("MODERATOR"));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("professionals");
  });
});

import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();

const mockUser = {
  id: "user-1",
  email: "",
  phone: null,
  passwordHash: "$2b$12$abcdefghijklmnopqrstuvwx.1234567890123456789012345678901234567890",
  name: "E2E User",
  role: "TEENAGER",
  preferredLanguage: "EN",
  province: null,
  district: null,
  sector: null,
  cell: null,
  notificationPrefs: "{}",
  active: true,
  loginAttempts: 0,
  lockedUntil: null,
  resetTokenHash: null,
  resetTokenExpiresAt: null,
  lastActivityAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  healthcareProfessional: null,
  governmentUser: null,
};

describe("User Flow: Register → Login → Profile → Logout", () => {
  const email = `e2e-${Date.now()}@test.com`;
  const password = "testPassword123";
  let userCookie: string;

  it("1. registers a new user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({ ...mockUser, email, name: "E2E User" });
    const res = await request(app)
      .post("/api/users/register")
      .send({ email, password, name: "E2E User", role: "TEENAGER" });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    userCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  it("2. rejects duplicate registration", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ ...mockUser, email });
    const res = await request(app)
      .post("/api/users/register")
      .send({ email, password, name: "Duplicate", role: "TEENAGER" });
    expect(res.status).toBe(409);
  });

  it("3. fetches current user profile", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ ...mockUser, email });
    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", userCookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe("TEENAGER");
  });

  it("4. updates profile", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ ...mockUser, email });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({ ...mockUser, email, name: "Updated Name" });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({ ...mockUser, email, name: "Updated Name" });
    const res = await request(app)
      .patch("/api/users/me")
      .set("Cookie", userCookie)
      .send({ name: "Updated Name" });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Updated Name");
  });

  it("5. logs out", async () => {
    const res = await request(app)
      .post("/api/users/logout")
      .set("Cookie", userCookie);
    expect(res.status).toBe(200);
    expect(res.body.loggedOut).toBe(true);
  });

  it("6. cannot access profile after logout", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", userCookie);
    expect(res.status).toBe(401);
  });
});

describe("User Flow: Contact Inquiry", () => {
  it("submits a contact inquiry", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Contact User", email: "contact@test.com", message: "I need help with something." });
    expect(res.status).toBe(201);
    expect(res.body.inquiry.id).toBeTruthy();
  });
});

describe("User Flow: Chat + Crisis Detection", () => {
  it("handles a benign chat message", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Hello, how are you?", language: "EN" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(res.body).toHaveProperty("topic");
    expect(res.body).toHaveProperty("sources");
    expect(res.body).toHaveProperty("quickReplies");
  });

  it("triggers crisis response for suicidal language", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "I want to kill myself", language: "EN" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(res.body.canRequestHumanFollowUp).toBe(true);
  });

  it("returns crisis resources", async () => {
    const res = await request(app).get("/api/chat/crisis-resources");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("resources");
  });
});

describe("User Flow: Library", () => {
  it("fetches library topics", async () => {
    const res = await request(app).get("/api/library/topics");
    expect(res.status).toBe(200);
    expect(res.body.topics).toBeDefined();
  });

  it("fetches library articles", async () => {
    const res = await request(app).get("/api/library/articles?language=EN");
    expect(res.status).toBe(200);
    expect(res.body.articles).toBeDefined();
  });
});

describe("User Flow: Facilities", () => {
  it("fetches all facilities", async () => {
    const res = await request(app).get("/api/facilities");
    expect(res.status).toBe(200);
    expect(res.body.facilities).toBeDefined();
    expect(res.body.facilityTypes).toBeDefined();
  });
});

describe("User Flow: History & Suggestions", () => {
  it("fetches chat history", async () => {
    const res = await request(app).get("/api/history");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("conversations");
    expect(res.body).toHaveProperty("topicCounts");
  });

  it("clears history", async () => {
    const res = await request(app).delete("/api/history");
    expect(res.status).toBe(200);
    expect(res.body.cleared).toBe(true);
  });

  it("fetches suggestions", async () => {
    const res = await request(app).get("/api/suggestions?language=EN");
    expect(res.status).toBe(200);
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });
});

describe("API Versioning", () => {
  it("serves health under /api/v1/health", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("serves contact under /api/v1/contact", async () => {
    const res = await request(app)
      .post("/api/v1/contact")
      .send({ name: "V1 Test", email: "v1@test.com", message: "Versioned API test" });
    expect(res.status).toBe(201);
  });
});

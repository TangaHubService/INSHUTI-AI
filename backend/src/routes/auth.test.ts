import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("POST /api/auth/login", () => {
  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("rejects empty email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "", password: "test1234" });
    expect(res.status).toBe(400);
  });

  it("rejects empty password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns success", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.loggedOut).toBe(true);
  });
});

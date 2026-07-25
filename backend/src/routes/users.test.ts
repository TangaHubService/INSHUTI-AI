import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("POST /api/users/register", () => {
  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ email: "test@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ email: "test@example.com", password: "short", name: "Test", role: "TEENAGER" });
    expect(res.status).toBe(400);
  });

  it("rejects invalid role", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ email: "test@example.com", password: "password123", name: "Test", role: "INVALID" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/users/login", () => {
  it("rejects non-existent user", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "noone@example.com", password: "password123" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/users/forgot-password", () => {
  it("always returns 200 to prevent email enumeration", async () => {
    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "nonexistent@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.sent).toBe(true);
  });
});

describe("POST /api/users/reset-password", () => {
  it("rejects invalid reset token", async () => {
    const res = await request(app)
      .post("/api/users/reset-password")
      .send({ email: "test@example.com", token: "invalid", newPassword: "newpassword123" });
    expect(res.status).toBe(400);
  });
});

import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("POST /api/contact", () => {
  it("accepts a valid inquiry", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Test User", email: "test@example.com", message: "This is a test message." });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("inquiry");
    expect(res.body.inquiry).toHaveProperty("id");
    expect(res.body.inquiry).toHaveProperty("createdAt");
  });

  it("rejects missing name", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ email: "test@example.com", message: "Hello" });
    expect(res.status).toBe(400);
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Test", email: "not-an-email", message: "Hello" });
    expect(res.status).toBe(400);
  });

  it("rejects empty message", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Test", email: "test@example.com", message: "" });
    expect(res.status).toBe(400);
  });

  it("rejects empty request body", async () => {
    const res = await request(app).post("/api/contact").send({});
    expect(res.status).toBe(400);
  });
});

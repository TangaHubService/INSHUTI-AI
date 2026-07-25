import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/facilities", () => {
  it("returns a list of facilities", async () => {
    const res = await request(app).get("/api/facilities");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("facilities");
    expect(res.body).toHaveProperty("facilityTypes");
    expect(Array.isArray(res.body.facilities)).toBe(true);
    expect(Array.isArray(res.body.facilityTypes)).toBe(true);
  });

  it("accepts type filter", async () => {
    const res = await request(app).get("/api/facilities?type=HOSPITAL");
    expect(res.status).toBe(200);
  });

  it("accepts search filter", async () => {
    const res = await request(app).get("/api/facilities?search=clinic");
    expect(res.status).toBe(200);
  });

  it("ignores invalid type and returns all facilities", async () => {
    const res = await request(app).get("/api/facilities?type=INVALID");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("facilities");
  });
});

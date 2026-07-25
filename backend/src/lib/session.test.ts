import { describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { getOrCreateSessionId, issueNewSessionId, SESSION_COOKIE_NAME } from "./session.js";

function mockReqRes(cookie?: string): { req: Request; res: Response; cookies: Record<string, string> } {
  const cookies: Record<string, string> = {};
  if (cookie) cookies[SESSION_COOKIE_NAME] = cookie;
  const res = {
    cookie: (name: string, value: string) => { cookies[name] = value; },
  } as unknown as Response;
  const req = { cookies } as Request;
  return { req, res, cookies };
}

describe("session", () => {
  it("creates a new session ID when none exists", () => {
    const { req, res, cookies } = mockReqRes();
    const id = getOrCreateSessionId(req, res);
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("reuses an existing session ID", () => {
    const existingId = "550e8400-e29b-41d4-a716-446655440000";
    const { req, res } = mockReqRes(existingId);
    const id = getOrCreateSessionId(req, res);
    expect(id).toBe(existingId);
  });

  it("issues a new session ID via issueNewSessionId", () => {
    const { req, res, cookies } = mockReqRes("old-session-id");
    const newId = issueNewSessionId(res);
    expect(newId).not.toBe("old-session-id");
    expect(newId).toBeTruthy();
  });
});

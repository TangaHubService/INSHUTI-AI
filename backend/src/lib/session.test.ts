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
    const { req, res } = mockReqRes();
    const id = getOrCreateSessionId(req, res);
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("reuses an existing session ID", () => {
    const first = mockReqRes();
    const existingId = getOrCreateSessionId(first.req, first.res);
    const second = mockReqRes(first.cookies[SESSION_COOKIE_NAME]);
    expect(getOrCreateSessionId(second.req, second.res)).toBe(existingId);
  });

  it("rejects a forged anonymous session cookie", () => {
    const { req, res } = mockReqRes("known-id.forged-signature");
    expect(getOrCreateSessionId(req, res)).not.toBe("known-id");
  });

  it("issues a new session ID via issueNewSessionId", () => {
    const { res } = mockReqRes("old-session-id");
    const newId = issueNewSessionId(res);
    expect(newId).not.toBe("old-session-id");
    expect(newId).toBeTruthy();
  });
});

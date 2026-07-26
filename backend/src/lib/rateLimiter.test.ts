import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

// Override NODE_ENV so the rate-limiter module loads without the test-mode
// shortcut that bypasses the actual rate-limiting logic.
vi.hoisted(() => { process.env.NODE_ENV = "development"; });

import { rateLimiter } from "./rateLimiter.js";

function mockReqRes(ip?: string): { req: Request; res: Response; statusCode: () => number; jsonBody: () => unknown; headers: Record<string, string> } {
  let statusCode = 200;
  let jsonBody: unknown = null;
  const headers: Record<string, string> = {};
  const res = {
    status: (code: number) => { statusCode = code; return res; },
    json: (body: unknown) => { jsonBody = body; },
    setHeader: (key: string, value: string) => { headers[key] = value; },
  } as unknown as Response;
  const req = {
    ip: ip ?? "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
  } as Request;
  return { req, res, statusCode: () => statusCode, jsonBody: () => jsonBody, headers };
}

describe("rateLimiter", () => {
  it("allows requests under the limit", () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 5 });
    const { req, res } = mockReqRes("192.168.1.1");
    let called = false;
    middleware(req, res, () => { called = true; });
    expect(called).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 2 });
    const { req, res } = mockReqRes("10.0.0.100");
    middleware(req, res, () => {});
    middleware(req, res, () => {});
    const jsonBody = vi.fn();
    const status = vi.fn(() => ({ json: jsonBody }));
    middleware(req, { ...res, status } as unknown as Response, () => {});
    expect(status).toHaveBeenCalledWith(429);
  });

  it("tracks different IPs independently", () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 1 });
    const { req: req1, res: res1 } = mockReqRes("10.0.0.200");
    const { req: req2, res: res2 } = mockReqRes("10.0.0.201");
    let called1 = false;
    let called2 = false;
    middleware(req1, res1, () => { called1 = true; });
    middleware(req2, res2, () => { called2 = true; });
    expect(called1).toBe(true);
    expect(called2).toBe(true);
  });
});

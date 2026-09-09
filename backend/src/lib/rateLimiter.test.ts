import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

// Override NODE_ENV so the rate-limiter module loads without the test-mode
// shortcut that bypasses the actual rate-limiting logic.
vi.hoisted(() => { process.env.NODE_ENV = "development"; });

import { rateLimiter } from "./rateLimiter.js";

// A stand-in browser: keeps its own cookie jar, so requests it makes share a
// rate-limit bucket while a different client's don't — regardless of IP.
function makeClient(opts: { ip?: string; acceptsCookies?: boolean } = {}) {
  const { ip = "203.0.113.10", acceptsCookies = true } = opts;
  const jar: Record<string, string> = {};

  function call(middleware: ReturnType<typeof rateLimiter>) {
    let statusCode = 200;
    let jsonBody: Record<string, unknown> | null = null;
    const headers: Record<string, string | number> = {};
    const res = {
      status: (code: number) => { statusCode = code; return res; },
      json: (body: Record<string, unknown>) => { jsonBody = body; return res; },
      setHeader: (key: string, value: string | number) => { headers[key] = value; },
      cookie: (name: string, value: string) => {
        if (!acceptsCookies) throw new Error("cookies disabled");
        jar[name] = value;
      },
    } as unknown as Response;
    const req = {
      ip,
      socket: { remoteAddress: ip },
      cookies: { ...jar },
    } as unknown as Request;

    let nextCalled = false;
    middleware(req, res, () => { nextCalled = true; });
    return { nextCalled, statusCode, jsonBody, headers };
  }

  // The first request from any browser is IP-keyed (no session cookie yet);
  // warm one through now so the assertions below hit the steady-state
  // per-session bucket with intuitive counts.
  call(rateLimiter({ name: "__warmup__", windowMs: 60_000, max: 1e9 }));

  return { call };
}

describe("rateLimiter", () => {
  it("allows requests under the limit", () => {
    const middleware = rateLimiter({ name: "t1", windowMs: 60_000, max: 5 });
    const client = makeClient();
    for (let i = 0; i < 5; i++) {
      expect(client.call(middleware).nextCalled).toBe(true);
    }
  });

  it("blocks requests over the limit with a meaningful 429 payload", () => {
    const middleware = rateLimiter({ name: "t2", windowMs: 60_000, max: 2 });
    const client = makeClient();
    client.call(middleware);
    client.call(middleware);
    const third = client.call(middleware);
    const body = third.jsonBody as { code?: string; retryAfter?: number } | null;
    expect(third.nextCalled).toBe(false);
    expect(third.statusCode).toBe(429);
    expect(body?.code).toBe("RATE_LIMITED");
    expect(typeof body?.retryAfter).toBe("number");
    expect(third.headers["Retry-After"]).toBeDefined();
  });

  it("scopes the limit per session, not per IP", () => {
    const middleware = rateLimiter({ name: "t3", windowMs: 60_000, max: 1 });
    // Same IP (e.g. behind carrier NAT), two different browsers.
    const a = makeClient({ ip: "198.51.100.1" });
    const b = makeClient({ ip: "198.51.100.1" });
    expect(a.call(middleware).nextCalled).toBe(true);
    expect(a.call(middleware).nextCalled).toBe(false); // a is now limited
    expect(b.call(middleware).nextCalled).toBe(true);  // b is unaffected
  });

  it("falls back to IP for cookieless clients", () => {
    const middleware = rateLimiter({ name: "t4", windowMs: 60_000, max: 1 });
    const client = makeClient({ ip: "192.0.2.55", acceptsCookies: false });
    expect(client.call(middleware).nextCalled).toBe(true);
    expect(client.call(middleware).nextCalled).toBe(false);
  });
});

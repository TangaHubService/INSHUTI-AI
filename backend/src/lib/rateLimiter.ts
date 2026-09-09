import type { Request, Response, NextFunction } from "express";

import { getOrCreateSessionId, readSessionId } from "./session.js";
import { getUserFromRequest } from "./userAuth.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS).unref?.();

// Identify the caller so the limit is scoped to a single person, not to a
// shared egress IP. Behind a load balancer or carrier NAT (common for mobile
// users in Rwanda) every request otherwise looks like it comes from one
// address, so a handful of active users would lock everyone else out.
//
// Preference order:
//   1. authenticated user id  — survives across devices / networks
//   2. anonymous session cookie — stable per browser, minted on first hit
//   3. request IP              — last resort for cookieless clients (curl, bots)
function clientKey(req: Request, res: Response): string {
  const user = getUserFromRequest(req);
  if (user?.userId) return `u:${user.userId}`;

  const existing = readSessionId(req);
  if (existing) return `s:${existing}`;

  // No verified session cookie yet. Mint one so a real browser lands in a
  // stable per-session bucket from its next request onward, but key *this*
  // request on IP — a client that never sends cookies back (curl, a bot)
  // would otherwise get a fresh bucket every time and bypass the limit.
  try {
    getOrCreateSessionId(req, res);
  } catch {
    // res.cookie unavailable (e.g. in unit tests) — IP fallback still applies.
  }
  return `ip:${req.ip ?? req.socket.remoteAddress ?? "unknown"}`;
}

export function rateLimiter(opts: { windowMs: number; max: number; name?: string }) {
  if (process.env.NODE_ENV === "test") {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  // Namespace each limiter's buckets so the strict /api/chat limit and the
  // loose global limit don't share (and corrupt) the same counter.
  const namespace = opts.name ?? `${opts.windowMs}:${opts.max}`;
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${namespace}|${clientKey(req, res)}`;
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }
    entry.count += 1;
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader("X-RateLimit-Limit", opts.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, opts.max - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    if (entry.count > opts.max) {
      res.setHeader("Retry-After", retryAfterSec);
      res.status(429).json({
        error:
          `You've made too many requests in a short time. ` +
          `Please wait ${retryAfterSec} second${retryAfterSec === 1 ? "" : "s"} and try again.`,
        code: "RATE_LIMITED",
        retryAfter: retryAfterSec,
      });
      return;
    }
    next();
  };
}

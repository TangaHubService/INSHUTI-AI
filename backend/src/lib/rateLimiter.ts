import type { Request, Response, NextFunction } from "express";

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
}, CLEANUP_INTERVAL_MS);

export function rateLimiter(opts: { windowMs: number; max: number }) {
  if (process.env.NODE_ENV === "test") {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }
    entry.count += 1;
    res.setHeader("X-RateLimit-Limit", opts.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, opts.max - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    if (entry.count > opts.max) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}

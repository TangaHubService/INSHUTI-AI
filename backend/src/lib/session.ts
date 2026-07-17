import { randomUUID } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";

export const SESSION_COOKIE_NAME = "inshuti_session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// frontend and backend run on different ports locally (same registrable
// domain "localhost", so SameSite=Lax still crosses that boundary) but on
// different domains in production, which needs SameSite=None + Secure to
// survive the frontend's cross-site fetch.
function sessionCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: ONE_YEAR_MS,
    path: "/",
  };
}

// Never store any PII against this id — it's an opaque anonymous handle.
export function getOrCreateSessionId(req: Request, res: Response): string {
  const existing = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof existing === "string" && existing.length > 0) {
    return existing;
  }
  const sessionId = randomUUID();
  res.cookie(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());
  return sessionId;
}

// Used by the Phase 3 "clear my history" flow: wipes the old id's data
// first, then this issues a fresh one so the cleared session can't be
// re-linked to anything after the fact.
export function issueNewSessionId(res: Response): string {
  const sessionId = randomUUID();
  res.cookie(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());
  return sessionId;
}

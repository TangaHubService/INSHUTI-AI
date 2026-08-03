import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { env } from "./env.js";

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

function signedSessionValue(sessionId: string): string {
  const signature = createHmac("sha256", env.SESSION_COOKIE_SECRET).update(sessionId).digest("base64url");
  return `${sessionId}.${signature}`;
}

function verifiedSessionId(value: string): string | null {
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const sessionId = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = createHmac("sha256", env.SESSION_COOKIE_SECRET).update(sessionId).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return sessionId;
}

// Never store any PII against this id — it's an opaque anonymous handle.
export function getOrCreateSessionId(req: Request, res: Response): string {
  const existing = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof existing === "string") {
    const sessionId = verifiedSessionId(existing);
    if (sessionId) return sessionId;
  }
  const sessionId = randomUUID();
  res.cookie(SESSION_COOKIE_NAME, signedSessionValue(sessionId), sessionCookieOptions());
  return sessionId;
}

// Used by the Phase 3 "clear my history" flow: wipes the old id's data
// first, then this issues a fresh one so the cleared session can't be
// re-linked to anything after the fact.
export function issueNewSessionId(res: Response): string {
  const sessionId = randomUUID();
  res.cookie(SESSION_COOKIE_NAME, signedSessionValue(sessionId), sessionCookieOptions());
  return sessionId;
}

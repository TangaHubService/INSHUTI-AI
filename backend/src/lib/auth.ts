import bcrypt from "bcryptjs";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ADMIN_ROLE_RANK, type AdminRole } from "./constants.js";
import { env } from "./env.js";

export const ADMIN_SESSION_COOKIE_NAME = "inshuti_admin_session";
const TOKEN_EXPIRY = "8h";
const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000;

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

function adminCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: TOKEN_EXPIRY_MS,
    path: "/",
  };
}

export function setAdminSessionCookie(res: Response, token: string): void {
  res.cookie(ADMIN_SESSION_COOKIE_NAME, token, adminCookieOptions());
}

export function clearAdminSessionCookie(res: Response): void {
  res.clearCookie(ADMIN_SESSION_COOKIE_NAME, { path: "/" });
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

// Usable as Express middleware in any admin route. minRole enforces a role
// hierarchy (MODERATOR < CONTENT_REVIEWER < SUPER_ADMIN, see
// ADMIN_ROLE_RANK) — omit it to require only "any authenticated admin".
export function requireAdmin(minRole?: AdminRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.[ADMIN_SESSION_COOKIE_NAME];
    const payload = typeof token === "string" ? verifyAdminToken(token) : null;

    if (!payload) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (minRole && ADMIN_ROLE_RANK[payload.role] < ADMIN_ROLE_RANK[minRole]) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    req.admin = payload;
    next();
  };
}

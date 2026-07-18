import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

import { env } from "./env.js";
import type { UserRole } from "./constants.js";

const TOKEN_COOKIE = "inshuti_user_token";
const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000;
const SALT_ROUNDS = 12;

function serializeToken(payload: { userId: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + TOKEN_EXPIRY_MS })).toString("base64url");
  const signature = crypto.createHmac("sha256", env.JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function deserializeToken(token: string): { userId: string; role: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", env.JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, role: payload.role };
  } catch { return null; }
}

export function setUserCookie(res: Response, userId: string, role: UserRole): void {
  const token = serializeToken({ userId, role });
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_EXPIRY_MS,
    path: "/",
  });
}

export function clearUserCookie(res: Response): void {
  res.clearCookie(TOKEN_COOKIE, { path: "/" });
}

export function getUserFromRequest(req: Request): { userId: string; role: string } | null {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) return null;
  return deserializeToken(token);
}

export interface AuthenticatedUserRequest extends Request {
  user?: { userId: string; role: string };
}

export function requireUser(req: AuthenticatedUserRequest, res: Response, next: NextFunction): void {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.user = user;
  next();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

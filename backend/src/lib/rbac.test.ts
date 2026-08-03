import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import { ADMIN_SESSION_COOKIE_NAME, requireAdmin, signAdminToken } from "./auth.js";
import { deserializeToken } from "./userAuth.js";

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as Response;
}

describe("RBAC boundaries", () => {
  it("blocks a moderator from super-admin routes", () => {
    const req = { cookies: { [ADMIN_SESSION_COOKIE_NAME]: signAdminToken({ sub: "1", email: "mod@example.com", name: "Mod", role: "MODERATOR" }) } } as unknown as Request;
    const res = response();
    const next = vi.fn() as NextFunction;
    requireAdmin("SUPER_ADMIN")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows a super administrator", () => {
    const req = { cookies: { [ADMIN_SESSION_COOKIE_NAME]: signAdminToken({ sub: "1", email: "admin@example.com", name: "Admin", role: "SUPER_ADMIN" }) } } as unknown as Request;
    const res = response();
    const next = vi.fn() as NextFunction;
    requireAdmin("SUPER_ADMIN")(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects malformed user-token signatures without throwing", () => {
    expect(deserializeToken("e30.e30.x")).toBeNull();
  });
});

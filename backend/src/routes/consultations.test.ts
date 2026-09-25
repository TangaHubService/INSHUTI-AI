import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import type { Request, Response } from "express";

import { createApp } from "../app.js";
import { setUserCookie } from "../lib/userAuth.js";
import { getOrCreateSessionId, SESSION_COOKIE_NAME } from "../lib/session.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();

function userCookie(userId: string) {
  let value = "";
  const fakeRes = { cookie: (_n: string, v: string) => { value = v; } } as unknown as Response;
  setUserCookie(fakeRes, userId, "TEENAGER");
  return `inshuti_user_token=${value}`;
}

// Mint a real signed session cookie and return both the header and the
// unsigned id that gets persisted on the conversation.
function anonSession() {
  let value = "";
  const fakeReq = { cookies: {} } as unknown as Request;
  const fakeRes = { cookie: (_n: string, v: string) => { value = v; } } as unknown as Response;
  const id = getOrCreateSessionId(fakeReq, fakeRes);
  return { header: `${SESSION_COOKIE_NAME}=${value}`, id };
}

describe("POST /api/consultations/request", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "teen-1", role: "TEENAGER", active: true, lastActivityAt: new Date(),
    } as never);
    vi.mocked(prisma.appSettings.findUnique).mockResolvedValue({ sessionTimeoutMinutes: 60 } as never);
    vi.mocked(prisma.message.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.healthcareProfessional.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.consultation.create).mockResolvedValue({ id: "cons-1", professionalId: null, status: "PENDING" } as never);
  });

  it("lets a signed-in teen claim a conversation started in the same anonymous session", async () => {
    const session = anonSession();
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({
      id: "conv-1", userId: null, sessionId: session.id, messages: [],
    } as never);

    const res = await request(app)
      .post("/api/consultations/request")
      .set("Cookie", `${userCookie("teen-1")}; ${session.header}`)
      .send({ conversationId: "conv-1" });

    expect(res.status).toBe(201);
    expect(prisma.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: "teen-1" } }),
    );
  });

  it("403s when the anonymous conversation belongs to a different session", async () => {
    const session = anonSession();
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({
      id: "conv-2", userId: null, sessionId: "a-different-session-id", messages: [],
    } as never);

    const res = await request(app)
      .post("/api/consultations/request")
      .set("Cookie", `${userCookie("teen-1")}; ${session.header}`)
      .send({ conversationId: "conv-2" });

    expect(res.status).toBe(403);
  });
});

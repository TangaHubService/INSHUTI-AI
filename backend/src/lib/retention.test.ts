import { describe, expect, it, vi } from "vitest";

import { prisma } from "./prisma.js";
import { purgeExpiredAnonymousConversations } from "./retention.js";

describe("anonymous retention", () => {
  it("deletes expired unlinked conversations and their dependent safety records", async () => {
    vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([{
      id: "expired",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      userId: null,
      language: "EN",
      sessionId: "anonymous-session",
    }]);
    vi.mocked(prisma.message.findMany).mockResolvedValueOnce([{
      id: "message",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      role: "USER",
      topicId: null,
      consultationId: null,
      conversationId: "expired",
      content: "expired content",
      sourcesUsed: "[]",
      confidence: null,
      readAt: null,
    }]);
    expect(await purgeExpiredAnonymousConversations(new Date("2026-08-03T00:00:00Z"))).toBe(1);
    expect(prisma.flaggedItem.deleteMany).toHaveBeenCalled();
    expect(prisma.conversation.deleteMany).toHaveBeenCalled();
  });
});

import { env } from "./env.js";
import { prisma } from "./prisma.js";

export async function purgeExpiredAnonymousConversations(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - env.ANONYMOUS_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const expired = await prisma.conversation.findMany({
    where: { userId: null, consultation: null, createdAt: { lt: cutoff } },
    select: { id: true },
    take: 500,
  });
  if (!expired.length) return 0;
  const ids = expired.map(({ id }) => id);
  const messages = await prisma.message.findMany({ where: { conversationId: { in: ids } }, select: { id: true } });
  const messageIds = messages.map(({ id }) => id);
  await prisma.$transaction([
    prisma.flaggedItem.deleteMany({ where: { messageId: { in: messageIds } } }),
    prisma.message.deleteMany({ where: { conversationId: { in: ids } } }),
    prisma.conversation.deleteMany({ where: { id: { in: ids } } }),
  ]);
  return ids.length;
}

import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";

const router = Router();

router.get("/", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId: req.user!.userId, read: false } });

  res.json({ notifications, unreadCount });
});

router.patch("/:id/read", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id as string } });
  if (!notification || notification.userId !== req.user!.userId) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });
  res.json({ notification: updated });
});

router.patch("/read-all", requireUser, async (req: AuthenticatedUserRequest, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.userId, read: false }, data: { read: true } });
  res.json({ ok: true });
});

export default router;

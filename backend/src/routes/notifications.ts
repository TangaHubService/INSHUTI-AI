import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { z } from "zod";
import { env } from "../lib/env.js";

const router = Router();

router.get("/push-config", requireUser, (_req, res) => {
  res.json({ enabled: Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY), publicKey: env.VAPID_PUBLIC_KEY || null });
});

router.post("/push-subscriptions", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid push subscription" }); return; }
  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: { userId: req.user!.userId, endpoint: parsed.data.endpoint, p256dh: parsed.data.keys.p256dh, auth: parsed.data.keys.auth },
    update: { userId: req.user!.userId, p256dh: parsed.data.keys.p256dh, auth: parsed.data.keys.auth },
  });
  res.status(201).json({ subscribed: true });
});

router.delete("/push-subscriptions", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ endpoint: z.string().url() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid push subscription" }); return; }
  await prisma.pushSubscription.deleteMany({ where: { endpoint: parsed.data.endpoint, userId: req.user!.userId } });
  res.json({ subscribed: false });
});

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

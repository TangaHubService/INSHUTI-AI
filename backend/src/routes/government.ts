import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { APPOINTMENT_STATUSES, FACILITY_TYPES, LANGUAGES, MESSAGE_ROLES } from "../lib/constants.js";

const router = Router();
const [USER] = MESSAGE_ROLES;

router.get("/stats", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const governmentUser = await prisma.governmentUser.findUnique({ where: { userId: req.user!.userId } });
  if (!governmentUser) {
    res.status(403).json({ error: "Not a government user" });
    return;
  }

  const [
    totalConversations,
    languageCounts,
    topicMessages,
    consultationCounts,
    referralCount,
    appointmentCounts,
    facilities,
  ] = await Promise.all([
    prisma.conversation.count(),
    Promise.all(LANGUAGES.map((language) => prisma.conversation.count({ where: { language } }))),
    prisma.message.findMany({
      where: { role: USER, topicId: { not: null } },
      include: { topic: true },
    }),
    prisma.consultation.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.consultation.count({ where: { professionalId: { not: null } } }),
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.healthFacility.findMany({ select: { district: true, type: true } }),
  ]);

  const languageSplit = Object.fromEntries(LANGUAGES.map((language, i) => [language, languageCounts[i]]));

  const topicEngagement = new Map<string, { topic: NonNullable<(typeof topicMessages)[number]["topic"]>; count: number }>();
  for (const message of topicMessages) {
    if (!message.topic) continue;
    const existing = topicEngagement.get(message.topic.id);
    if (existing) {
      existing.count += 1;
    } else {
      topicEngagement.set(message.topic.id, { topic: message.topic, count: 1 });
    }
  }
  const topicEngagementList = [...topicEngagement.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ topic, count }) => ({
      topic: { id: topic.id, slug: topic.slug, nameEn: topic.nameEn, nameRw: topic.nameRw, colorToken: topic.colorToken },
      count,
    }));

  const consultationsByStatus = Object.fromEntries(consultationCounts.map((c) => [c.status, c._count._all]));
  const appointmentsByStatus = Object.fromEntries(
    APPOINTMENT_STATUSES.map((status) => [status, appointmentCounts.find((a) => a.status === status)?._count._all ?? 0]),
  );

  const facilitiesByDistrict: Record<string, number> = {};
  const facilitiesByType = Object.fromEntries(FACILITY_TYPES.map((type) => [type, 0])) as Record<string, number>;
  for (const facility of facilities) {
    facilitiesByDistrict[facility.district] = (facilitiesByDistrict[facility.district] ?? 0) + 1;
    facilitiesByType[facility.type] = (facilitiesByType[facility.type] ?? 0) + 1;
  }

  res.json({
    scope: { level: governmentUser.level, regionName: governmentUser.regionName, coverage: "nationwide" },
    totalConversations,
    languageSplit,
    topicEngagement: topicEngagementList,
    consultationsByStatus,
    referralCount,
    appointmentsByStatus,
    facilitiesByDistrict,
    facilitiesByType,
  });
});

export default router;

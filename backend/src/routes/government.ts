import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { APPOINTMENT_STATUSES, FACILITY_TYPES, LANGUAGES, MESSAGE_ROLES } from "../lib/constants.js";
import type { Prisma } from "@prisma/client";
import { env } from "../lib/env.js";

const router = Router();
const [USER] = MESSAGE_ROLES;

router.get("/stats", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const governmentUser = await prisma.governmentUser.findUnique({ where: { userId: req.user!.userId } });
  if (!governmentUser) {
    res.status(403).json({ error: "Not a government user" });
    return;
  }

  const locationField = ({ PROVINCIAL: "province", DISTRICT: "district", SECTOR: "sector", CELL: "cell" } as const)[governmentUser.level as "PROVINCIAL" | "DISTRICT" | "SECTOR" | "CELL"];
  const userWhere: Prisma.UserWhereInput | undefined = locationField && governmentUser.regionName
    ? { [locationField]: { equals: governmentUser.regionName, mode: "insensitive" } }
    : undefined;
  const conversationWhere: Prisma.ConversationWhereInput = userWhere ? { user: { is: userWhere } } : {};
  const consultationWhere: Prisma.ConsultationWhereInput = userWhere ? { user: { is: userWhere } } : {};
  const appointmentWhere: Prisma.AppointmentWhereInput = userWhere ? { user: { is: userWhere } } : {};
  const facilityWhere: Prisma.HealthFacilityWhereInput = governmentUser.level === "DISTRICT"
    ? { district: governmentUser.regionName }
    : governmentUser.level === "SECTOR"
      ? { sector: governmentUser.regionName }
      : {};

  const [
    totalConversations,
    languageCounts,
    topicMessages,
    consultationCounts,
    referralCount,
    appointmentCounts,
    facilities,
  ] = await Promise.all([
    prisma.conversation.count({ where: conversationWhere }),
    Promise.all(LANGUAGES.map((language) => prisma.conversation.count({ where: { ...conversationWhere, language } }))),
    prisma.message.findMany({
      where: { role: USER, topicId: { not: null }, conversation: { is: conversationWhere } },
      include: { topic: true },
    }),
    prisma.consultation.groupBy({ where: consultationWhere, by: ["status"], _count: { _all: true } }),
    prisma.consultation.count({ where: { ...consultationWhere, professionalId: { not: null } } }),
    prisma.appointment.groupBy({ where: appointmentWhere, by: ["status"], _count: { _all: true } }),
    prisma.healthFacility.findMany({ where: facilityWhere, select: { district: true, type: true } }),
  ]);

  const suppress = (count: number) => count > 0 && count < env.GOV_AGGREGATE_MIN_COUNT ? 0 : count;
  const languageSplit = Object.fromEntries(LANGUAGES.map((language, i) => [language, suppress(languageCounts[i])]));

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
      topic: { id: topic.id, slug: topic.slug, nameEn: topic.nameEn, nameRw: topic.nameRw, nameFr: topic.nameFr, nameSw: topic.nameSw, colorToken: topic.colorToken },
      count: suppress(count),
    }));

  const consultationsByStatus = Object.fromEntries(consultationCounts.map((c) => [c.status, suppress(c._count._all)]));
  const appointmentsByStatus = Object.fromEntries(
    APPOINTMENT_STATUSES.map((status) => [status, suppress(appointmentCounts.find((a) => a.status === status)?._count._all ?? 0)]),
  );

  const facilitiesByDistrict: Record<string, number> = {};
  const facilitiesByType = Object.fromEntries(FACILITY_TYPES.map((type) => [type, 0])) as Record<string, number>;
  for (const facility of facilities) {
    facilitiesByDistrict[facility.district] = (facilitiesByDistrict[facility.district] ?? 0) + 1;
    facilitiesByType[facility.type] = (facilitiesByType[facility.type] ?? 0) + 1;
  }

  res.json({
    scope: { level: governmentUser.level, regionName: governmentUser.regionName, coverage: governmentUser.level === "NATIONAL" ? "nationwide" : governmentUser.regionName },
    totalConversations: suppress(totalConversations),
    languageSplit,
    topicEngagement: topicEngagementList,
    consultationsByStatus,
    referralCount: suppress(referralCount),
    privacyThreshold: env.GOV_AGGREGATE_MIN_COUNT,
    appointmentsByStatus,
    facilitiesByDistrict,
    facilitiesByType,
  });
});

export default router;

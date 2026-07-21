import { prisma } from "./prisma.js";
import { notifyUser } from "./notifications.js";
import type { ProfessionalType } from "./constants.js";

const TOPIC_PROFESSIONAL_MAP: Record<string, ProfessionalType> = {
  "menstrual-health": "NURSE",
  pregnancy: "MIDWIFE",
  relationships: "PSYCHOLOGIST",
  "family-planning": "NURSE",
  "hiv-stis": "DOCTOR",
  "mental-health": "PSYCHOLOGIST",
};

const RISK_LEVEL_MAP: Record<string, number> = {
  CRISIS_LANGUAGE: 3,
  LOW_CONFIDENCE: 2,
  USER_REPORTED: 1,
};

const PROFESSIONAL_TIER: ProfessionalType[] = ["CHW", "NURSE", "MIDWIFE", "PSYCHOLOGIST", "DOCTOR"];

function getRequiredTier(priority: number): ProfessionalType {
  if (priority >= 3) return "DOCTOR";
  if (priority >= 2) return "PSYCHOLOGIST";
  if (priority >= 1) return "NURSE";
  return "CHW";
}

export async function routeConsultation(params: {
  conversationId: string;
  userId: string;
  topicSlug?: string | null;
  riskFlags?: string[];
}): Promise<{ consultationId: string; assignedTo: string | null; status: string }> {
  const priority = Math.max(
    0,
    ...(params.riskFlags ?? []).map((f) => RISK_LEVEL_MAP[f] ?? 0),
    params.topicSlug ? (TOPIC_PROFESSIONAL_MAP[params.topicSlug] ? 1 : 0) : 0,
  );

  const requiredType = getRequiredTier(priority);

  const availableProfessional = await prisma.healthcareProfessional.findFirst({
    where: {
      approvalStatus: "APPROVED",
      consultations: { none: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } },
    },
    orderBy: { id: "asc" },
  });

  const consultation = await prisma.consultation.create({
    data: {
      conversationId: params.conversationId,
      userId: params.userId,
      status: availableProfessional ? "ASSIGNED" : "PENDING",
      priority,
      professionalId: availableProfessional?.id,
      assignedAt: availableProfessional ? new Date() : null,
    },
  });

  if (availableProfessional) {
    await notifyUser({
      userId: availableProfessional.userId,
      type: "REFERRAL",
      title: "New consultation assigned",
      body: "A user has been referred to you for follow-up. Please review and respond.",
    });
    await notifyUser({
      userId: params.userId,
      type: "CONSULTATION_UPDATE",
      title: "You've been connected with a professional",
      body: "Someone from our team will follow up with you shortly.",
    });
  }

  return {
    consultationId: consultation.id,
    assignedTo: consultation.professionalId,
    status: consultation.status,
  };
}

export async function reassignConsultation(
  consultationId: string,
  newProfessionalId: string,
): Promise<void> {
  const consultation = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      professionalId: newProfessionalId,
      status: "ASSIGNED",
      assignedAt: new Date(),
    },
  });

  const newProfessional = await prisma.healthcareProfessional.findUnique({ where: { id: newProfessionalId } });
  if (newProfessional) {
    await notifyUser({
      userId: newProfessional.userId,
      type: "REFERRAL",
      title: "Consultation reassigned to you",
      body: "A consultation has been reassigned to you. Please review and respond.",
    });
  }
  await notifyUser({
    userId: consultation.userId,
    type: "CONSULTATION_UPDATE",
    title: "Your consultation has been reassigned",
    body: "You've been connected with a different professional. They will follow up with you shortly.",
  });
}

export async function escalateConsultation(consultationId: string): Promise<void> {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { professional: true },
  });
  if (!consultation) throw new Error("Consultation not found");

  const currentTier = consultation.professional
    ? PROFESSIONAL_TIER.indexOf(consultation.professional.professionalType as ProfessionalType)
    : -1;

  const nextType = currentTier < PROFESSIONAL_TIER.length - 1
    ? PROFESSIONAL_TIER[currentTier + 1]
    : PROFESSIONAL_TIER[PROFESSIONAL_TIER.length - 1];

  const newProfessional = await prisma.healthcareProfessional.findFirst({
    where: {
      professionalType: nextType,
      approvalStatus: "APPROVED",
      consultations: { none: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } },
    },
    orderBy: { id: "asc" },
  });

  await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      professionalId: newProfessional?.id ?? consultation.professionalId,
      status: newProfessional ? "ASSIGNED" : "PENDING",
      assignedAt: newProfessional ? new Date() : consultation.assignedAt,
    },
  });

  if (newProfessional) {
    await notifyUser({
      userId: newProfessional.userId,
      type: "REFERRAL",
      title: "Consultation escalated to you",
      body: "A consultation has been escalated to you for higher-tier follow-up. Please review and respond.",
    });
  }
  await notifyUser({
    userId: consultation.userId,
    type: "CONSULTATION_UPDATE",
    title: "Your consultation has been escalated",
    body: "Your case has been escalated to a specialist for closer follow-up.",
  });
}

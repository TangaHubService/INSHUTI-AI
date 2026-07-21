import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthenticatedUserRequest } from "../lib/userAuth.js";
import { queueAppointmentReminder } from "../lib/notifications.js";
import { PROFESSIONAL_TYPES, professionalTypeSchema } from "../lib/constants.js";

const router = Router();

router.get("/professionals", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const typeParam = req.query.type;
  const parsedType = typeof typeParam === "string" ? professionalTypeSchema.safeParse(typeParam) : null;

  const professionals = await prisma.healthcareProfessional.findMany({
    where: {
      approvalStatus: "APPROVED",
      ...(parsedType?.success ? { professionalType: parsedType.data } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: { id: "asc" },
  });

  res.json({
    professionals: professionals.map((p) => ({
      id: p.id,
      name: p.user.name,
      professionalType: p.professionalType,
      specialization: p.specialization,
      availability: p.availability,
    })),
    professionalTypes: PROFESSIONAL_TYPES,
  });
});

const requestSchema = z.object({
  professionalId: z.string().min(1),
  requestedTime: z.coerce.date(),
  notes: z.string().max(2000).optional(),
});

router.post("/", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  if (parsed.data.requestedTime.getTime() < Date.now()) {
    res.status(400).json({ error: "Requested time must be in the future" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { id: parsed.data.professionalId } });
  if (!professional || professional.approvalStatus !== "APPROVED") {
    res.status(404).json({ error: "Professional not found" });
    return;
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: req.user!.userId,
      professionalId: parsed.data.professionalId,
      requestedTime: parsed.data.requestedTime,
      notes: parsed.data.notes,
    },
  });

  await queueAppointmentReminder(appointment.id);

  res.status(201).json({ appointment });
});

router.get("/mine", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { userId: req.user!.userId },
    orderBy: { requestedTime: "desc" },
    include: { professional: { include: { user: { select: { name: true } } } } },
  });

  res.json({
    appointments: appointments.map((a) => ({
      id: a.id,
      requestedTime: a.requestedTime,
      status: a.status,
      notes: a.notes,
      outcome: a.outcome,
      professional: { id: a.professional.id, name: a.professional.user.name, professionalType: a.professional.professionalType },
    })),
  });
});

router.patch("/:id/reschedule", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ requestedTime: z.coerce.date() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  if (parsed.data.requestedTime.getTime() < Date.now()) {
    res.status(400).json({ error: "Requested time must be in the future" });
    return;
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id as string } });
  if (!appointment || appointment.userId !== req.user!.userId) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    res.status(409).json({ error: `Cannot reschedule a ${appointment.status.toLowerCase()} appointment` });
    return;
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { requestedTime: parsed.data.requestedTime, status: "RESCHEDULED" },
  });

  await queueAppointmentReminder(updated.id);

  res.json({ appointment: updated });
});

router.patch("/:id/cancel", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id as string } });
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  const isOwner = appointment.userId === req.user!.userId;
  const isAssignedProfessional = professional && professional.id === appointment.professionalId;
  if (!isOwner && !isAssignedProfessional) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }
  if (appointment.status === "COMPLETED") {
    res.status(409).json({ error: "Cannot cancel a completed appointment" });
    return;
  }

  const updated = await prisma.appointment.update({ where: { id: appointment.id }, data: { status: "CANCELLED" } });
  res.json({ appointment: updated });
});

router.get("/professional/calendar", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  if (!professional) {
    res.status(403).json({ error: "Not a healthcare professional" });
    return;
  }

  const appointments = await prisma.appointment.findMany({
    where: { professionalId: professional.id },
    orderBy: { requestedTime: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  res.json({
    appointments: appointments.map((a) => ({
      id: a.id,
      requestedTime: a.requestedTime,
      status: a.status,
      notes: a.notes,
      outcome: a.outcome,
      user: { name: a.user.name, email: a.user.email },
    })),
  });
});

router.patch("/:id/respond", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ accept: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id as string } });
  if (!appointment || !professional || appointment.professionalId !== professional.id) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (appointment.status !== "REQUESTED" && appointment.status !== "RESCHEDULED") {
    res.status(409).json({ error: `Cannot respond to a ${appointment.status.toLowerCase()} appointment` });
    return;
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: parsed.data.accept ? "CONFIRMED" : "CANCELLED" },
  });

  if (parsed.data.accept) await queueAppointmentReminder(updated.id);

  res.json({ appointment: updated });
});

router.patch("/:id/outcome", requireUser, async (req: AuthenticatedUserRequest, res) => {
  const parsed = z.object({ outcome: z.string().min(1).max(4000) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const professional = await prisma.healthcareProfessional.findUnique({ where: { userId: req.user!.userId } });
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id as string } });
  if (!appointment || !professional || appointment.professionalId !== professional.id) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "COMPLETED", outcome: parsed.data.outcome },
  });

  res.json({ appointment: updated });
});

export default router;

import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";
import { decodeJsonColumn, encodeJsonColumn } from "../lib/jsonColumn.js";
import { FACILITY_TYPES, facilityTypeSchema } from "../lib/constants.js";

const router = Router();

function serializeFacility(facility: {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  district: string;
  sector: string;
  services: string;
  contact: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return { ...facility, services: decodeJsonColumn(facility.services) };
}

// Public — anyone (including anonymous users) can search for care.
router.get("/", async (req, res) => {
  const typeParam = req.query.type;
  const parsedType = typeof typeParam === "string" ? facilityTypeSchema.safeParse(typeParam) : null;
  const district = typeof req.query.district === "string" ? req.query.district : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  const facilities = await prisma.healthFacility.findMany({
    where: {
      ...(parsedType?.success ? { type: parsedType.data } : {}),
      ...(district ? { district } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { name: "asc" },
  });

  res.json({ facilities: facilities.map(serializeFacility), facilityTypes: FACILITY_TYPES });
});

router.get("/:id", async (req, res) => {
  const facility = await prisma.healthFacility.findUnique({ where: { id: req.params.id as string } });
  if (!facility) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  res.json({ facility: serializeFacility(facility) });
});

const facilitySchema = z.object({
  name: z.string().min(1).max(200),
  type: facilityTypeSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  district: z.string().min(1).max(100),
  sector: z.string().min(1).max(100),
  services: z.array(z.string()).default([]),
  contact: z.string().max(200).optional(),
});

router.post("/", requireAdmin("CONTENT_REVIEWER"), async (req, res) => {
  const parsed = facilitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const { services, ...rest } = parsed.data;
  const facility = await prisma.healthFacility.create({ data: { ...rest, services: encodeJsonColumn(services) } });
  res.status(201).json({ facility: serializeFacility(facility) });
});

const updateFacilitySchema = facilitySchema.partial();

router.patch("/:id", requireAdmin("CONTENT_REVIEWER"), async (req, res) => {
  const parsed = updateFacilitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }

  const existing = await prisma.healthFacility.findUnique({ where: { id: req.params.id as string } });
  if (!existing) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }

  const { services, ...rest } = parsed.data;
  const facility = await prisma.healthFacility.update({
    where: { id: existing.id },
    data: { ...rest, ...(services ? { services: encodeJsonColumn(services) } : {}) },
  });
  res.json({ facility: serializeFacility(facility) });
});

router.delete("/:id", requireAdmin("CONTENT_REVIEWER"), async (req, res) => {
  const existing = await prisma.healthFacility.findUnique({ where: { id: req.params.id as string } });
  if (!existing) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  await prisma.healthFacility.delete({ where: { id: existing.id } });
  res.status(204).send();
});

export default router;

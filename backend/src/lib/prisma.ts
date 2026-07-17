import { PrismaClient } from "@prisma/client";

// A plain singleton is enough here: unlike Next.js dev (in-process HMR that
// re-evaluates modules and would otherwise create a new PrismaClient per
// edit), `tsx watch` restarts the whole Node process on file change, so this
// module only ever runs once per process regardless.
export const prisma = new PrismaClient();

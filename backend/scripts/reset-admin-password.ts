// One-off admin password reset. There is deliberately no HTTP endpoint for
// this (see routes/adminUsers.ts: updateAdminSchema only allows
// name/role/active, never password) — resetting a credential should not be
// a click away in the admin UI. Run this directly against the database
// instead, with the new password read from the environment only (never a
// CLI arg — those can end up in shell history).
//
// Usage:
//   RESET_ADMIN_EMAIL="you@example.com" \
//   RESET_ADMIN_PASSWORD="new-password-at-least-12-chars" \
//   npx tsx scripts/reset-admin-password.ts
import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma.js";

const email = process.env.RESET_ADMIN_EMAIL;
const password = process.env.RESET_ADMIN_PASSWORD;

async function main() {
  if (!email || !email.includes("@")) {
    throw new Error("Set RESET_ADMIN_EMAIL to the admin's email address.");
  }
  if (!password || password.length < 12) {
    throw new Error("Set RESET_ADMIN_PASSWORD to a password of at least 12 characters.");
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    throw new Error(`No admin found with email ${email}.`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.update({ where: { email }, data: { passwordHash } });
  console.log(`Password reset for ${email} (role: ${admin.role}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

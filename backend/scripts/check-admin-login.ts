// Diagnostic only — checks what's actually in the database for a given
// admin email, and (if a password is supplied) whether it matches the
// stored hash. Bypasses the HTTP API/frontend entirely, so it isolates
// "is the data wrong" from "is something else (wrong deployed instance,
// routing, a bug in the login handler) returning 401."
//
// Usage:
//   CHECK_ADMIN_EMAIL="you@example.com" \
//   CHECK_ADMIN_PASSWORD="the password you're typing at login" \
//   npx tsx scripts/check-admin-login.ts
import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma.js";

const email = process.env.CHECK_ADMIN_EMAIL;
const password = process.env.CHECK_ADMIN_PASSWORD;

async function main() {
  if (!email || !email.includes("@")) {
    throw new Error("Set CHECK_ADMIN_EMAIL to the admin's email address.");
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    console.log(`No admin found with email "${email}". It was never created, or was created under a different address (check for typos/whitespace).`);
    return;
  }

  console.log({
    email: admin.email,
    role: admin.role,
    active: admin.active,
    createdAt: admin.createdAt,
    // Not the full hash — just enough to confirm it looks like a real
    // bcrypt hash (starts with $2a$/$2b$/$2y$) rather than something broken.
    hashPrefix: admin.passwordHash.slice(0, 7),
  });

  if (!admin.active) {
    console.log("This account is INACTIVE — login will return 403 \"deactivated\", not 401, until it's reactivated.");
  }

  if (password) {
    const matches = await bcrypt.compare(password, admin.passwordHash);
    console.log(`Password match: ${matches}`);
    if (!matches) {
      console.log("The stored hash does NOT match this password — the account has a different password than you think, whatever set it last.");
    }
  } else {
    console.log("Set CHECK_ADMIN_PASSWORD too, to test whether it matches the stored hash.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

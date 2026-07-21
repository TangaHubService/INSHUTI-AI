// Pushes the CRISIS_RESOURCES array in prisma/seed.ts into a live database
// over the admin HTTP API — needed because upsertCrisisResources() in the
// seed script only inserts when the table is empty, so editing that array
// never updates rows a previous seed run already created. Matches existing
// rows by `order` and PATCHes them; creates any order that doesn't exist yet.
//
// Usage:
//   ADMIN_API_URL=https://your-api.example.com \
//   ADMIN_EMAIL=you@example.com \
//   ADMIN_PASSWORD=your-password \
//   node scripts/sync-crisis-resources.mjs
//
// Credentials are read from the environment only — never pass them as CLI
// args (those can end up in shell history / process listings).

import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFileSync } from "node:fs";

const backendDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seedSource = readFileSync(path.join(backendDir, "prisma/seed.ts"), "utf8");

// Lightweight extraction instead of importing seed.ts directly, since that
// module also runs a Prisma-connected main() on import.
const match = seedSource.match(/const CRISIS_RESOURCES = (\[[\s\S]*?\n\]);/);
if (!match) throw new Error("Could not find CRISIS_RESOURCES in prisma/seed.ts");
const CRISIS_RESOURCES = new Function(`return ${match[1]}`)();

const apiUrl = process.env.ADMIN_API_URL;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!apiUrl || !email || !password) {
  console.error("Set ADMIN_API_URL, ADMIN_EMAIL, and ADMIN_PASSWORD in the environment.");
  process.exit(1);
}

async function main() {
  const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) throw new Error(`Login failed (${loginRes.status}): ${await loginRes.text()}`);
  const cookie = loginRes.headers.get("set-cookie");
  if (!cookie) throw new Error("Login succeeded but no session cookie was returned.");

  const headers = { "Content-Type": "application/json", Cookie: cookie };

  const listRes = await fetch(`${apiUrl}/api/settings/crisis-resources`, { headers });
  if (!listRes.ok) throw new Error(`Failed to list crisis resources (${listRes.status}): ${await listRes.text()}`);
  const { resources: existing } = await listRes.json();

  for (const desired of CRISIS_RESOURCES) {
    const match = existing.find((r) => r.order === desired.order);
    if (match) {
      const res = await fetch(`${apiUrl}/api/settings/crisis-resources/${match.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(desired),
      });
      if (!res.ok) throw new Error(`Failed to update order ${desired.order} (${res.status}): ${await res.text()}`);
      console.log(`Updated (order ${desired.order}): ${desired.name}`);
    } else {
      const res = await fetch(`${apiUrl}/api/settings/crisis-resources`, {
        method: "POST",
        headers,
        body: JSON.stringify(desired),
      });
      if (!res.ok) throw new Error(`Failed to create order ${desired.order} (${res.status}): ${await res.text()}`);
      console.log(`Created (order ${desired.order}): ${desired.name}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

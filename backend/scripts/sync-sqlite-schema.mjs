// Keeps prisma/schema.sqlite.prisma's models in lockstep with prisma/schema.prisma
// (the source of truth). Only the generator/datasource header differs between the
// two files — this script copies everything after that header verbatim, so model
// drift between Postgres (prod) and SQLite (local dev) is impossible.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const backendDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.join(backendDir, "prisma/schema.prisma");
const targetPath = path.join(backendDir, "prisma/schema.sqlite.prisma");

const source = readFileSync(sourcePath, "utf8");
const bodyStart = source.search(/^(model|enum)\s/m);

if (bodyStart === -1) {
  throw new Error(`No model/enum declarations found in ${sourcePath}`);
}

const header = `// Local-dev-only schema — SQLite, no Postgres instance required.
// AUTO-GENERATED below the datasource block by scripts/sync-sqlite-schema.mjs
// from schema.prisma. Do not hand-edit models here — edit schema.prisma and
// re-run \`npm run dev:db:sync\` (or dev:db:generate / dev:db:migrate, which
// call it automatically).
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

`;

writeFileSync(targetPath, header + source.slice(bodyStart));
console.log(`Synced models from schema.prisma -> schema.sqlite.prisma`);

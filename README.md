# Inshuti

AI-assisted sexual & reproductive health chat and admin platform for young
people in Rwanda. Anonymous-first, reviewed-content-grounded chat with a
crisis-safety path, plus an admin panel for knowledge base and moderation.

See [`CLAUDE_CODE_IMPLEMENTATION_PROMPTS.md`](./CLAUDE_CODE_IMPLEMENTATION_PROMPTS.md)
for the phased build plan this repo follows.

## Layout

This is a monorepo with the backend and frontend as separate npm projects:

- `backend/` — Express + TypeScript API server, Prisma ORM (PostgreSQL in
  production, SQLite for local dev).
- `frontend/` — Next.js 14 (App Router, TypeScript) UI, calls the backend
  over HTTP via `frontend/lib/apiClient.ts`.
- ` test-g/` — static HTML/CSS design prototype; source of truth for the UI
  the frontend pages get ported from.

## Getting started

```bash
npm run install:all   # installs backend/ and frontend/ dependencies
```

Copy the env templates and fill in real secrets — `backend/.env.example` ships
with empty placeholders for `JWT_SECRET`, `SESSION_COOKIE_SECRET`, and
`OPENAI_API_KEY`; the server refuses to start until those are filled in
(generate secrets with `openssl rand -hex 32`):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

For local dev without a real Postgres instance, set `DATABASE_URL` in
`backend/.env` to `file:./dev.db` (resolved relative to `prisma/`, so this
creates `backend/prisma/dev.db`) and use the `dev:db:*` scripts below.

Set up the local database (SQLite, no Postgres install required):

```bash
cd backend
npm run dev:db:push   # generates prisma/schema.sqlite.prisma from schema.prisma and syncs it to prisma/dev.db
npm run dev:db:seed   # seeds topics, articles, crisis resources, app settings, and a super admin
```

The seed script prompts interactively for the super admin's email and password
(never hardcoded); set `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD`
(and optionally `SEED_SUPER_ADMIN_NAME`) to skip the prompt, e.g. in CI. Seed
articles are AI-drafted and left as `NEEDS_REVIEW` — they must be approved by
a real reviewer in the admin panel (Phase 4) before they're fit to cite in
chat responses. The two seeded `CrisisResource` rows are placeholders too —
replace the contact numbers with real, verified crisis lines before launch.

Run both apps together from the repo root:

```bash
npm run dev
```

- Backend: http://localhost:4000 (health check at `/api/health`)
- Frontend: http://localhost:3000

## Database

`backend/prisma/schema.prisma` is the source of truth (PostgreSQL). For local
dev, `backend/prisma/schema.sqlite.prisma` is auto-generated from it by
`backend/scripts/sync-sqlite-schema.mjs` — never hand-edit that file, edit
`schema.prisma` and rerun `npm run dev:db:sync` (or `dev:db:push` /
`dev:db:generate`, which call it automatically). Local dev uses
`prisma db push` (no migration history) rather than `prisma migrate dev`,
since SQLite-generated migration SQL isn't valid for Postgres and both
schema files would otherwise fight over the same `prisma/migrations/` folder.

SQLite also has no native `enum` or `Json` column types, so fields that
would otherwise be Prisma enums or Json arrays are plain `String` columns
here, validated at the application boundary — see
`backend/src/lib/constants.ts` (enums) and `backend/src/lib/jsonColumn.ts`
(JSON-encoded arrays). Never assign those columns a raw string/array; always
go through those helpers.

Production migrations run against `schema.prisma` with a real
`DATABASE_URL` via `npm run db:migrate:deploy`.

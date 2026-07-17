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
`backend/.env` to `file:./prisma/dev.db` and use the `dev:db:*` scripts below.

Set up the local database (SQLite, no Postgres install required):

```bash
cd backend
npm run dev:db:migrate   # generates prisma/schema.sqlite.prisma from schema.prisma and migrates
npm run dev:db:seed      # once Phase 1 seed data exists
```

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
`schema.prisma` and rerun `npm run dev:db:sync` (or `dev:db:migrate` /
`dev:db:generate`, which call it automatically).

Production migrations run against `schema.prisma` with a real
`DATABASE_URL` via `npm run db:migrate:deploy`.

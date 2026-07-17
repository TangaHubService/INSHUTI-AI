# Inshuti — Claude Code Implementation Prompts (Full Contract Scope)

> How to use this file: paste each prompt into Claude Code **in order**, one at a time,
> inside the same repo/session, and let it finish + commit before moving to the next.
> Each prompt assumes everything before it is already built. Do not skip ahead —
> later phases (referral routing, portals) depend on the schema and auth from earlier ones.
>
> **Reality check before you start:** Phases 0–4 are a realistic, buildable MVP that
> roughly matches a RWF 500,000 / few-day budget (this is the AI-only anonymous chat +
> admin panel already spec'd separately). Phases 5–16 are the *full* contract scope —
> 4 languages, 9 portals, referral engine, facility locator, appointments, etc. — which
> is genuinely a multi-month build. Treat Phase 4 as a natural "ship it and renegotiate
> scope/price for what's next" checkpoint with the client, not something to blow through
> silently.

---

## Phase 0 — Project Scaffold

```
Scaffold a new Next.js 14 (App Router, TypeScript) project called "inshuti".
Set up:
- Prisma with PostgreSQL (use DATABASE_URL from .env; also support sqlite for local dev)
- ESLint + Prettier
- A /lib folder for shared server utilities
- A /styles/globals.css file (leave empty for now, I will paste in an existing design
  system stylesheet next)
- A basic health-check API route at /api/health returning { status: "ok" }
- A .env.example listing: DATABASE_URL, JWT_SECRET, SESSION_COOKIE_SECRET, OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL
Commit as "chore: project scaffold".
```

## Phase 1 — Core Database Schema (v1 entities only)

```
Add a Prisma schema covering ONLY these entities for now (I will extend it in later
phases — do not add portal-specific or multilingual fields yet):

- Topic (id, slug, nameEn, nameRw, icon, colorToken)
- Article (id, topicId, titleEn, titleRw, bodyEn, bodyRw, tags[], status enum
  [REVIEWED, NEEDS_REVIEW], reviewedBy, reviewedAt, timestamps)
- Conversation (id, sessionId, language enum [EN, RW], createdAt)
- Message (id, conversationId, role, content, topicId?, sourcesUsed[], confidence?,
  createdAt)
- FlaggedItem (id, messageId unique, reason enum [CRISIS_LANGUAGE, LOW_CONFIDENCE,
  USER_REPORTED], status enum [FLAGGED, PENDING, RESOLVED], reviewerNotes, resolvedBy,
  resolvedAt, createdAt)
- AdminUser (id, email unique, passwordHash, name, role enum [SUPER_ADMIN,
  CONTENT_REVIEWER, MODERATOR], createdAt)
- CrisisResource (id, name, contact, region, order)
- AppSettings (singleton row: aiProvider, aiModel, responseStyleNote,
  restrictToKnowledgeBase, autoFlagCrisisLanguage, autoDetectLanguage)

Write a prisma/seed.ts that inserts:
- The 6 topics: Menstrual Health, Pregnancy, Relationships, Family Planning, HIV & STIs,
  Mental Health
- 1 AppSettings row with sensible defaults
- 2 placeholder CrisisResource rows (clearly marked as placeholders needing real numbers)
- 1 Super Admin (read the password from an env var or CLI prompt, never hardcode it)
- 3-5 seed Articles per topic so chat has real content to answer from on day one

Run the migration and seed locally against sqlite for dev. Commit as
"feat: core database schema + seed data".
```

## Phase 2 — Anonymous Session + AI Chat Endpoint

```
Implement:
1. lib/session.ts: on any request without an `inshuti_session` cookie, generate a
   random UUID and set it as an HttpOnly, Secure, long-lived cookie. Never store any
   PII against this id.
2. lib/crisisDetector.ts: a function that checks a raw message string against a
   maintained list of English + Kinyarwanda crisis-language patterns (self-harm,
   suicidal ideation, abuse disclosure) and returns a boolean + matched category.
   Put the list in a separate, easily-editable JSON file, not hardcoded inline.
3. lib/retrieval.ts: given a message, tokenize it and score Article rows by tag/title
   keyword overlap; return the top 1-3 matches above a minimum threshold, or an empty
   array if nothing scores high enough.
4. lib/openai.ts: an OpenAI client wrapper + a buildSystemPrompt(retrievedArticles,
   language) function implementing this prompt (fill in the {{}} placeholders):

   "You are Inshuti, a warm and non-judgmental health assistant for young people in
   Rwanda. You answer questions about sexual and reproductive health, relationships,
   and general wellbeing. Rules: 1) Base your answer primarily on the reference
   material below, reviewed by health professionals — do not contradict it. 2) If no
   reference material is given, answer briefly and cautiously and suggest a follow-up
   question or speaking to a health worker — do not invent clinical specifics. 3) Keep
   answers to 3-5 sentences, 8th-grade reading level. 4) Never be judgmental or
   preachy. 5) Respond in {{language}}. 6) Never give instructions that could
   facilitate self-harm or harm to others. 7) This is informational only, not a
   diagnosis — say so when relevant. Reference material: {{retrieved_articles}}"

5. POST /api/chat: read/create the session cookie, run crisisDetector FIRST — if it
   matches, skip the LLM entirely and return a fixed calm safety response built from
   the CrisisResource table, and create a FlaggedItem with reason CRISIS_LANGUAGE.
   Otherwise run retrieval, call OpenAI with the system prompt, save both the user and
   assistant Message to a Conversation (create one if none open for this session in
   the last 30 minutes), and if retrieval found nothing above threshold, mark the
   message confidence low and create a FlaggedItem with reason LOW_CONFIDENCE. Return
   { reply, topic, sources, quickReplies }.

Write a quick test script that sends a normal question and a crisis-language test
phrase and prints both responses so I can manually verify the safety path works.
Commit as "feat: anonymous session + AI chat with crisis detection and KB retrieval".
```

## Phase 3 — Public Pages (Home, Chat, My Space)

```
I have an existing static HTML/CSS prototype (files: index.html, chat.html,
my-space.html, assets/style.css) — [paste the prototype files or describe their
location]. Port these into real Next.js pages at app/(public)/page.tsx,
app/(public)/chat/page.tsx, and app/(public)/my-space/page.tsx, reusing the existing
markup structure and porting assets/style.css into styles/globals.css almost as-is —
do not redesign anything, just wire it to real data:

- Home: keep the static content, wire "Start chatting" and topic cards to navigate to
  /chat.
- Chat: wire the message list and input to POST /api/chat from Phase 2, render the
  conversation from real state, show the "sources" panel from the real response,
  render the crisis-bar always visible.
- My Space: add GET /api/history (returns this session's past Conversations/Messages)
  and GET /api/suggestions (returns 2-3 static, curated tips matched to the session's
  most-asked topics — do NOT have the LLM generate these, keep them pre-written and
  reviewed same as KB articles) and wire the page to them. Add a "Clear my history"
  button wired to a DELETE endpoint that removes all Conversation/Message rows for
  this sessionId and reissues a fresh session cookie.

Commit as "feat: public site wired to real chat, history, and suggestions".
```

## Phase 4 — Admin Panel v1 (Login, Dashboard, Knowledge Base, Flagged Content, Settings)

```
Implement:
1. lib/auth.ts: bcrypt password hashing, JWT session issuance (8hr expiry) in an
   HttpOnly cookie, and a requireAdmin(minRole?) helper usable in both API routes and
   server components, redirecting to /admin/login if missing/invalid.
2. POST /api/auth/login, POST /api/auth/logout.
3. /admin/login page (port from the existing prototype's admin-login.html).
4. /admin/dashboard: real counts from the database — total conversations, sessions,
   most-asked topic (group Messages by topicId), flagged-item count, language split,
   and a simple topic-engagement chart. No mocked numbers.
5. /admin/knowledge-base: list Articles grouped by Topic with status; a detail editor
   with EN/RW tabs for title+body, tags, reviewedBy, and a status toggle that blocks
   publishing to REVIEWED unless both bodyEn and bodyRw are non-empty. Full CRUD API
   at /api/kb protected by requireAdmin('CONTENT_REVIEWER').
6. /admin/flagged: list FlaggedItems with filters by reason/status; detail view
   showing the full anonymized Conversation transcript, a reviewerNotes textarea, and
   a resolve action. API at /api/flagged protected by requireAdmin('MODERATOR').
7. /admin/settings: edit AppSettings fields and CrisisResource CRUD, protected by
   requireAdmin('SUPER_ADMIN') only.

Enforce role checks server-side in every route handler, not just hidden in the UI.
Commit as "feat: admin panel v1 - auth, dashboard, knowledge base, flagged content,
settings".
```

> **Checkpoint:** Phases 0-4 are a complete, deployable MVP. Deploy it (Vercel + Neon/
> Supabase Postgres), smoke-test it, and treat this as "Milestone 1" delivered before
> continuing into the larger contracted scope below. Confirm with the client which of
> the remaining phases are actually being paid for and on what timeline before
> proceeding — the phases below are a materially larger scope than Phases 0-4.

---

## Phase 5 — Multilingual Expansion (EN/RW → EN/RW/FR/SW)

```
Extend the multilingual model from 2 languages to 4 (English, Kinyarwanda, French,
Kiswahili) across the whole app:
- Add bodyFr/bodyRw/bodySw + titleFr/titleSw fields to Article (migrate existing
  bodyEn/bodyRw data forward, do not lose it).
- Add a Language enum value for FR and SW everywhere Language is used (Conversation,
  UI language toggle).
- Update buildSystemPrompt to accept and respond in any of the 4 languages.
- Update the Knowledge Base editor to have 4 language tabs, and block publishing
  unless ALL FOUR language fields are filled in (not just 2 as before).
- Add a proper i18n solution for UI strings (next-intl or similar) instead of hardcoded
  English strings, with locale files for en/rw/fr/sw. Wire the existing language
  toggle component to actually switch UI locale, not just a visual pill.
Commit as "feat: expand multilingual support to English, Kinyarwanda, French,
Kiswahili".
```

## Phase 6 — User Accounts & RBAC for All 9 User Types

```
Add a full user account system alongside (not replacing) the existing anonymous
session model — anonymous chat must keep working for users who don't want an account.

Add a User model (separate from AdminUser) with:
- id, email/phone, passwordHash, name, role enum [TEENAGER, PARENT_GUARDIAN,
  HEALTHCARE_PROFESSIONAL, GOVERNMENT_USER], preferredLanguage, createdAt
- A HealthcareProfessional profile extension: professionalType enum [CHW, NURSE,
  MIDWIFE, PSYCHOLOGIST, DOCTOR], specialization, availability, approvalStatus
- A GovernmentUser profile extension: level enum [NATIONAL, PROVINCIAL, DISTRICT,
  SECTOR, CELL], regionName

Implement registration, login, password reset, and optional MFA for these account
types (separate from the admin auth in Phase 4). Add rate-limiting and account
lockout after repeated failed logins. Add session timeout after a configurable
inactivity period.

Commit as "feat: user accounts and RBAC for teenager, parent/guardian, healthcare
professional, and government roles".
```

## Phase 7 — Human Consultation & Referral/Escalation Engine

```
Add:
- A Consultation model linking a Conversation to an assigned HealthcareProfessional,
  with status [PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, ESCALATED].
- After every AI response in /api/chat, return a flag offering the user the option to
  request human follow-up.
- POST /api/consultations/request: given a Conversation, run a routing function that
  picks the right professional type (CHW → Nurse/Midwife → Psychologist → Doctor)
  based on topic + risk level (reuse/extend the crisis/low-confidence signals from
  Phase 2), and assign to an available professional of that type (simple
  round-robin/least-busy assignment is fine for v1).
- Allow authorized staff to manually reassign/escalate a Consultation to a higher tier.
- Add secure one-to-one messaging between the User and assigned professional scoped to
  a Consultation (reuse the Message model, add a consultationId field), with
  end-to-end encryption for message content at rest (encrypt before writing to DB,
  decrypt only for authorized parties).
Commit as "feat: human consultation referral and escalation engine with secure
messaging".
```

## Phase 8 — Appointment Management

```
Add an Appointment model (userId, professionalId, requestedTime, status [REQUESTED,
CONFIRMED, RESCHEDULED, CANCELLED, COMPLETED], notes, outcome). Build:
- User-facing: request/view/reschedule/cancel appointments, see reminders.
- Professional-facing: view calendar, accept/reject requests, record outcomes.
Add appointment reminder notifications (hook into Phase 9's notification service once
built, stub it with a TODO + log statement if built before Phase 9).
Commit as "feat: appointment management".
```

## Phase 9 — Notifications Module

```
Add a Notification model and a notification service supporting delivery via:
- In-app (a notifications list in each portal)
- Email (use a provider like Resend or SMTP - make it swappable via env config)
- SMS (stub an interface now; wire to a real Rwandan SMS gateway only once the client
  confirms which provider they've contracted)
Trigger notifications for: registration confirmation, appointment reminders,
consultation updates, referral notifications, password reset. Add user-configurable
notification preferences (which channels, which event types).
Commit as "feat: notifications module (in-app, email, SMS-ready)".
```

## Phase 10 — Health Facility Locator

```
Add a HealthFacility model (name, type [HOSPITAL, HEALTH_CENTRE, CLINIC, PHARMACY],
latitude, longitude, district, sector, services[], contact). Build a searchable,
filterable facility locator page with an interactive map (use Mapbox or Leaflet with
OpenStreetMap tiles to avoid Google Maps billing) showing directions to a selected
facility. Add an admin CRUD screen for managing facilities.
Commit as "feat: health facility locator with interactive map".
```

## Phase 11 — Remaining Portals (Super Admin, Government, Healthcare Professional, Parent/Guardian, Teenager/User)

```
Build the remaining role-specific portal shells (many of the underlying features
already exist from earlier phases — this phase is about the dashboards/UI that
surface them correctly per role):

- Super Admin: everything from Phase 4's admin panel, plus Admin User management
  (create/edit/deactivate AdminUser and User accounts across all roles) and full
  system configuration.
- Government Portal: read-only dashboards at National/Provincial/District/Sector/Cell
  level showing ONLY aggregated, anonymized statistics (topic volumes, consultation
  counts, referral counts, AI usage) — write a hard server-side rule that Government
  Portal queries never return anything joined to an individual User or Conversation
  record.
- Healthcare Professional Portal: assigned consultations queue, patient messaging
  (from Phase 7), appointment calendar (from Phase 8), consultation history, personal
  reports.
- Parent/Guardian Portal: educational resources, child health reminders, appointment
  requests, notifications.
- Teenager/User Portal: AI consultation entry point, secure messaging, appointment
  booking, health education, profile, and an explicit "anonymous mode" toggle that,
  when on, behaves like the Phase 2-3 anonymous flow instead of attaching to their
  account.

Enforce every access boundary server-side with the RBAC from Phase 6. Commit as
"feat: remaining role-specific portals (super admin, government, healthcare
professional, parent/guardian, teenager)".
```

## Phase 12 — Reporting, Analytics, Audit Logging

```
Add an AuditLog model recording logins, admin actions, config changes, content
updates, security events, and failed login attempts — write-only from the app's
perspective (no update/delete API), viewable only by Super Admin.
Add report generation (user registrations, consultations, referrals, appointments, AI
usage, professional performance, government statistics, education usage, security)
with export to PDF, Excel, and CSV.
Commit as "feat: audit logging and reporting/export".
```

## Phase 13 — Security Hardening & Testing

```
Do a security pass across the whole app:
- Confirm HTTPS/TLS is enforced, add security headers (helmet-equivalent for
  Next.js).
- Confirm sensitive fields (message content in Phase 7, PII) are encrypted at rest.
- Add rate-limiting to all public API routes, not just login.
- Write integration tests for: crisis-detection path, RBAC boundaries (a Moderator
  cannot reach Settings, a Government user cannot reach individual records), and the
  KB-publish-blocks-until-all-languages-filled rule.
- Document a basic backup/restore procedure and disaster recovery runbook.
Commit as "feat: security hardening and test suite".
```

## Phase 14 — Documentation & Handover Package

```
Generate the following as markdown files in a /docs folder: System Architecture
Document (summarize what was actually built across Phases 0-13), API Documentation
(auto-generate from route handlers/OpenAPI if feasible), Database Documentation (from
the final Prisma schema), Administrator Manual, Healthcare Professional Manual, User
Manual, Deployment Guide, Maintenance Guide. Commit as "docs: full handover
documentation package".
```

## Phase 15 — Production Deployment

```
Prepare production deployment:
- Finalize environment variables for production (real OpenAI key, production DB URL,
  strong secrets).
- Set up the production Postgres database (Neon/Supabase), run migrations, run seed
  for reference data only (not test data).
- Deploy to Vercel (or the agreed host), attach the real domain, configure SSL.
- Run a full smoke test across every portal and the anonymous chat flow.
- Confirm backups are scheduled and a restore has been test-run at least once.
Commit as "chore: production deployment configuration".
```

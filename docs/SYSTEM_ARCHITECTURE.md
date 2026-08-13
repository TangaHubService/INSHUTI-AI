# System architecture

INSHUTI is a modular web platform composed of a Next.js TypeScript frontend (PWA-capable, four UI locales), an Express TypeScript API, PostgreSQL through Prisma, an OpenAI-backed health-information service, Socket.IO consultation/call messaging, Cloudinary-backed media storage, and configurable email/SMS/web-push integrations.

## Main flows

1. A visitor receives an opaque anonymous session cookie and can use AI chat without an account.
2. The API detects language and crisis indicators, retrieves reviewed health content, obtains the configured AI response, and stores the conversation.
3. An identified user may request professional follow-up. Risk overrides topic routing; otherwise the topic selects CHW, nurse, midwife, psychologist, or doctor.
4. Only the user and assigned professional can access the consultation. Messages (text, voice notes, images, files) are protected in transit by TLS and at rest with authenticated AES-256-GCM; attachments are stored on Cloudinary under access-controlled, per-consultation resource IDs. Admin/moderator oversight of consultations is metadata-only (status, priority, participant names) — the message-content endpoints stay restricted to the user and assigned professional, so oversight cannot see decrypted content.
5. Users can also start a real-time one-to-one or group audio/video call scoped to a consultation, negotiated over a dedicated Socket.IO namespace per room.
6. Role-specific portals expose appointments, consultations, a curated Health Education Library (Cloudinary-backed articles/attachments merged with the public Resources area), facility search, aggregate government statistics, and administrative functions (knowledge base, unified admin search, flagged-content review, monitoring, audit logs, reporting).
7. The frontend installs as a PWA: a service worker serves an offline fallback page and relays web-push notifications delivered via VAPID.

## Trust boundaries

The browser, API, database, AI provider, notification providers (email/SMS/web-push), mapping tile provider, Cloudinary media storage, and deployment platform are separate trust boundaries. Server-side message encryption is encryption at rest, not end-to-end encryption: authorized API processes can decrypt consultation content. Production documentation and user-facing claims must use that accurate description unless client-side key exchange is separately implemented and audited.

## Scalability

Frontend and API instances are stateless except for cookies; PostgreSQL is the system of record. Horizontal API scaling requires a shared Socket.IO adapter (used by both consultation messaging and calls). Uploaded/attached files live in Cloudinary rather than local disk, so they scale independently of the API instance. Scheduled workers should handle reminders, retention, and backups outside request processes.

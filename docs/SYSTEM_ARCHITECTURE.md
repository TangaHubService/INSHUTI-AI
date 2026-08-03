# System architecture

INSHUTI is a modular web platform composed of a Next.js 14 TypeScript frontend, an Express TypeScript API, PostgreSQL through Prisma, an OpenAI-backed health-information service, Socket.IO consultation messaging, and configurable email/SMS integrations.

## Main flows

1. A visitor receives an opaque anonymous session cookie and can use AI chat without an account.
2. The API detects language and crisis indicators, retrieves reviewed health content, obtains the configured AI response, and stores the conversation.
3. An identified user may request professional follow-up. Risk overrides topic routing; otherwise the topic selects CHW, nurse, midwife, psychologist, or doctor.
4. Only the user and assigned professional can access the consultation. Messages are protected in transit by TLS and at rest with authenticated AES-256-GCM.
5. Role-specific portals expose appointments, consultations, aggregate government statistics, and administrative functions.

## Trust boundaries

The browser, API, database, AI provider, notification providers, mapping tile provider, and deployment platform are separate trust boundaries. Server-side message encryption is encryption at rest, not end-to-end encryption: authorized API processes can decrypt consultation content. Production documentation and user-facing claims must use that accurate description unless client-side key exchange is separately implemented and audited.

## Scalability

Frontend and API instances are stateless except for cookies; PostgreSQL is the system of record. Horizontal API scaling requires a shared Socket.IO adapter. Uploaded files require shared object storage in production. Scheduled workers should handle reminders, retention, and backups outside request processes.

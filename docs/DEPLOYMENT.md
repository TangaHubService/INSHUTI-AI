# Production deployment guide

1. Provision managed PostgreSQL, object storage for uploads, application hosting, DNS, TLS, monitoring, email, and optional SMS services in the approved jurisdiction.
2. Configure environment values from `backend/.env.example`; use newly generated secrets of at least 32 random bytes.
3. Set `NODE_ENV=production`, the exact public frontend URL, allowed origins, production database URL, AI credentials, notification credentials, upload storage, and consultation encryption key.
4. Run `npm ci` in the root, frontend, and backend as applicable.
5. Run `npm run build`, `npm run typecheck`, and `npm test --prefix backend`.
6. Run `prisma migrate deploy` before starting the new API revision.
7. Deploy backend and frontend, configure the API URL, and verify DNS and certificates.
8. Execute every item in `UAT.md`, the security review, and a backup/restore test.
9. Record deployment version, operator, time, migration version, test evidence, rollback version, and approver.

Never deploy seed/test identities or local SQLite data to production. Roll back application code only when the database migration is backward compatible; otherwise follow a tested migration rollback plan.

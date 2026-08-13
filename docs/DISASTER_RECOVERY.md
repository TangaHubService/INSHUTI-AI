# Backup and disaster recovery

## Policy

- Managed PostgreSQL point-in-time recovery plus daily encrypted logical backups
- Consultation and Health Education Library attachments live on Cloudinary, not local/API disk; rely on the Cloudinary account's own redundancy and additionally schedule a periodic export of referenced assets so recovery does not depend solely on a third party's retention policy
- Copies stored in a separate account or failure domain
- Daily automated verification and quarterly full restore exercises
- Suggested initial targets: RPO 24 hours, RTO 8 hours, subject to owner approval

## Backup

Use `scripts/backup-postgres.sh` from a protected scheduler with `DATABASE_URL`, `BACKUP_DIR`, and a secret-managed `BACKUP_ENCRYPTION_KEY`. The script produces only an encrypted dump plus checksum. Transfer it to immutable storage and keep its encryption key in a separate recovery-controlled secret store.

## Restore test

Restore only into an isolated non-production database using `scripts/restore-postgres.sh`. Run Prisma validation, application smoke tests, record row counts, verify consultation access controls, and destroy the isolated copy securely after evidence is approved.

## Incident recovery

Declare the incident, stop unsafe writes if necessary, preserve audit evidence, notify the data controller, select the latest verified recovery point, restore infrastructure and data, rotate affected credentials, validate integrity, reopen gradually, and complete a documented post-incident review.

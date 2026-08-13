# Database and data protection

The canonical production schema is `backend/prisma/schema.prisma`. PostgreSQL migrations are under `backend/prisma/migrations`. SQLite is for local development only.

Personal data includes account identity, contact details, consultations, appointments, notifications, push subscriptions, attachments (consultation and Health Education Library), contact inquiries, and audit metadata. Apply purpose limitation, least privilege, retention limits, and documented deletion procedures.

Consultation messages and file attachments are encrypted with AES-256-GCM; attachment binaries are held on Cloudinary under access-controlled resource IDs rather than local disk. Passwords are hashed. TLS must protect all network traffic. Database disks and backups must also use provider-managed encryption. Encryption keys must live in a managed secret store and never in source control or backups stored beside the database.

`AuditLog` rows form a hash chain (each row's hash covers the previous row's hash) so tampering with historical entries is detectable; the API never exposes update/delete operations on this table.

Government endpoints return aggregates and must never expose user, message, or appointment records. Small aggregate groups should be suppressed in production policy to reduce re-identification risk.

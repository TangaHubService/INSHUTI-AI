# Database and data protection

The canonical production schema is `backend/prisma/schema.prisma`. PostgreSQL migrations are under `backend/prisma/migrations`. SQLite is for local development only.

Personal data includes account identity, contact details, consultations, appointments, notifications, attachments, and audit metadata. Apply purpose limitation, least privilege, retention limits, and documented deletion procedures.

Consultation messages are encrypted with AES-256-GCM. Passwords are hashed. TLS must protect all network traffic. Database disks and backups must also use provider-managed encryption. Encryption keys must live in a managed secret store and never in source control or backups stored beside the database.

Government endpoints return aggregates and must never expose user, message, or appointment records. Small aggregate groups should be suppressed in production policy to reduce re-identification risk.

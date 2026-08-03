# API guide

Both `/api/*` and versioned `/api/v1/*` routes are currently supported. New clients should use `/api/v1`.

Major route groups:

- `health`, `monitoring`: health and operational status
- `chat`, `history`, `suggestions`: anonymous or account-aware AI consultation
- `users`, `auth`: user and administrator authentication
- `consultations`, `uploads`: referral, secure messaging, read receipts, and authorized attachments
- `appointments`: professional discovery, booking, rescheduling, cancellation, acceptance, and outcomes
- `notifications`: preferences and in-system notifications
- `facilities`: public facility search and administrator management
- `library`, `kb`: public reviewed content and administrative content management
- `government`: aggregate-only government statistics
- `reports`: CSV, XLSX, and PDF administrative exports
- `audit-logs`, `settings`, `admin/users`, `flagged`: restricted administration

Cookies are HTTP-only authentication credentials. Browser clients must send credentials. Mutating calls use JSON unless uploading multipart files. Validation failures return 400, authentication failures 401, authorization failures 403, missing resources 404, and state conflicts 409.

Before external integration, publish an OpenAPI document with production hostnames and rotate all example secrets.

# API guide

Both `/api/*` and versioned `/api/v1/*` routes are currently supported. New clients should use `/api/v1`.

Major route groups:

- `health`, `monitoring`: health and operational status
- `chat`, `history`, `suggestions`: anonymous or account-aware AI consultation
- `users`, `auth`: user and administrator authentication
- `consultations`, `uploads`: referral, secure messaging, read receipts, Cloudinary-backed attachments, and metadata-only admin/moderator oversight (`GET /consultations/admin`)
- `/call/:roomId` (Socket.IO namespace, not an HTTP route): real-time 1:1 and group audio/video signaling scoped to a consultation
- `appointments`: professional discovery, booking, rescheduling, cancellation, acceptance, and outcomes
- `notifications`: preferences, in-system notifications, and web-push subscription registration (VAPID)
- `facilities`: public facility search and administrator management
- `library`, `kb`: public reviewed knowledge-base content and administrative content management
- `health-education`, `resources`: administrative and public endpoints for the Cloudinary-backed Health Education Library (articles + file/image/video attachments)
- `contact`: public contact/inquiry submissions
- `search`: unified, role-restricted admin search across users, consultations, articles, and facilities
- `government`: aggregate-only government statistics
- `reports`: CSV, XLSX, and PDF administrative exports
- `audit-logs`, `settings`, `admin/users`, `flagged`: restricted administration

Cookies are HTTP-only authentication credentials. Browser clients must send credentials. Mutating calls use JSON unless uploading multipart files. Validation failures return 400, authentication failures 401, authorization failures 403, missing resources 404, and state conflicts 409.

Before external integration, publish an OpenAPI document with production hostnames and rotate all example secrets.

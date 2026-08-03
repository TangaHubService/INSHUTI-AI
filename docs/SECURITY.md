# Security manual

Required production controls include TLS/HSTS at the edge, restrictive security headers, rate limiting, HTTP-only secure cookies, least-privilege RBAC, authenticated message encryption, managed secrets, protected backups, audit logging, dependency scanning, monitoring, and an incident-response process.

The platform must not advertise genuine end-to-end encryption: the API can decrypt consultation messages for authorized delivery. The accurate statement is “encrypted in transit and encrypted at rest.” Changing that statement requires a separately designed client-side key protocol and independent cryptographic review.

Before acceptance:

- Run SAST, dependency, secret, and infrastructure scans.
- Commission an independent penetration test covering account takeover, IDOR, file upload, stored XSS, injection, Socket.IO authorization, privacy boundaries, and government aggregation.
- Resolve all critical/high findings and attach the original and remediation reports.
- Test incident notification and key rotation.
- Review Rwanda data-protection obligations with qualified counsel and document the lawful basis, retention, youth consent/assent, guardian boundaries, and emergency disclosures.

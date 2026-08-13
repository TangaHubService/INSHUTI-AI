# Automated test report — 13 August 2026

Environment: local development workstation; production-like build configuration where applicable.

| Check | Result |
|---|---|
| Backend automated test suite | 146/146 passed across 25 files |
| Backend TypeScript typecheck | Passed |
| Backend lint | Passed with zero warnings/errors |
| Frontend lint | Passed with zero errors; 4 pre-existing `no-img-element` warnings on Health Education Library preview components (deliberate — previews render arbitrary Cloudinary URLs not known at build time, so `next/image` domain allow-listing does not apply) |
| Backend + Next.js production build | Passed |
| Backend production dependency audit | Zero known vulnerabilities |
| Frontend/root dependency audit | Zero known vulnerabilities (a high-severity transitive `nanoid` advisory was resolved via `npm audit fix` on 13 August 2026) |
| Referral unit coverage | Topic, tier, and crisis override covered |
| Message/file encryption | Round-trip and tamper/file-at-rest tests covered |
| RBAC | Moderator denial, super-admin acceptance, malformed token covered |
| Consultation oversight boundary | Admin/moderator oversight list returns metadata only; message-content routes remain restricted to the consultation's user and assigned professional |

This report is developer verification, not customer UAT, a clinical validation, a load-test certificate, or an independent penetration test. Those signed external records remain required by `UAT.md` and `SECURITY.md`.

# Automated test report — 3 August 2026

Environment: local development workstation; production-like build configuration where applicable.

| Check | Result |
|---|---|
| Backend automated test suite | 116/116 passed across 22 files |
| Backend TypeScript typecheck | Passed |
| Backend and frontend lint | Passed with zero warnings/errors |
| Backend + Next.js production build | Passed |
| Backend production dependency audit | Zero known vulnerabilities |
| Frontend/root dependency audit | Zero reported vulnerabilities |
| Referral unit coverage | Topic, tier, and crisis override covered |
| Message/file encryption | Round-trip and tamper/file-at-rest tests covered |
| RBAC | Moderator denial, super-admin acceptance, malformed token covered |

This report is developer verification, not customer UAT, a clinical validation, a load-test certificate, or an independent penetration test. Those signed external records remain required by `UAT.md` and `SECURITY.md`.

# Contract compliance matrix

Status values: **Implemented** means code and automated verification exist; **Configuration** requires owner credentials/infrastructure; **External acceptance** requires an authorized human or third party.

| Requirement | Status | Evidence / acceptance action |
|---|---|---|
| AI-first multilingual health information and safety disclaimer | Implemented + external acceptance | Chat, retrieval, language detection; licensed clinical and AI-safety review required |
| CHW/nurse/midwife/psychologist/doctor routing | Implemented | Specialization/risk/location-aware router and unit tests |
| Private human consultation, files/images/audio, voice-to-text, history/read receipts | Implemented | Consultation API, Socket.IO, protected uploads and UI |
| Encryption and RBAC | Implemented + external acceptance | TLS configuration, AES-256-GCM, authorization tests; penetration test required |
| Four-language interfaces/content workflow | Implemented + external acceptance | Main public and role journeys, message resources, and four-language publication gate are implemented; an authorized translator must complete terminology/administration-screen QA |
| Appointments and reminders | Implemented | Booking lifecycle, conflicts, availability display, scheduled reminder worker |
| Health library categories and content administration | Implemented + external acceptance | All required categories; licensed content approval required |
| Facility search, map, contact, services and directions | Implemented | Public locator and admin management |
| Email/SMS/in-app/browser push | Configuration | SMTP, Twilio and VAPID credentials must be supplied and tested |
| Government national/province/district/sector/cell aggregates | Implemented | Location-aware aggregate queries and configurable small-count suppression; production data completeness review required |
| Role portals and administration | Implemented | Youth/parent/professional/government/admin/super-admin routes and RBAC |
| Search and CSV/XLSX/PDF reports | Implemented | Restricted unified admin search and exports |
| PWA and offline shell | Implemented | Manifest, service worker, offline fallback and push handler |
| Backup/disaster recovery | Implemented + configuration | Scripts/runbook supplied; owner must schedule and sign restore exercise |
| Documentation/training/UAT | Prepared + external acceptance | Handover package supplied; sessions and signed UAT remain external |
| Production hosting/domain/SSL/monitoring | Configuration | Docker deployment package; owner hosting, DNS and credentials required |
| Independent security and clinical approval | External acceptance | Cannot be self-certified by the developer |

# PM Copilot — Remaining Tasks

Last updated: 2026-06-10. All items are unstarted unless noted.

---

## Security Review Findings (2026-06-10)

Round 1 (stale JWT role/status, `requireAdmin` consolidation, `withProjectRoute` wrapper) is done — see DONE.md Step 35.
Round 2 (S1 env injection, S2 rate limiting, S3 version race + bulk versioning) is done — see DONE.md Step 36. Remaining:

### ~~S1. `.env.local` injection via admin database endpoint~~ ✅ DONE
`validateDatabaseUrl()` in `lib/env-config.js` (strict per-type validation, rejects quotes/whitespace/control chars); `writeEnvLocal` additionally refuses unsafe keys/values as defense in depth.

### ~~S2. Rate limiting~~ ✅ DONE
In-memory fixed-window limiter (`lib/rate-limit.js`). Login: 5 failed attempts / 15 min per email (success resets). Register: 10 / 15 min per IP. Password change: 5 failed / 15 min per user. AI suggest: 30 / h per user. Import: 10 / h per user. Responses use `RATE_LIMITED` + HTTP 429.

### ~~S3. Version-number race~~ ✅ DONE
`lib/artifact-versioning.js` → `updateArtifactWithVersion(tx, …)` used inside `prisma.$transaction` by artifact PATCH, version restore, and bulk status PATCH. Bulk status changes now create versions (no-op status changes are skipped).

### S4. AI API key stored in plaintext in DB
`aiConfig.apiKey` is unencrypted in the SQLite file. Encrypt at rest (AES-GCM, key from env) or keep keys env-only.

### S5. Registration is open but admin-only user creation is the intended model
`/api/auth/register` is publicly reachable. Either remove it or gate it behind a `REGISTRATION_ENABLED` env flag (default off).

### S6. Smaller items
- Normalize emails to lowercase on register + login (case-duplicate accounts possible)
- Add `Content-Security-Policy` header in `src/middleware.js` (at least `frame-ancestors 'none'; object-src 'none'; base-uri 'self'`)
- `/api/health` should do a `SELECT 1` so the Docker healthcheck actually verifies the DB
- Import route trusts client MIME (`file.type`) — consider magic-byte sniffing
- Runtime Prisma client hard-codes the better-sqlite3 adapter while the admin DB page writes Postgres URLs — branch the adapter on URL scheme or make the page view/test-only

---

## High Priority

### ~~1. Test Suite~~ ✅ DONE
150 Vitest tests (lib + RTL + API) + 17 Playwright E2E tests — all passing.
See item 3 (E2E) — now folded into the completed test suite work.

### ~~2. Responsive Design + Accessibility Pass~~ ✅ DONE
Explorer mobile panel-switching, responsive nav/board, full ARIA pass (aria-expanded, aria-current, aria-label, aria-pressed, role=region). Group badge colors pass WCAG AA.

### ~~3. E2E Tests for Core Flows~~ ✅ DONE (folded into item 1)

---

## Lower Priority / Nice-to-Have

### ~~4. Document Import — Expand Extractable Types~~ ✅ DONE
All 30 canonical extractable types (of 35 total) are now importable. The 5 types without field schemas are surfaced as warnings in the stats panel.

### ~~5. Artifact Bulk Actions in Explorer~~ ✅ DONE
"Auswählen" mode in explorer tree (EDITOR+), checkbox per artifact, bulk status change, bulk tag assignment, bulk soft-delete with confirmation. `BulkSelectContext` + `BulkActionBar`. API: `PATCH/DELETE /artifacts/bulk`, `POST /artifacts/bulk/tags`.

### ~~6. Rich Text for Long-Form Fields~~ ✅ DONE

### ~~7. In-App Notifications~~ ✅ DONE
Bell icon in header with red unread badge; dropdown panel (last 30 notifications, 30 s polling). Clicking a notification navigates to the artifact and marks it read. "Alle als gelesen" marks all. Triggered on comment POST for all project members except the author. `Notification` table + migration.

### ~~8. Audit Log UI~~ ✅ DONE
Destructive actions (artifact delete, version restore, project archive/unarchive) are now logged to the `AuditLog` table. Admin-visible page at `/admin/audit` with action filter and pagination.

### ~~9. Project Templates~~ ✅ DONE
"Als Vorlage speichern" on project settings (Owner only) with artifact picker + optional starter answers. Template picker on new-project page. `POST /api/projects` accepts `templateId` and pre-creates artifacts + prdStarter. `GET/POST /api/templates`, `GET/DELETE /api/templates/:id`.

### ~~10. PostgreSQL Migration Validation~~ ✅ DONE
`docker-compose.postgres.yml` + `.env.postgres.example` + `scripts/smoke-postgres.mjs` (10-step CRUD smoke test) + `.github/workflows/postgres-smoke.yml` (CI on schema/migration changes). `npm run test:postgres` for local validation.

### ~~11. PDF Export / Report Generation~~ ✅ DONE
`GET /api/projects/:id/export?format=pdf` — styled A4 report with cover, summary grid, and artifacts grouped by domain. `pdfkit`-based, server-side.

---

## Out of Scope (per spec, do not implement)

- Live collaborative editing (cursors, presence, conflict resolution)
- Email notifications or invitation emails
- Self-service user registration (admin-only user creation is the intended model)
- P2 features from the original product spec

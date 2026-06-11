# PM Copilot — Remaining Tasks

Last updated: 2026-06-10. All items are unstarted unless noted.

---

## Security Review Findings (2026-06-10)

**All security-review findings are resolved.**
Round 1 (stale JWT role/status, `requireAdmin` consolidation, `withProjectRoute` wrapper) — DONE.md Step 35.
Round 2 (S1 env injection, S2 rate limiting, S3 version race + bulk versioning) — DONE.md Step 36.
Round 3 (S4 key encryption, S5 registration flag, S6 hardening batch) — DONE.md Step 37.

### ~~S1. `.env.local` injection via admin database endpoint~~ ✅ DONE
`validateDatabaseUrl()` in `lib/env-config.js` (strict per-type validation, rejects quotes/whitespace/control chars); `writeEnvLocal` additionally refuses unsafe keys/values as defense in depth.

### ~~S2. Rate limiting~~ ✅ DONE
In-memory fixed-window limiter (`lib/rate-limit.js`). Login: 5 failed attempts / 15 min per email (success resets). Register: 10 / 15 min per IP. Password change: 5 failed / 15 min per user. AI suggest: 30 / h per user. Import: 10 / h per user. Responses use `RATE_LIMITED` + HTTP 429.

### ~~S3. Version-number race~~ ✅ DONE
`lib/artifact-versioning.js` → `updateArtifactWithVersion(tx, …)` used inside `prisma.$transaction` by artifact PATCH, version restore, and bulk status PATCH. Bulk status changes now create versions (no-op status changes are skipped).

### ~~S4. AI API key stored in plaintext in DB~~ ✅ DONE
AES-256-GCM via `lib/crypto.js` (key derived from `CONFIG_SECRET`, falls back to `NEXTAUTH_SECRET`). Legacy plaintext rows keep working and are encrypted on the next save.

### ~~S5. Registration gated behind env flag~~ ✅ DONE
`REGISTRATION_ENABLED="true"` enables self-registration; **default is off** (API returns 403, register page shows a notice, login page hides the link).

### ~~S6. Smaller items~~ ✅ DONE
- Emails normalized (trim + lowercase) in register/login/admin-create/invite
- Security headers incl. CSP moved to `next.config.mjs` `headers()` — now cover public pages too
- `/api/health` runs `SELECT 1` and returns 503 when the DB is unreachable
- Import verifies magic bytes (PDF `%PDF`, DOCX `PK\x03\x04`, text = no NUL bytes)
- Prisma client picks the adapter from the URL scheme (better-sqlite3 / `@prisma/adapter-pg`); MariaDB URLs fail with a clear error

---

## AI Process Improvements (review 2026-06-11, see docs/AI.md §7)

Documented and evaluated in [docs/AI.md](./docs/AI.md). Prioritized backlog:

### ~~A1. User-controlled extraction volume & scope~~ ✅ DONE
Import UI: „Max. Vorschläge" selector (10/25/50/unbegrenzt, Standard 25) + Artefaktgruppen-Filter (Chips, Standard: alle). API: `maxArtifacts` + `includeTypes[]` (multipart) → Prompt-Regel 17 + Typ-Whitelist im Parser + confidence-sortierter Hard-Cap (`applyProposalLimit`) nach dem Merge.

### ~~A2. Single source for default model names~~ ✅ DONE
`AI_DEFAULT_MODELS` in `constants.js`; adapters + provider-factory use it (fixed `gpt-4o` drift).

### ~~A3. Log document-import calls in AiSession~~ ✅ DONE
`artifactId` optional + `projectId`/`inputTokens`/`outputTokens` columns (migration `ai_session_import_logging`); every import run logs one project-level row incl. failures.

### ~~A4. Token/cost tracking~~ ✅ DONE
Adapters return normalized token usage; suggest + import sessions persist it; `/admin/ai` shows a 30-day usage card (requests, tokens, Ø duration, per-feature table).

### A5. Structured output instead of prompt discipline
Anthropic forced tool-use / OpenAI `response_format: json_schema` using the existing `buildTypeSchemas()` — removes the `{raw}` fallback and JSON-repair heuristics.

### A6. Parallel chunk processing + progress feedback
Bounded concurrency (~3) for import chunks; progress bar instead of a bare spinner.

### A7. Polish
- Suggestion prompts: target-language parameter instead of hard-coded German
- Cross-chunk relation pass (one extra call over merged titles)
- Cap suggestion context (size + relation count)
- Smarter cross-chunk dedupe than exact title match

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

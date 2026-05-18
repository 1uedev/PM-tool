# PM Copilot — Remaining Tasks

Last updated: 2026-05-18 (updated). All items are unstarted unless noted.

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

### 5. Artifact Bulk Actions in Explorer
- Multi-select artifacts in the tree
- Bulk status change
- Bulk delete (with confirmation)
- Bulk tag assignment

### ~~6. Rich Text for Long-Form Fields~~ ✅ DONE

### 7. In-App Notifications
Currently there is no way for a user to know that another user commented on their artifact. A simple in-app notification panel (unread count in header, list of events) would be the minimum viable awareness layer — without requiring email or real-time infrastructure.

### 8. Audit Log UI
`AiSession` is logged. Destructive actions (delete, restore, archive) are not. An admin-visible audit log page would aid compliance (aligns with the "audit logs" item listed in the landing page's security features).

### 9. Project Templates
Allow saving a project (its artifact structure, starter answers, and skeleton artifacts) as a template, and creating new projects from a template. Useful for teams that run a standard PM process repeatedly.

### 10. PostgreSQL / MariaDB Migration Validation
The Database Config UI exists, but the actual Prisma migration flow for switching from SQLite to Postgres in production has not been exercised end-to-end. A migration runbook and at minimum a CI smoke test against a Postgres container would reduce risk.

### ~~11. PDF Export / Report Generation~~ ✅ DONE
`GET /api/projects/:id/export?format=pdf` — styled A4 report with cover, summary grid, and artifacts grouped by domain. `pdfkit`-based, server-side.

---

## Out of Scope (per spec, do not implement)

- Live collaborative editing (cursors, presence, conflict resolution)
- Email notifications or invitation emails
- Self-service user registration (admin-only user creation is the intended model)
- P2 features from the original product spec

# PM Copilot — Remaining Tasks

Last updated: 2026-05-12. All items are unstarted unless noted.

---

## High Priority

### 1. Test Suite (Vitest + React Testing Library) — partially done ✅ lib layer
99 unit tests across 10 files covering middleware, all validators, errors, and document extractor.
Still open:
- `ArtifactForm` save/dirty logic (RTL component test)
- API route integration tests (in-memory SQLite or test DB)
- E2E flows (see item 3)

### 2. Responsive Design + Accessibility Pass
Sprint 4 Step 7 from the original spec was never explicitly committed.
- Explorer two-column layout collapses properly on mobile
- Board view and graph view usable on smaller screens
- ARIA labels on all interactive elements (artifact tree items, drag handles, relation dialog)
- Keyboard navigation through Explorer tree
- Color-contrast check for all group color classes (especially lighter tints)

### 3. E2E Tests for Core Flows
Sprint 4 Step 8 from the original spec.
Suggested: Playwright or Cypress covering:
- Register → log in → create project → fill starter → create artifact → save → view version
- Add relation → check traceability view shows it
- Admin: create user → log in as that user → verify project access

---

## Lower Priority / Nice-to-Have

### 4. Document Import — Expand Extractable Types
Currently 13 out of 35 artifact types are extractable from uploaded documents. Consider adding:
- Risk, Constraint, Assumption, Open Question (straightforward field schemas)
- Functional Requirement, Non-Functional Requirement
- Roadmap Item, Milestone

### 5. Artifact Bulk Actions in Explorer
- Multi-select artifacts in the tree
- Bulk status change
- Bulk delete (with confirmation)
- Bulk tag assignment

### 6. Rich Text for Long-Form Fields
Several fields (e.g. `flow`, `description`, `acceptanceCriteria`) are plain textareas. A lightweight rich-text editor (e.g. Tiptap) would improve usability for longer content without breaking the JSON storage approach.

### 7. In-App Notifications
Currently there is no way for a user to know that another user commented on their artifact. A simple in-app notification panel (unread count in header, list of events) would be the minimum viable awareness layer — without requiring email or real-time infrastructure.

### 8. Audit Log UI
`AiSession` is logged. Destructive actions (delete, restore, archive) are not. An admin-visible audit log page would aid compliance (aligns with the "audit logs" item listed in the landing page's security features).

### 9. Project Templates
Allow saving a project (its artifact structure, starter answers, and skeleton artifacts) as a template, and creating new projects from a template. Useful for teams that run a standard PM process repeatedly.

### 10. PostgreSQL / MariaDB Migration Validation
The Database Config UI exists, but the actual Prisma migration flow for switching from SQLite to Postgres in production has not been exercised end-to-end. A migration runbook and at minimum a CI smoke test against a Postgres container would reduce risk.

### 11. PDF Export / Report Generation
JSON and CSV artifact export are done. A formatted PDF report (project summary + all artifacts, styled) is still open.

---

## Out of Scope (per spec, do not implement)

- Live collaborative editing (cursors, presence, conflict resolution)
- Email notifications or invitation emails
- Self-service user registration (admin-only user creation is the intended model)
- P2 features from the original product spec

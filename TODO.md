# PM Copilot — Remaining Tasks

Last updated: 2026-05-11. All items are unstarted unless noted.

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

## Medium Priority

### 4. Landing Page Content (PM Copilot-specific) ✅ done
All public pages rewritten with PM Copilot content. Root `/` now shows the landing page for unauthenticated visitors. Navbar/Footer wired up (SITE/NAV_LINKS were missing). Features, Pricing, About, Contact all updated.

### 5. Password / Account Self-Service ✅ done
`/account` page with profile (display name) + password change forms.
`PATCH /api/users/me` (display name) + `POST /api/users/me/password` (bcrypt verify + update).
Account link in Sidebar footer, active-state highlighting.

### 6. Project Member Management UI ✅ done
`/projects/:id/settings` has a working member panel. Owner-only controls enforced in UI:
non-owners see a plain role label instead of a dropdown + remove button.
`InviteMember` uses shared `Input`/`Select`/`Button` components. Error/success banners standardised.

### 7. Export / Report Generation ✅ done (JSON + CSV)
`GET /api/projects/:id/export?format=json|csv` — full artifact export.
JSON: nested structure with all fields. CSV: fixed columns (id, type, title, status, createdAt, updatedAt) + fields as JSON string.
`ExportSection` component embedded in project settings. PDF report still open.

---

## Lower Priority / Nice-to-Have

### 8. Document Import — Expand Extractable Types
Currently 13 out of 35 artifact types are extractable from uploaded documents. Consider adding:
- Risk, Constraint, Assumption, Open Question (straightforward field schemas)
- Functional Requirement, Non-Functional Requirement
- Roadmap Item, Milestone

### 9. Artifact Bulk Actions in Explorer
- Multi-select artifacts in the tree
- Bulk status change
- Bulk delete (with confirmation)
- Bulk tag assignment

### 10. Rich Text for Long-Form Fields
Several fields (e.g. `flow`, `description`, `acceptanceCriteria`) are plain textareas. A lightweight rich-text editor (e.g. Tiptap) would improve usability for longer content without breaking the JSON storage approach.

### 11. In-App Notifications
Currently there is no way for a user to know that another user commented on their artifact. A simple in-app notification panel (unread count in header, list of events) would be the minimum viable awareness layer — without requiring email or real-time infrastructure.

### 12. Audit Log UI
`AiSession` is logged. Destructive actions (delete, restore, archive) are not. An admin-visible audit log page would aid compliance (aligns with the "audit logs" item listed in the landing page's security features).

### 13. Project Templates
Allow saving a project (its artifact structure, starter answers, and skeleton artifacts) as a template, and creating new projects from a template. Useful for teams that run a standard PM process repeatedly.

### 14. PostgreSQL / MariaDB Migration Validation
The Database Config UI exists, but the actual Prisma migration flow for switching from SQLite to Postgres in production has not been exercised end-to-end. A migration runbook and at minimum a CI smoke test against a Postgres container would reduce risk.

---

## UX/UI Fixes (from audit 2026-05-04)

### UX-1 — Language fragmentation (Critical)
`TraceabilityView` and `ArtifactGraph`/`GraphRelationDialog` are entirely in English while the rest of the app is German. `constants.js` type/status/relation labels are English and appear directly in the UI.
- Translate `TraceabilityView` to German (empty state, coverage labels, filter labels)
- Translate `ArtifactGraph` and `GraphRelationDialog` to German
- Add a German label map for `ARTIFACT_TYPE_LABELS`, `ARTIFACT_STATUS_LABELS`, `RELATION_TYPE_LABELS` (or wire them through `next-intl`)
- Fix `ExplorerDetail` line 81: `"New ${...}"` → German prefix

### UX-2 — Admin pages bypass Button/Input/Select components ✅ done
`AiProviderConfig`, `DatabaseConfig`, `LanguageManager` used raw `<button>`/`<input>` tags instead of the shared UI components. `AiSuggestionPanel`'s primary button used `bg-purple-600` instead of the app's blue. Fixed.

### UX-3 — `LanguageManager` used native `window.confirm()` ✅ done
Replaced with `<ConfirmDialog>` component, consistent with the rest of the app.

### UX-4 — Accessibility gaps in newer features (High)
- `DocumentImport`: Drop zone has `role="button"` but no `aria-label`; custom proposal checkboxes have no `<input type="checkbox">` or ARIA labels
- `ArtifactGraph`: Connection handles have no `title`/`aria-label`; drag-to-connect is not keyboard-accessible
- Progress bars in `ProgressOverview`/`PhaseCard`: missing `role="progressbar"`, `aria-valuenow`, `aria-valuemax`

### UX-5 — Graph drag-to-connect is undiscoverable (High)
Handles are small gray circles with no hover/cursor change. Only explanation is in a small corner legend. Add cursor-crosshair on handle hover, a tooltip on first visit, or a visible "connect" affordance on node hover.

### UX-6 — Inconsistent error state presentation (Medium) ✅ done
`RelationList`, `AiSuggestButton`, `InviteMember`, `MemberList` all standardised to
`bg-red-50 border border-red-200 text-red-700` boxes.
`DatabaseConfig` and `AiSuggestionPanel` remain open (lower impact).

### UX-7 — Inconsistent success feedback (Medium) ✅ done
`InviteMember` and `MemberList` now show `CheckCircle2` + green success banner after save.
`UserForm` and `LanguageManager` admin-side success indicators remain open.

### UX-8 — Two spinner patterns in use (Medium) ✅ done
`Loader2 animate-spin` usages replaced with `<Spinner>` from `@/components/ui/Spinner` across the affected components.

### UX-9 — DocumentImport: silent file rejection (Medium) ✅ done
Files over 10 MB or exceeding the 5-file limit now show a visible warning banner instead of being silently dropped.

### UX-10 — TraceabilityView has no loading state (Medium)
Every other data-fetching component shows a spinner. Traceability renders nothing until data arrives.

### UX-11 — StarterContextPanel collapse not discoverable (Low)
Defaults open, collapse chevron is 14×14 px, no animation, no tooltip. Add a transition and a more visible toggle affordance.

### UX-12 — Delete confirmation doesn't surface restore path (Low)
The delete dialog mentions soft-delete language but provides no link to version history or a restore option. Either add a note ("Kann in der Versionshistorie wiederhergestellt werden") or link to it.

### UX-13 — Status cycle button gives no sense of direction (Low)
The cycle button (DRAFT → IN_REVIEW → DONE → DRAFT) only shows the next state. Add a small pipeline indicator (e.g. `Draft → In Review → Done`) so the cycle direction is visible.

### UX-14 — PhaseCard uses two verbs for the same action (Low / Trivial)
"+ Ersten anlegen" vs "+ Hinzufügen" for identical Explorer create actions. Unify to one label.

### UX-15 — Disabled opacity inconsistency (Low / Trivial)
`Button` uses `disabled:opacity-50`; `Input`/`Select` use `disabled:opacity-60`. Standardize to one value across all interactive components.

### UX-16 — Border radius and shadow not centrally defined (Low)
`rounded-lg` (Button, Input, nav), `rounded-xl` (ConfirmDialog), `rounded-md` (some admin selects) are all hardcoded independently. No single token or CSS variable.

---

## Out of Scope (per spec, do not implement)

- Live collaborative editing (cursors, presence, conflict resolution)
- Email notifications or invitation emails
- Self-service user registration (admin-only user creation is the intended model)
- P2 features from the original product spec

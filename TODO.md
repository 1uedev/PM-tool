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

### UX-0 — Project header overflow + no active-state on navigation (High) ✅ done
Explorer page crammed 8 ghost buttons into one row with no indication of current view. Other pages showed only `← Explorer`.
Replaced all 7 inline `<header>` blocks with shared `ProjectNavBar` client component:
- Row 1: breadcrumb + utility actions (Search, Importieren, Einstellungen)
- Row 2: tab strip with `border-b-2 border-blue-600` active highlight
Also fixed: "+" button for Importieren renamed to Importieren (German), Starter page "Projects" → "Projekte".

### UX-1 — Language fragmentation (Critical) ✅ done
`TraceabilityView`, `ArtifactGraph`, `GraphRelationDialog` are all in German. All label maps in `constants.js` (`ARTIFACT_TYPE_LABELS`, `ARTIFACT_STATUS_LABELS`, `RELATION_TYPE_LABELS`) are German. `ExplorerDetail` already used `Neues {label}`. No remaining English in the authenticated app — landing page copy is intentionally English.

### UX-2 — Admin pages bypass Button/Input/Select components ✅ done
`AiProviderConfig`, `DatabaseConfig`, `LanguageManager` used raw `<button>`/`<input>` tags instead of the shared UI components. `AiSuggestionPanel`'s primary button used `bg-purple-600` instead of the app's blue. Fixed.

### UX-3 — `LanguageManager` used native `window.confirm()` ✅ done
Replaced with `<ConfirmDialog>` component, consistent with the rest of the app.

### UX-4 — Accessibility gaps in newer features (High) ✅ done
- `DocumentImport`: Drop zone has `aria-label`; proposal checkboxes now use native `<input type="checkbox" className="sr-only">` inside a `<label>` with the visual `CheckSquare`/`Square` icon; file remove buttons have `aria-label`
- `ArtifactGraph`: Handles have `title` and `aria-label`; keyboard drag is a ReactFlow limitation (keyboard users can create relations via Explorer's relation dialog instead)
- Progress bars in `ProgressOverview`, `PhaseCard`, and `TraceabilityView` all have `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

### UX-5 — Graph drag-to-connect is undiscoverable (High) ✅ done
Source handle is blue (`#3b82f6`) with `cursor: "crosshair"`. Target handle is gray with `cursor: "cell"`. Both have German `title` tooltips. Legend panel (top-right) explains the connect gesture in German.

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

### UX-10 — TraceabilityView has no loading state (Medium) ✅ done
All 4 sub-page loading files (board, progress, graph, traceability) now use shared `ProjectPageSkeleton` component with a two-row animated skeleton matching the ProjectNavBar layout + centered spinner.

### UX-11 — StarterContextPanel collapse not discoverable (Low) ✅ done
Already had `transition-all duration-200 ease-in-out`, "Einklappen"/"Aufklappen" text labels, `h-4 w-4` chevron icons, and `aria-expanded`. No changes needed.

### UX-12 — Delete confirmation doesn't surface restore path (Low) ✅ done
Description updated: "„{title}" wird dauerhaft gelöscht. Diese Aktion lässt sich nicht rückgängig machen — prüfe vorher die Versionshistorie, wenn du Inhalte aufbewahren möchtest."

### UX-13 — Status cycle button gives no sense of direction (Low) ✅ done
Replaced `{current} → {next}` with a `StatusPipeline` component showing all three states inline: current = blue dot + bold, completed = green dot, upcoming = gray dot. Separator `h-px w-3 bg-gray-300` between steps. Title tooltip still shows next state name.

### UX-14 — PhaseCard uses two verbs for the same action (Low / Trivial) ✅ done
TraceabilityView GroupSection empty-state changed "+ Erstes anlegen" → "+ Hinzufügen". Both TraceabilityView and PhaseCard now use "+ Hinzufügen".

### UX-15 — Disabled opacity inconsistency (Low / Trivial) ✅ done
Button, Input, and Select all already used `disabled:opacity-50`. No changes needed.

### UX-16 — Border radius and shadow not centrally defined (Low) ✅ done
Actionable inconsistencies resolved: `rounded-md` in RelationList and VersionList action buttons changed to `rounded-lg`. `rounded-xl` for cards/dialogs/field containers is intentional (larger radius for containing elements vs. interactive controls).

---

## Out of Scope (per spec, do not implement)

- Live collaborative editing (cursors, presence, conflict resolution)
- Email notifications or invitation emails
- Self-service user registration (admin-only user creation is the intended model)
- P2 features from the original product spec

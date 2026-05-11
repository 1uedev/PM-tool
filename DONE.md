# PM Copilot — Completed Work

Last updated: 2026-05-11. Derived from git history.

---

## MVP — All Four Sprints Complete

### Sprint 1 — Foundation
- Prisma schema (SQLite), migration, seed data (`admin@example.com`, `alice@example.com`, `bob@example.com`)
- NextAuth Credentials Provider + JWT session
- Registration, login, logout (A1–A3)
- Auth guard middleware + consistent `{ data }` / `{ error: { code, message } }` response format (L1–L3)
- Project CRUD: create, list, edit, archive (B1–B4)
- Explorer two-column layout (C1)
- Artifact create + edit with generic form wrapper (D1, D2)
- Type-specific field components for original 6 artifact types (D3)
- Artifact status (Draft / In Review / Done) + soft delete (D4, D5)
- Explorer tree: grouping, navigation, unsaved-changes guard (C2, C3)

### Sprint 2 — Relations & Collaboration
- Create relations with dialog (E1), display linked artifacts in detail view (E2), delete relation (E3)
- Comments: add (G1) + comment history (G2)
- Role-based access control (OWNER / EDITOR / VIEWER) enforced in API and UI (L1, L2)

### Sprint 3 — AI & Versioning
- AI provider adapter pattern (Claude + OpenAI), per-artifact suggest button, separate suggestion panel, selective accept, AI logging, guardrails (F1–F5)
- Version history: auto-version on every save (H1), version list (H2), restore (H3)
- Progress view: completion per group and type; missing artifact callouts (I1, I2)

### Sprint 4 — Search, Board, Polish
- Full-text search across all artifacts with type/status/tag filters (K1–K3)
- Tags: assign tags to artifacts, filter by tag (K2, K3)
- Status filter in Explorer tree (K3)
- Board view (Kanban: Draft / In Review / Done) with drag & drop (J1, J2)
- Error boundaries + not-found pages + global error handler (L3)

---

## Extension Steps (Post-MVP)

### Step 1 — Admin User Management
- System roles: `ADMIN` / `USER`
- Admin UI at `/admin/users`: create, edit, deactivate users; no self-service registration for regular users
- `requireAdmin` guard on all `/api/admin/*` routes

### Step 2 — Domain Model: 35 Artifact Types
Expanded from 6 original types to 35 across 8 groups:

| Group | Types |
|---|---|
| Foundations | Goals & Non-Goals, Stakeholder, Assumption, Constraint, Open Question |
| Research | Market Analysis, Competitor, Research Finding, Problem Statement, Opportunity, Hypothesis, Problem Hypothesis |
| Audience | User Persona, Buyer Persona |
| Strategy | Product Vision, Value Proposition, Positioning, Business Model, KPI/OKR, Measurement Plan |
| Discovery & Design | Use Case, User Journey, Feature, Epic |
| Delivery | User Story, Functional Requirement, Non-Functional Requirement, Acceptance Criteria, Dependency, Risk, Decision, Test Plan, Compliance Requirement |
| Planning & Release | Roadmap Item, Release, Launch Task, Milestone |
| Feedback & Iteration | Feedback Item, Iteration |

### Step 3 — Generalized Relations + Traceability
- Relation type suggestions (`RELATION_SUGGESTIONS` map covering all 35 types × their typical targets)
- Initial traceability view

### Step 4 — Explorer/Navigation Improvements
- Explorer tree groups all 35 types with color-coded group headers
- Collapsible groups, type badges, empty-group placeholder

### Step 5 — Type-Specific Field Components for All 35 Types
- `FIELD_COMPONENTS` map in `src/components/artifacts/fields/index.js`
- One `.jsx` per artifact type in `src/components/artifacts/fields/`

### Step 6 & 12 — Improved Traceability View
- Artifact list with per-row relation badges (direction, type, count)
- Coverage bar per group (% of types with at least one artifact)
- Gap detection: collapsible list of missing types per group with direct "+ Create" links
- Filters: status, relation type, group
- Empty groups show dashed placeholder + "Create first" CTA

### Step 7 — Review / Hardening (first pass)
- Code review; 9 bugs fixed across critical / high / medium / low severity
- Notable fixes: Rules of Hooks violation in `StarterContextPanel`, status de-sync in `ArtifactForm` + `ArtifactHeader`, silent API error discard in delete/status-change/restore flows, missing archive guard in `project-access.js`

### Step 8 — Multilingual Support (DE / EN)
- `next-intl` with cookie-based locale, no URL prefix
- Admin language management UI at `/admin/languages`
- User language preference stored in `User.preferredLanguage`
- User language selector in the dashboard

### Step 9 — Database Configuration UI
- Admin UI at `/admin/database`: configure provider (SQLite / PostgreSQL / MariaDB), connection string, test connection
- `AiConfig` singleton in DB; env vars used as fallback only

### Step 10 — AI Provider Configuration UI
- Admin UI at `/admin/ai`: configure provider (Claude / OpenAI / disabled), model, API key, test connection
- Config effective immediately without restart

### Step 11 — PRD Gap Analysis (9 Additional Types)
- Added: Milestone, Buyer Persona, Value Proposition, Positioning, Business Model, Measurement Plan, Non-Functional Requirement, Acceptance Criteria, Compliance Requirement
- All 9 have field components, AI prompt templates, and are wired into `FIELD_COMPONENTS` + `PROMPT_BUILDERS`

### Step 13 — PRD Starter (10-Question Onboarding)
- `Project.prdStarter` JSON column (migration `20260427172426`)
- Starter page at `/projects/:id/starter` with 10 questions, completion bar, artifact type badges
- New projects redirect to starter page after creation instead of Explorer
- `StarterContextPanel`: inline context above artifact form showing relevant starter answers per type
- Seed users now have stable fixed IDs to survive re-seeds without forced logout
- `requireAuth()` validates user still exists in DB (clean 401 on stale JWT)

### Step 14 — Interactive Artifact Graph
- `@xyflow/react` (React Flow v12) graph at `/projects/:id/graph`
- Artifacts as custom nodes laid out in columns by domain group
- Relations as directed, color-coded, smooth-step edges (blue = derives from, orange animated = depends on, gray = relates to, green = validates)
- Double-click node → opens artifact in Explorer
- Drag handle → `GraphRelationDialog` to create a new relation directly on canvas
- MiniMap, zoom controls, legend panel

### Step 15 — Document Import with AI Pre-fill
- Import page at `/projects/:id/import` (Editor/Owner only)
- Upload up to 5 files (PDF / DOCX / TXT / MD, max 10 MB each)
- AI extracts 13 extractable artifact types; user reviews proposals, checks/unchecks, then bulk-creates
- `POST /api/projects/:id/import` — text extraction + AI analysis (does not save)
- `POST /api/projects/:id/artifacts/bulk` — Prisma transaction; max 50 artifacts
- `pdf-parse` + `mammoth` in `serverExternalPackages`

---

### Extension Step 16 — Formal Relation Pickers (ArtifactRefField) ✅

**Goal:** Replace free-text fields that ask "who is the target user?" with live relation pickers that create formal Relation records — so persona links appear automatically in the graph, traceability view, and relation badges.

**New component — `ArtifactRefField`:**
- Multi-select relation picker: fetches existing relations + all project artifacts via SWR
- Renders linked items as colored chips (group color, × remove button)
- Dropdown to pick additional artifacts, filtered to the specified `targetTypes` array
- Creates/deletes `Relation` records via the existing `/relations` API
- Shows "Save first to link artifacts" placeholder when `artifactId` is null (new artifact, not yet saved)

**Field components updated (7 types):**

| Component | Replaced field | Target types |
|---|---|---|
| `ProductVisionFields` | `targetUsers` textarea | USER_PERSONA, BUYER_PERSONA |
| `ProductVisionFields` | `valueProposition` textarea | VALUE_PROPOSITION |
| `UseCaseFields` | `actor` text input | USER_PERSONA, BUYER_PERSONA |
| `ValuePropositionFields` | `targetCustomer` text input | USER_PERSONA, BUYER_PERSONA |
| `UserStoryFields` | `role` StoryRow | USER_PERSONA, BUYER_PERSONA |
| `UserJourneyFields` | `actor` text input | USER_PERSONA, BUYER_PERSONA |
| `OpportunityFields` | `targetAudience` text input | USER_PERSONA, BUYER_PERSONA |
| `PositioningFields` | `targetSegment` text input | USER_PERSONA, BUYER_PERSONA |

**`ArtifactForm`** passes `projectId` and `artifactId` down to every field component.

**`src/lib/artifactFields.js`** — removed the 8 replaced field definitions from `ARTIFACT_FIELD_DEFS`.

---

### Extension Step 17 — UX Polish Pass ✅

**Hydration fix — ExplorerTreeGroup button-in-button:**
- `<button>` containing another `<button>` is invalid HTML and caused a React hydration error
- Outer group toggle changed to `<div role="button" tabIndex={0}>` with `onClick` + `onKeyDown` for keyboard accessibility (`Enter`/`Space`)

**Error state standardisation (UX-6):**
- `RelationList` — failed SWR fetch now shows a red error box instead of a silent empty list
- `AiSuggestButton` — error response now rendered as a standard red alert box
- `InviteMember` + `MemberList` — all error paths use `bg-red-50 border border-red-200 text-red-700`

**Success feedback (UX-7):**
- `InviteMember` — shows `CheckCircle2` + green banner after successful invite
- `MemberList` — shows green banner after role change

**Spinner standardisation (UX-8):**
- All `<Loader2 className="animate-spin h-4 w-4">` usages replaced with `<Spinner>` from `@/components/ui/Spinner`

**DocumentImport file rejection feedback (UX-9):**
- Files over 10 MB and uploads exceeding 5 files now show a visible warning banner

---

### Extension Step 18 — Project Member Management Owner-Only Controls ✅

**Problem:** Non-owners could see the role change dropdown and remove button in `/projects/:id/settings`. Clicking either would result in a 403, but the controls were still shown and confusing.

**Fix:**
- `MembersSection` now passes `isOwner` prop to `MemberList`
- `MemberList` conditionally renders the role `<select>` and remove button only when `isOwner` is true
- Non-owners see a plain `<span>` with the translated role label
- `InviteMember` component rewritten to use shared `Input`, `Select`, `Button` primitives (was raw HTML elements)

---

### Extension Step 19 — Account Self-Service ✅

**Goal:** Let users update their display name and change their own password without admin involvement.

**New API endpoints:**
- `GET  /api/users/me` — returns current user (id, email, name, systemRole, createdAt)
- `PATCH /api/users/me` — updates display name; Zod validation, auth required
- `POST  /api/users/me/password` — verifies `currentPassword` via `bcrypt.compare`, then hashes and saves `newPassword` (min 8 chars); returns field-level error `{ currentPassword: ["Aktuelles Passwort ist falsch"] }` on mismatch

**New UI:**
- `/account` — server-rendered page fetching current user via session + Prisma
- `AccountForm` client component with two sections:
  - **Profile**: display name + disabled email field, PATCH on submit
  - **Change password**: current / new / confirm fields with client-side equality check before API call
  - Both sections use `Banner` sub-component for success (green + CheckCircle2) and error (red) states
- `Sidebar` footer — account link above LogoutButton shows `name || email || "Konto"`, active state when on `/account`

---

### Extension Step 20 — Artifact Export (JSON + CSV) ✅

**Goal:** Let users download all project artifacts for backup, migration, or offline analysis.

**New API endpoint:**
- `GET /api/projects/:id/export?format=json|csv` — auth + project access required
- **JSON format:** nested object `{ project: { id, name, description, status }, artifacts: [...] }` with full fields; `Content-Disposition: attachment; filename="<slug>_export.json"`
- **CSV format:** 8 fixed columns (`id`, `type`, `type_label`, `title`, `status`, `createdAt`, `updatedAt`, `fields`) with `fields` serialised as a JSON string; `Content-Disposition: attachment; filename="<slug>_export.csv"`

**New UI:**
- `ExportSection` component — two buttons (JSON and CSV) with per-format loading state
- Uses fetch → blob → `URL.createObjectURL` → anchor click pattern to honour `Content-Disposition`
- Embedded in `/projects/:id/settings` as a new "Export" section between Members and Actions

---

## Bug-fix Passes

| Commit | Fix |
|---|---|
| `07aad1f` | Recurring CSS/login breakage: stray `~/package-lock.json` misdetected as workspace root; fixed via `outputFileTracingRoot` + always-clean dev script |
| `8960759` | Stale JWT → 500 crash; `requireAuth()` now verifies user exists in DB |
| `91fc1d9` | Stable seed user IDs so JWT stays valid after re-seed |
| `48cabc4` | 9 code-review bugs (critical → low) including Rules of Hooks, status de-sync, silent error discard |
| `dc728ed` | `FieldHelpers` dual API + missing PRD Q5 coverage |
| `a2b3fde` | `pdf-parse` v2 class-based API update |

---

## Current State

- Branch: `main`, clean
- Database: `./dev.db` (root-level) — `./prisma/dev.db` is 0 bytes and unused
- Build: last verified clean after post-MVP extension work (Steps 16–20)
- Migrations: 5 applied (`init`, `add_user_admin_fields`, `add_language_model`, `add_ai_config`, `add_prd_starter`)

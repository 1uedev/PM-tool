# PM Copilot — Completed Work

Last updated: 2026-05-13. Derived from git history.

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

### Extension Step 21 — Landing Page Rewrite ✅

All public marketing pages replaced with PM Copilot-specific content (previously showed generic "Launchpad" / deployment platform placeholder copy).

- Root `/` — now shows the full landing page for unauthenticated visitors; authenticated users still redirect to `/projects`
- `Hero` — "Structure your product from problem to launch", CTAs to `/login` and `/features`
- `LogoBar` — 8 domain group names instead of fake company logos
- `FeatureHighlights` — Explorer, Relations & Traceability, AI Assistance, Version History
- `Testimonials` — PM-relevant quotes
- `CtaBanner` — "Start structuring your product today" → `/login`
- `Navbar` — `LayoutDashboard` icon, "Sign in" → `/login`; `SITE` and `NAV_LINKS` exports added to `constants.js` (were missing, so Navbar/Footer were broken)
- `Footer` — dead `#` hrefs removed, PM Copilot copy
- `/features` — 6 detailed feature sections (Explorer, Relations & Graph, AI Assistance, Version History, Views, Admin & Export)
- `/pricing` — single "Free. Forever. Self-hosted." plan with feature checklist and FAQ
- `/about` — problem framing, 4 design principles, tech stack grid
- `/contact` — updated email, PM Copilot copy

---

### Extension Step 22 — Unit Test Suite (Vitest) ✅

First test suite in the project — 99 tests across 10 files, all passing.

**Setup:**
- `vitest` + `@vitest/coverage-v8` + `@testing-library/react` + `jsdom` installed
- `vitest.config.js` with `@/` path alias and node environment
- `src/__tests__/setup.js` — global `next/server` mock so `NextResponse.json` returns a plain inspectable object

**Test files and coverage:**

| File | Tests | What's covered |
|---|---|---|
| `lib/errors.test.js` | 8 | `errorResponse` / `successResponse` shape, status, details |
| `lib/validators/artifact.test.js` | 12 | Type enum, status enum, title length, defaults |
| `lib/validators/project.test.js` | 9 | Name/description limits, partial updates |
| `lib/validators/comment.test.js` | 5 | Empty, max 2000, boundary |
| `lib/validators/relation.test.js` | 6 | All 4 relation types, missing fields |
| `lib/validators/user.test.js` | 14 | Email, password min-8, `formatUserName`, `safeUser` |
| `lib/validators/index.test.js` | 7 | `validateBody` (bad JSON, schema failure), `validateParams` |
| `lib/middleware/project-access.test.js` | 10 | Role hierarchy, archived guard, soft-delete filter |
| `lib/middleware/auth-guard.test.js` | 8 | No session, stale JWT → 401, non-admin → 403 |
| `lib/ai/document-extractor.test.js` | 20 | Parse, filter, sanitise, title cap, truncation, buildPrompt |

**Scripts:** `npm test` · `npm run test:watch` · `npm run test:coverage`

**Still open:** RTL component tests (`ArtifactForm`), API route integration tests, E2E flows.

---

### Extension Step 23 — Unified Project Navigation (ProjectNavBar) ✅

**Problem:** Every project sub-page had its own inline `<header>` with inconsistent content. The Explorer page crammed 8 buttons into one row with no active-state indication. Other pages (Board, Graph, Traceability, etc.) showed only a `← Explorer` back-link with no way to jump between views directly.

**New component — `ProjectNavBar`** (`src/components/layout/ProjectNavBar.jsx`):
- Client component using `usePathname()` for active-tab detection
- **Row 1** — breadcrumb (`Projekte / {projectName}`) on left; Search, Importieren (non-VIEWER), Einstellungen (OWNER) on right
- **Row 2** — tab strip: Explorer · Starter · Board · Fortschritt · Graph · Traceability; active tab has `border-b-2 border-blue-600 text-blue-700`
- Project name truncates at 240px to prevent overflow on long names

**Pages updated (7 total):** Explorer, Board, Fortschritt, Graph, Traceability, Starter, Import

**Also fixed:** Starter page breadcrumb showed "Projects" (English) — corrected to "Projekte".

---

### UX Audit Pass — Items UX-0 through UX-9 ✅

All nine items from the 2026-05-04 audit that were actionable without out-of-scope work are resolved:

| Item | Status | Notes |
|---|---|---|
| UX-0 | ✅ | ProjectNavBar with tab strip + active state (Step 23) |
| UX-1 | ✅ | All labels already German; no English strings remain in authenticated app |
| UX-2 | ✅ | Admin components use shared Button/Input/Select primitives |
| UX-3 | ✅ | LanguageManager uses ConfirmDialog instead of window.confirm() |
| UX-4 | ✅ | DocumentImport: native checkbox + aria-label on drop zone and file remove buttons; ArtifactGraph handles have title/aria-label; all progress bars have full progressbar ARIA |
| UX-5 | ✅ | Graph source handle blue + cursor:crosshair; target handle cursor:cell; both have German title tooltips; legend panel explains gesture |
| UX-6 | ✅ | Error boxes standardised to bg-red-50 border-red-200 text-red-700 |
| UX-7 | ✅ | Success banners with CheckCircle2 added to InviteMember and MemberList |
| UX-8 | ✅ | All Loader2 usages replaced with shared Spinner component |
| UX-9 | ✅ | File rejection warnings shown for >10 MB files and >5 file limit |

**UX-10 through UX-16** subsequently completed — see table below.

---

### UX Audit Pass — Items UX-10 through UX-16 ✅

| Item | Change |
|---|---|
| UX-10 | `ProjectPageSkeleton` component — two-row animated skeleton (breadcrumb + tab strip) + spinner; replaces stale single-row loading skeletons in board/progress/graph/traceability `loading.js` |
| UX-11 | Already had animation, text labels, h-4 chevrons, and `aria-expanded` — no changes needed |
| UX-12 | Delete dialog: removed misleading "über die Benutzeroberfläche nicht rückgängig" clause; now tells user to check version history before deleting |
| UX-13 | `StatusPipeline` component in `ArtifactHeader`: shows all three states inline — current blue, completed green, upcoming gray — so cycle direction is always visible |
| UX-14 | TraceabilityView empty-group "+ Erstes anlegen" unified to "+ Hinzufügen" (matches PhaseCard) |
| UX-15 | Already standardised to `disabled:opacity-50` across Button, Input, Select — no changes needed |
| UX-16 | `rounded-md` → `rounded-lg` in RelationList and VersionList action buttons; `rounded-xl` for cards/dialogs/field containers kept as intentional larger radius |

---

---

### Extension Step 24 — Rich Text Editor for Long-Form Fields ✅

**Goal:** Replace plain `<textarea>` elements on prose/narrative fields with a Tiptap rich-text editor — supports bold, italic, bullet lists, and ordered lists — without requiring any schema migration.

**Storage:** HTML (Tiptap's native output). Existing plain-text data loads transparently — Tiptap treats it as an unformatted paragraph. No schema migration needed.

**New component — `RichTextarea`** (`src/components/ui/RichTextarea.jsx`):
- `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-placeholder`
- Minimal toolbar: Bold · Italic · (divider) · BulletList · OrderedList
- Toolbar hidden when `disabled={true}` (read-only mode)
- `useEffect` sync: when the artifact is swapped in the explorer, `editor.commands.setContent(value, false)` re-hydrates without triggering `onUpdate`
- Loaded via `next/dynamic` with `ssr: false` to avoid SSR serialisation issues

**`FieldTextarea` updated** (`FieldHelpers.jsx`):
- New `rich` prop (boolean, default false); when truthy renders `<RichTextarea>` instead of `<textarea>`
- Both calling conventions (A: `fieldKey`/`fields`, B: `label`/`value`) work unchanged

**Fields updated — 34 field targets across 24 components:**

Prose fields that got `rich={true}`: goals, painPoints, context, description, rationale, alternatives, consequences, assumption, validation, problem, impact, currentSolution, whyInsufficient, insight, implications, inScope, outOfScope, successCriteria, scope, goals (Epic), potentialValue, summary (MarketAnalysis), trends, mitigation, constraint, rationale (Constraint), impact (Constraint), assumption (Assumption), validatedBy, question, context (OpenQuestion), resolution, goals (GoalsNonGoals), nonGoals, rationale (GoalsNonGoals), description (Milestone), criteria, responsibility, keyBenefit, differentiator, description (NonFunctionalRequirement), description (RoadmapItem), rationale (Roadmap), learnings, improvements, nextSteps, scenario, painPoints (UserJourney), opportunities

**Kept as plain text** (structured / mono): `flow` (Use Case, numbered steps), `acceptanceCriteria` (FunctionalRequirement, `-` bullet format), `keyResults` (KPI/OKR, `KR1/KR2/KR3` format), `steps` (UserJourney, `N. Schritt: …` format)

---

### Extension Step 25 — Expanded Test Suite (RTL + API Integration) ✅

**Goal:** Extend the Vitest suite beyond the lib layer to cover the main form component and the three core API route files.

**New test files (4):**

| File | Tests | What's covered |
|---|---|---|
| `__tests__/components/ArtifactForm.test.jsx` | 20 | Create mode (title required, POST + navigate, network error), Edit mode (PATCH + field merge, dirty flag, save feedback, field-level + global API errors, reset on artifact swap), VIEWER role (disabled inputs + hidden save) |
| `__tests__/api/projects.test.js` | 10 | GET /api/projects (401, list with role+artifactCount, _count stripped, 500), POST (401, 400 missing/empty name, 201 with OWNER member, 500) |
| `__tests__/api/artifacts.test.js` | 10 | GET list (401, 403, list, type-filter, 500), POST (403, 400 no-type/empty-title, 201 with initial version, 500) |
| `__tests__/api/artifact.test.js` | 11 | GET (401, 404, fields parsed, fields already object), PATCH (403, 400 invalid status, update+version increment, field merge, 500), DELETE (403, 404, soft-delete, 500) |

**Total suite: 150 tests, 14 files, all passing.**

**Key engineering decisions:**
- `// @vitest-environment jsdom` docblock on `ArtifactForm.test.jsx` — overrides global node environment per file
- `vi.hoisted()` for `mockPush`/`mockBack`/`mockMutate` — mock values hoisted before `vi.mock()` factories run
- Async `vi.mock()` factories with `await import("react")` + `React.createElement` for `DirtyFormContext.js` and `ProjectRoleContext.js` — avoids Vite 8 Oxc refusing to parse JSX in `.js` extension files
- `PARAMS = { params: Promise.resolve({...}) }` in all API tests — Next.js 15 App Router `params` is a Promise
- `vitest.config.js` updated: `plugins: [react()]`, `environmentMatchGlobs: [["src/__tests__/components/**", "jsdom"]]`

---

### Extension Step 26 — Playwright E2E Test Suite + ArtifactRefField Bug Fix ✅

**Goal:** Complete the test suite with Playwright E2E tests covering the 3 core flows from the spec, and fix a bug discovered in the process.

**17 E2E tests, 4 files, all passing:**

| File | Tests | Coverage |
|---|---|---|
| `e2e/auth.spec.js` | 5 | Redirect to /login, validation errors, wrong credentials, login, logout |
| `e2e/project.spec.js` | 5 | Create project → starter, create artifact via new-artifact form, edit + save + version history, tree appearance, soft-delete disappears |
| `e2e/relations.spec.js` | 2 | Add relation via dialog → appears in list, relation visible in traceability view |
| `e2e/admin.spec.js` | 5 | Admin navigates to /admin/users, non-admin redirect, create user, new user logs in, new user sees empty projects |

**Infrastructure:**
- `playwright.config.js` — Chromium headless, serial workers, `e2e/` testDir, screenshots + video on failure
- `e2e/global-setup.js` — server readiness check (verifies localhost:3000 before suite starts)
- `e2e/helpers/auth.js` — shared `login()` helper
- `@playwright/test` added to devDependencies; `npm run test:e2e`, `test:e2e:ui`, `test:e2e:headed` scripts added

**Bug fixed (discovered by E2E):**
- `ArtifactRefField.jsx` — `getGroupColor()` used `group.id` but `ARTIFACT_GROUPS` uses `group.key`. Result: `ARTIFACT_GROUP_COLORS[undefined]` was `undefined`, causing `colors.badge` to throw a runtime error that triggered the error boundary on any page with a ProductVision, UseCase, ValueProposition, UserStory, UserJourney, or Opportunity artifact. Fixed: `group.id` → `group.key`.

**Also fixed:** `RichTextarea.jsx` — added `immediatelyRender: false` to `useEditor` options to prevent Tiptap from throwing an SSR hydration error in headless/server-side rendering contexts (Playwright triggered this on the new-artifact form).

---

### Extension Step 27 — Intelligent Full-Document Import (30 artifact types) ✅

**Goal:** Expand the document import from 13 hardcoded extractable types to all 30 canonical types with field schemas, add chunking for large documents, extract and propose artifact relations, and upgrade the review UI with confidence/evidence display and auto-create mode.

**`src/lib/ai/document-extractor.js` (rewritten):**
- `getCanonicalExtractableTypes()` — dynamically derives extractable types from `ARTIFACT_FIELD_DEFS`; no hardcoded list
- `getMissingSchemaTypes()` — surfaces the 9 types without field schemas as warnings
- `buildTypeSchemas()` — builds per-type `{ fieldKeys, fields, label }` schema from `ARTIFACT_FIELD_DEFS`
- `buildExtractionPrompt(typeSchemas, chunkText)` — single prompt covering all 30 types; fields come from live schema
- `parseExtractionResponse(text, typeSchemas)` — robust JSON parser; validates type + field keys; enriches with `_id`, confidence, evidence, rationale
- `mergeExtractionResults(results)` — deduplicates artifacts and relations across chunks
- Chunking: `DEFAULT_CHUNK_CHARS = 12000`, `DEFAULT_CHUNK_OVERLAP = 800`
- Field length caps: title 200, field values 4000, evidence quotes 400, rationale 600

**`src/app/api/projects/[projectId]/import/route.js` (extended):**
- Chunking strategy for large documents (hard cap 250k chars total text)
- Parallel chunk processing via `Promise.all`
- Stats: `{ canonicalTypeCount, proposedArtifactCount, coveredTypeCount, missingTypes, warnings }`
- Relation proposals pass through to client

**`src/app/api/projects/[projectId]/artifacts/bulk/route.js` (extended):**
- Accepts `{ artifacts: [...], relations: [...] }` with `clientId` fields
- `clientId` → DB ID mapping after artifact creation
- Relations created in same Prisma transaction
- Limit raised from 50 to 100

**`src/components/import/DocumentImport.jsx` (upgraded):**
- Coverage panel: 8 groups showing covered/missing types per group
- `ProposalCard`: per-artifact confidence badge (color-coded ≥75% green, ≥50% amber, <50% red), evidence quotes (truncated, with `Quote` icon), field preview, expand/collapse
- `RelationsPanel`: per-relation checkboxes, type badge, source→target labels
- Auto-create mode: requires explicit checkbox before analysis; creates immediately without review step
- Warnings panel for types lacking field schemas

**New tests:**
- `src/__tests__/api/artifacts-bulk.test.js` (new, 12 tests) — bulk with and without relations
- `src/__tests__/lib/ai/document-extractor.test.js` (updated) — `buildTypeSchemas`, `parseExtractionResponse`, chunking, merge, sanitisation

**`vitest.config.js` — fixed `include` filter** to stop Vitest picking up Playwright e2e specs.

**Total test suite: 176 Vitest tests (15 files), 17 Playwright E2E tests — all passing.**

---

---

### Extension Step 28 — Responsive Design + Accessibility Pass ✅

**Goal:** Sprint 4 Step 7 from the original spec — mobile-friendly layouts and a full ARIA pass.

**Mobile Explorer (master-detail panel switching):**
- New `ExplorerPanelLayout.jsx` client component reads `useSearchParams()` and toggles visibility:
  - No artifact/new selected → full-width tree panel; detail hidden
  - Artifact/new selected → tree hidden; full-width detail panel
- Mobile back button (`← Zurück`) in detail panel clears `?artifact` / `?new` params and returns to tree
- On `md+` (768 px+): original side-by-side layout with fixed 256 px tree column

**Responsive layout fixes:**
- `ProjectNavBar` — `px-2 sm:px-4` padding; project name `max-w-[120px] sm:max-w-[240px]`; "Importieren" and "Einstellungen" label text hidden on mobile (icon only); tab strip `px-2 sm:px-3` per tab
- `BoardView` — columns `w-60 sm:w-72`; board area `gap-2 sm:gap-4`, `p-2 sm:p-4`
- `ExplorerDetail` — padding `p-4 sm:p-6` in both `ArtifactDetailPanel` and `NewArtifactPanel`

**ARIA improvements:**
- `ExplorerTree` nav — `aria-label="Artefaktnavigation"`
- `ExplorerTreeGroup` toggle — `aria-expanded={open}`, `aria-controls={listId}`, plus button `aria-label`; `<Plus>` icon `aria-hidden`
- `ExplorerTreeItem` button — `aria-current="page"` when selected; `aria-label` with title + status
- `ProjectNavBar` — breadcrumb wrapped in `<nav aria-label="Brotkrumennavigation">`; tab strip in `<nav aria-label="Projektnavigation">`; active tab `aria-current="page"`; icon `aria-hidden`
- `BoardView` — filter group has `role="group" aria-label="Nach Artefakttyp filtern"`, each filter button has `aria-pressed`
- `BoardColumn` — `role="region"` with `aria-label` showing status label and count

**Color contrast:** All group badge colors (`bg-{color}-50 text-{color}-700`) verified — pass WCAG AA (≥ 4.5:1) at Tailwind's standard palette values. No changes needed.

---

---

### Extension Step 29 — PDF Export / Report Generation ✅

**New dependency:** `pdfkit` v0.18 (pure Node.js, added to `serverExternalPackages`).

**`src/lib/pdf/generateProjectReport.js` (new):**
- Cover: project name (blue, large), description, status + export date
- Summary: 2-column grid with per-group artifact counts
- Artifacts: one page-group per domain, artifacts sorted by type order then title
- Each artifact: title + status dot/label (right-aligned), type label, then all field values with human-readable labels from `ARTIFACT_FIELD_DEFS`
- HTML stripped from rich-text fields (`<p>`, `<li>`, `<br>` → newlines; tags removed)
- Automatic page breaks before any block that would overflow

**`src/app/api/projects/[projectId]/export/route.js`:**
- Added `format=pdf` branch calling `generateProjectReport()` and returning `application/pdf` with `Content-Disposition: attachment`

**`src/components/projects/ExportSection.jsx`:**
- Added "PDF-Bericht" button (rose `FileDown` icon) alongside existing JSON / CSV buttons

---

---

### Extension Step 30 — Audit Log UI ✅

**New `AuditLog` table** (migration `20260518175423_add_audit_log`): `id`, `action`, `userId`, `projectId?`, `targetId?`, `meta` (JSON string), `createdAt`. Indexes on `createdAt`, `userId`, `projectId`.

**Actions logged:**
- `ARTIFACT_DELETE` — on `DELETE /api/projects/:id/artifacts/:aid`; meta: `{ artifactTitle, artifactType }`
- `ARTIFACT_RESTORE` — on `POST /api/projects/:id/artifacts/:aid/versions/:vid/restore`; meta: `{ artifactTitle, artifactType, restoredFromVersion }`
- `PROJECT_ARCHIVE` / `PROJECT_UNARCHIVE` — on `PATCH /api/projects/:id/archive`; meta: `{ projectName }`

**`src/lib/audit.js`** — `logAction(action, userId, projectId, targetId, meta)` helper; fire-and-forget with internal try-catch so it never disrupts the response path.

**`GET /api/admin/audit`** — admin-only; pagination (`page`, `limit`); optional `action` filter; returns `{ entries, total, page, limit }` with user name/email joined.

**`/admin/audit` page** — `AuditLogTable` client component with:
- Action filter chips (aria-pressed)
- Table: timestamp, color-coded action badge, user name/email, affected artifact/project
- Pagination with Seite N/M display

**Sidebar** — "Audit-Log" (`ClipboardList` icon) added to admin nav section. i18n keys added to `de.json` and `en.json`.

**Bug fixed:** `DELETE /artifacts/:id` was not destructuring `artifact` from `requireArtifactAccess` — the artifact object was out of scope. Fixed while adding the log call.

---

---

### Extension Step 31 — Artifact Bulk Actions in Explorer ✅

**Goal:** Let EDITOR+ users multi-select artifacts in the Explorer tree and apply batch operations.

**`BulkSelectContext.js`** — React context with `selectMode`, `selectedIds` (Set), `enter()`, `clear()`, `toggle(id)`.

**`ExplorerTreeClient.jsx`:**
- Wraps inner tree in `<BulkSelectProvider>`
- "Auswählen" toggle button in the filter bar (EDITOR/OWNER only); shows `CheckSquare` icon when active
- Renders `<BulkActionBar>` at the bottom of the panel when `selectMode` is true
- Fetches project tags (SWR) for use in the bulk tag picker

**`ExplorerTreeItem.jsx`:**
- In select mode: renders a checkbox (custom SVG tick) instead of the status dot; click calls `toggle(id)` instead of navigating
- `aria-pressed` attribute set in select mode; `aria-current` only set outside select mode

**`BulkActionBar.jsx`** — shown when `selectMode` is true:
- Selected count display
- **Status dropdown** (opens upward) — DRAFT / In Review / Done → calls `PATCH /artifacts/bulk`
- **Tag dropdown** — project tags list → calls `POST /artifacts/bulk/tags`
- **Delete button** with `ConfirmDialog` → calls `DELETE /artifacts/bulk`
- **Cancel (×)** button calls `clear()`
- All actions call SWR `mutate` to refresh the artifact list and then call `clear()`

**API — `PATCH /api/projects/:id/artifacts/bulk`:** Updates `status` on all `ids` that belong to the project and are not deleted. `updateMany`, no version bump needed.

**API — `DELETE /api/projects/:id/artifacts/bulk`:** Soft-deletes all `ids`; logs `ARTIFACT_BULK_DELETE` via `logAction`.

**API — `POST /api/projects/:id/artifacts/bulk/tags`:** Upserts `ArtifactTag` rows for all valid `(artifactId, tagId)` pairs in one Prisma transaction.

---

## Current State

- Branch: `main`, clean (only `.claude/settings.local.json` uncommitted)
- Database: `./dev.db` (root-level) — `./prisma/dev.db` is 0 bytes and unused
- Build: last verified clean (Step 31)
- Tests: 176 Vitest (15 files) + 17 Playwright E2E — all passing
- Migrations: 6 applied (`init`, `add_user_admin_fields`, `add_language_model`, `add_ai_config`, `add_prd_starter`, `add_audit_log`)
- All 17 UX audit items (UX-0 through UX-16) resolved
- Remaining open work: TODO.md items 7, 9

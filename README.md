# PM Copilot

AI-powered product management system for structured PM artifacts, traceability, and contextual assistance.

## What is PM Copilot?

PM Copilot is a structured product management workspace. It helps product managers capture, organise, and connect all the artifacts that make up a product — from the first problem statement to the final launch task — in a single, navigable system.

### Core idea

Traditional PM work is scattered across documents, Notion pages, and Jira tickets with no consistent structure and no traceability between decisions. PM Copilot gives every piece of information a **type**, a **status**, and **explicit links** to other artifacts. The result is a living graph of the product, where you can see how a business goal connects to a persona, a hypothesis, a feature, a user story, and an acceptance criterion — and spot what is missing.

### Domain model: 35 artifact types across 8 groups

Every item in the system is an **Artifact** with a type-specific set of fields, a status (Draft / In Review / Done), version history, comments, and relations to other artifacts.

| Group | Artifact types |
|---|---|
| **Foundations** | Goals & Non-Goals, Stakeholder, Assumption, Constraint, Open Question |
| **Research** | Market Analysis, Competitor, Research Finding, Problem Statement, Opportunity, Hypothesis, Problem Hypothesis |
| **Audience** | User Persona, Buyer Persona |
| **Strategy** | Product Vision, Value Proposition, Positioning, Business Model, KPI/OKR, Measurement Plan |
| **Discovery & Design** | Use Case, User Journey, Feature, Epic |
| **Delivery** | User Story, Functional Requirement, Non-Functional Requirement, Acceptance Criteria, Dependency, Risk, Decision, Test Plan, Compliance Requirement |
| **Planning & Release** | Roadmap Item, Release, Launch Task, Milestone |
| **Feedback & Iteration** | Feedback Item, Iteration |

### Key features

- **Explorer** — two-column view: artifact tree on the left (grouped, collapsible), structured edit form on the right; deep-linkable via URL params (`?artifact=ID`, `?new=TYPE`)
- **Relations** — explicit typed links between any two artifacts (Derives From / Depends On / Relates To / Validates); smart type suggestions based on source/target pair
- **Traceability view** — full artifact graph with gap detection, coverage bars per group, and filters by status, relation type, and visibility
- **Progress view** — completion overview per group and type; highlights missing or empty phases
- **Board view** — Kanban board (Draft / In Review / Done) with drag & drop; filterable by artifact type
- **Document import** — upload PDF, DOCX, TXT, or MD files; AI scans the content and proposes pre-filled artifacts (personas, vision, features, etc.); user reviews and selects which to create
- **AI suggestions** — per-artifact AI assist button (Claude or OpenAI); suggestions shown in a separate panel, never auto-applied; every suggestion requires explicit user acceptance
- **Version history** — every save creates a version; full diff and restore available
- **Search** — full-text search across all artifacts with type, status, and tag filters
- **Admin panel** — user management (create / edit / deactivate), language management (DE/EN), database configuration, AI provider configuration (provider + model + API key, effective without restart)
- **Role-based access** — system roles (Admin / User) and project roles (Owner / Editor / Viewer) with full enforcement in API and UI
- **Multilingual** — next-intl, cookie-based locale, no URL prefix; currently DE + EN
- **Account self-service** — users can update their display name and change their password at `/account`; account link in sidebar footer
- **Export** — download all project artifacts as JSON (full nested structure) or CSV (fixed columns + fields as JSON) from project settings
- **Relation pickers** — key fields (target user, actor, target segment, etc.) are formal relation pickers linking to Persona artifacts, not free-text; links appear automatically in graph and traceability

### Architecture notes for AI assistants

- **App Router only** — all pages are in `src/app/(dashboard)/` or `src/app/(auth)/`; no Pages Router
- **Server Components by default** — data fetching happens in page-level Server Components; Client Components are the leaf nodes that need interactivity
- **`src/lib/constants.js`** — single source of truth for all artifact types, groups, colors, status labels, relation types, and relation suggestions; always check here before adding new enums anywhere
- **`src/components/artifacts/fields/index.js`** — `FIELD_COMPONENTS` map; adding a new artifact type requires a new field component registered here
- **`src/lib/ai/prompts/index.js`** — `PROMPT_BUILDERS` map; every artifact type needs a prompt template here for the AI button to work
- **API pattern** — every route calls `requireAuth()` + `requireProjectAccess()` before any logic; responses are always `{ data }` or `{ error: { code, message } }`
- **Prisma + SQLite** — `fields` column is JSON (stored as TEXT in SQLite, Prisma handles serialisation); no raw SQL, all queries through Prisma client
- **SWR for client state** — mutations call the API, then `mutate()` the relevant SWR keys; no global state store

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript |
| Styling | Tailwind CSS 3 |
| ORM | Prisma 7 |
| Database | SQLite (default) → PostgreSQL / MariaDB (configurable) |
| Auth | NextAuth.js 4 (Credentials Provider, JWT) |
| Data fetching | SWR |
| Validation | Zod 3 |
| Icons | Lucide React |
| i18n | next-intl (cookie-based, no URL prefix) |
| AI | Anthropic Claude SDK + OpenAI SDK (provider-agnostic) |

## Local Development

```bash
# Install dependencies
npm install

# Initialize database and seed demo data
npx prisma migrate dev
node prisma/seed.mjs

# Start development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Demo Credentials

| Email | Password | System Role | Project Role |
|---|---|---|---|
| admin@example.com | password123 | Admin | — |
| alice@example.com | password123 | User | Owner (Smart Home App) |
| bob@example.com | password123 | User | Editor (Smart Home App) |

### Environment Variables

`.env` is not checked in. Template:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AI provider (fallback if no DB config exists)
# Configured via the Admin UI at /admin/ai
AI_PROVIDER="disabled"
AI_CLAUDE_API_KEY=""
AI_OPENAI_API_KEY=""
AI_TIMEOUT_MS=30000
AI_MAX_TOKENS=2048
```

> **Note:** AI provider, model, and API key are preferably configured through the Admin UI (`/admin/ai`) and stored in the database. Environment variables serve only as a fallback for initial startup.

### Useful Scripts

```bash
npm run db:seed       # Seed demo data
npm run db:reset      # Reset DB and re-seed
npx prisma studio     # Open database browser

npm test              # Run unit test suite (99 tests)
npm run test:watch    # Vitest watch mode
npm run test:coverage # Coverage report (HTML + text)
```

---

## Progress: Sprint 1

### Step 1 — Prisma Schema, Migration, Seed ✅

- Prisma 7 set up with SQLite adapter (`@prisma/adapter-better-sqlite3`)
- Full data model created: `User`, `Project`, `ProjectMember`, `Artifact`, `Relation`, `ArtifactVersion`, `Comment`, `Tag`, `ArtifactTag`, `AiSession`
- First migration applied (`prisma/migrations/…_init`)
- Seed script (`prisma/seed.mjs`) with demo data:
  - 2 users (alice & bob)
  - 1 project "Smart Home App"
  - 6 artifacts (all types, various statuses)
  - 3 relations between artifacts
  - One initial version per artifact
  - 1 comment
- `src/lib/prisma.js` — Prisma client singleton with adapter

---

### Step 2 — NextAuth Setup (Credentials Provider, JWT) ✅

- `src/lib/auth.js` — NextAuth config with Credentials Provider, bcrypt password verification, JWT session, custom login page `/login`
- `src/app/api/auth/[...nextauth]/route.js` — NextAuth API handler
- `src/lib/middleware/auth-guard.js` — `requireAuth()` helper for API routes
- `src/lib/errors.js` — `errorResponse()` / `successResponse()` for consistent API responses
- `src/middleware.js` — Next.js middleware automatically protects `/projects/*` and `/api/projects/*`
- `src/components/auth/SessionProvider.jsx` — client wrapper for `SessionProvider`
- Root layout wrapped with `SessionProvider`

**Implementation notes:**
- Kept Zod on v3 (next-auth v4 incompatible with Zod v4)
- Removed `"type": "module"` — ESM/CJS conflict with next-auth; using `.mjs` for seed and config instead
- `serverExternalPackages` for Prisma/bcryptjs prevents Webpack bundling errors

---

### Step 3 — Registration, Login, Logout (A1, A2, A3) ✅

- `POST /api/auth/register` — registration with Zod validation, bcrypt hashing, duplicate check
- `src/app/(auth)/layout.js` — centered auth layout without sidebar
- `/login` — `LoginForm` with `signIn()`, error display, loading indicator, redirect to `/projects`
- `/register` — `RegisterForm` with API call, auto-login after registration, field validation
- `LogoutButton` — `signOut()` → `/login`
- Root `/` redirects authenticated users to `/projects`, guests to `/login`
- New UI primitives: `Input`, `Spinner`, `Button` (revised)

---

### Step 4 — Auth Guard Middleware + Error Format (L1, L2, L3) ✅

- `src/lib/middleware/project-access.js`:
  - `requireProjectAccess(userId, projectId, requiredRole)` — checks membership + role (VIEWER / EDITOR / OWNER) with tenant isolation
  - `requireArtifactAccess(artifactId, projectId)` — ensures artifact belongs to the project
- `src/lib/validators/index.js`:
  - `validateBody(request, schema)` — parses JSON body and validates against Zod schema
  - `validateParams(searchParams, schema)` — validates URL query parameters
- `src/lib/constants.js` — all domain enums and labels (`PROJECT_STATUS`, `PROJECT_ROLE`, `ARTIFACT_TYPE`, `ARTIFACT_STATUS`, `RELATION_TYPE`)

**Pattern used across all API routes:**
```js
const { session, response: authErr } = await requireAuth();
if (authErr) return authErr;

const { membership, response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
if (accessErr) return accessErr;

const { data, response: validErr } = await validateBody(request, mySchema);
if (validErr) return validErr;
```

---

### Step 5 — Project CRUD (B1, B2, B3, B4) ✅

**API:**
- `GET /api/projects` — project list with artifact count
- `POST /api/projects` — create project; creator is automatically OWNER
- `GET/PATCH/DELETE /api/projects/:id` — details, edit (EDITOR+), delete (OWNER)
- `PATCH /api/projects/:id/archive` — archive / reactivate (OWNER)
- All routes secured with `requireAuth` + `requireProjectAccess`

**Frontend:**
- Dashboard layout with `Sidebar` (auth gate, Server Component)
- `/projects` — project grid, active + archived sections, empty state
- `/projects/new` — form with validation
- `/projects/:id/settings` — edit + actions (archive, delete with confirmation dialog)
- New components: `ProjectCard`, `ProjectList`, `ProjectForm`, `ProjectSettingsActions`
- New UI primitives: `Badge`, `ConfirmDialog`, `Sidebar`, `Header`, `EmptyState`

---

### Step 6 — Explorer Layout (C1) ✅

Two-column layout for `/projects/:id`:

```
┌─────────────────────────────────────────┐
│ Breadcrumb                  Settings   │  ← Header
├──────────────┬──────────────────────────┤
│ Artifacts    │                          │
│              │                          │
│ USER PERSONA │   Detail panel           │
│  • Persona A │                          │
│              │   → empty: hint text     │
│ PROBLEM HYP. │   → ?artifact=ID: form   │
│  • Hyp. B    │   → ?new=TYPE: create    │
│              │                          │
│ USE CASE (0) │                          │
│  None...     │                          │
└──────────────┴──────────────────────────┘
```

- `ExplorerTree` (Server Component) — groups artifacts by type in canonical order
- `ExplorerTreeGroup` — collapsible group with item count and `+` button (on hover)
- `ExplorerTreeItem` — entry with status dot (green / yellow / grey), sets `?artifact=ID` in the URL
- `ExplorerDetail` (Client Component) — reads URL params, shows context-appropriate content
- `GET /api/projects/:id/artifacts` — list of all non-deleted artifacts, optional `?type=` filter
- URL params as state (`?artifact=ID`, `?new=TYPE`) — deep-linkable, no extra client state

---

### Step 7 — Create and Edit Artifacts (D1, D2) ✅

**API:**
- `POST /api/projects/:id/artifacts` — creates artifact + version 1 in a transaction, merges fields with type defaults
- `GET /api/projects/:id/artifacts/:aid` — full artifact with parsed JSON fields
- `PATCH /api/projects/:id/artifacts/:aid` — update with automatic versioning

**Frontend:**
- `ArtifactForm` — unified create/edit form:
  - Title + status select in header
  - All fields for the type as labeled inputs / textareas
  - Optimistic save feedback ("✓ Saved")
  - On create: redirect to `?artifact=ID`
- `ExplorerDetail` (live):
  - `?artifact=ID` → SWR fetch → `ArtifactForm` (edit mode)
  - `?new=TYPE` → `ArtifactForm` (create mode)
  - Empty → hint text
- `ExplorerTreeClient` — client wrapper with SWR revalidation after mutations, server-rendered initial data as fallback

**Shared:**
- `src/lib/artifactFields.js` — field definitions (key, label, placeholder, multiline, rows) for all 6 artifact types + `getDefaultFields()`
- `src/lib/validators/artifact.js` — Zod schemas for create and update
- `Select` UI primitive

---

### Step 8 — Type-Specific Field Components (D3) ✅

A dedicated field component for each of the 6 artifact types with type-appropriate UX:

| Component | Highlight |
|---|---|
| `UserPersonaFields` | Name, goals, pain points, context as labeled fields |
| `ProblemHypothesisFields` | Visual divider between problem section and hypothesis section |
| `ProductVisionFields` | One-liner in a highlighted blue box |
| `UseCaseFields` | Actor + goal side by side, flow in monospace textarea |
| `UserStoryFields` | Classic "As a … I want … so that …" format with connected display |
| `FunctionalRequirementFields` | Acceptance criteria in monospace textarea with hint text |

- `FieldHelpers.jsx` — shared primitives: `FieldLabel`, `FieldInput`, `FieldTextarea`, `FieldGroup`, `SectionDivider`
- `fields/index.js` — `FIELD_COMPONENTS` map for dynamic rendering by type
- `ArtifactForm` — generic renderer removed, now uses `FIELD_COMPONENTS[artifactType]`

---

### Step 9 — Artifact Status and Soft Delete (D4, D5) ✅

**D4 — Status management:**
- `ArtifactHeader` — shows type label + `ArtifactStatusBadge` + quick status button
- Quick status toggle: one click cycles DRAFT → IN_REVIEW → DONE → DRAFT, immediately writes a new version, invalidates SWR cache in tree and detail panel
- Status button shows the next target status as its label

**D5 — Soft delete:**
- `DELETE /api/projects/:id/artifacts/:aid` — sets `deleted: true`; record is physically retained
- Delete icon in `ArtifactHeader` opens `ConfirmDialog` with artifact title
- After confirmation: SWR cache invalidated, redirect to empty explorer, tree refresh
- All standard queries already filter `deleted: false` — deleted artifacts no longer appear

---

### Step 10 — Explorer Tree: Navigation and Unsaved-Changes Guard (C2, C3) ✅

**C2 — Navigation:**
- Clicking a tree entry sets `?artifact=ID` in the URL → detail panel loads the artifact via SWR
- Clicking `+` in a group sets `?new=TYPE` → new artifact form
- **Unsaved-changes guard** (spec rule 7): if the form is dirty and the user navigates away (different artifact, + new, leave page), a `ConfirmDialog` appears — "Discard and switch" or "Cancel"
- `DirtyFormContext` — React context, reads/writes `isDirty` globally across `ArtifactForm`, `ExplorerTreeItem`, and `ExplorerTreeGroup`
- `ArtifactForm` sets `isDirty = true` on any field change, `isDirty = false` after a successful save or when switching to another artifact (via `useEffect` on `artifact.id`)

**C3 — Grouping:**
- 6 groups in canonical order: Persona → Hypothesis → Vision → Use Case → Story → Requirement
- Each group: collapsible, shows artifact count, `+` button on hover
- Empty groups show "No entries" (no visual noise)
- Status dot per item: green (Done), yellow (In Review), grey (Draft)

---

## Sprint 1 Complete ✅

All 10 steps of Sprint 1 are implemented.

---

## Progress: Sprint 2

### Step 1 — Create Relations (E1) ✅

**API:**
- `GET /api/projects/:id/artifacts/:aid/relations` — loads all relations (from and to this artifact), including linked artifact metadata
- `POST /api/projects/:id/artifacts/:aid/relations` — creates a new relation (duplicate check, self-reference check)
- `DELETE /api/projects/:id/artifacts/:aid/relations/:rid` — deletes relation (verifies it belongs to the artifact)

**Frontend:**
- `RelationList` — displays all links below the artifact form; each row with delete button and `ConfirmDialog`
- `RelationAddDialog` — modal for selecting relation type and target artifact
- `ExplorerDetail` — integrates `RelationList` below the form

**Shared:**
- `src/lib/validators/relation.js` — Zod schema for creating a relation

---

### Step 2 — Comments (G1, G2) ✅

**API:**
- `GET /api/projects/:id/artifacts/:aid/comments` — loads all comments chronologically (oldest first), including author data
- `POST /api/projects/:id/artifacts/:aid/comments` — adds a new comment (VIEWER+ may comment)

**Frontend:**
- `CommentList` — displays comment thread below relations; avatar initials, name, and timestamp per entry
- `CommentForm` — textarea with send button, optimistic update via SWR mutate
- `ExplorerDetail` — integrates `CommentList` after `RelationList`

**Shared:**
- `src/lib/validators/comment.js` — Zod schema (min 1, max 2000 characters)

---

### Step 3 — Role-Based Access Control (L1, L2) ✅

**Concept:** VIEWER = read access, EDITOR = edit, OWNER = project settings

**`ProjectRoleContext`** (`src/lib/ProjectRoleContext.js`):
- React context with `ProjectRoleProvider` + `useProjectRole()` hook
- `hasRole(userRole, requiredRole)` checks role hierarchy (VIEWER < EDITOR < OWNER)

**Frontend gating:**
| Component | VIEWER | EDITOR | OWNER |
|---|---|---|---|
| Settings button | hidden | hidden | visible |
| `+` button in tree | hidden | visible | visible |
| Status toggle + delete | hidden | visible | visible |
| Form fields | disabled | editable | editable |
| Save button | hidden | visible | visible |
| Add/remove relations | hidden | visible | visible |
| Comment | allowed | allowed | allowed |

**Backend:** Already implemented in `requireProjectAccess()` — all write endpoints require EDITOR+, project management requires OWNER.

---

## Sprint 2 Complete ✅

---

## Progress: Sprint 3

### Step 1 — AI Provider Adapter + Suggestions (F1–F5) ✅

**Backend:**
- `src/lib/ai/provider.js` — base interface `AiProvider`
- `src/lib/ai/claude-adapter.js` — Claude adapter (`claude-sonnet-4-6`), timeout handling
- `src/lib/ai/provider-factory.js` — `getAiProvider()` + `isAiAvailable()` (checks API key)
- `src/lib/ai/prompts/` — 6 prompt templates (one per artifact type), JSON output format
- `src/lib/ai/prompts/index.js` — `buildPrompt()` + `parseSuggestions()` with JSON parse fallback
- `POST /api/.../ai` — request suggestions, linked artifacts as context, AiSession logging (F4)

**Frontend:**
- `AiSuggestButton` — purple button in the form (edit mode only, EDITOR+ only); shows loading indicator
- `AiSuggestionPanel` — separate panel with all suggestions, "Accept all" button (F2, F3)
- `AiSuggestionItem` — individual suggestion with ✓ button; removed from panel after acceptance (F3)
- Guardrails (F5): AI never auto-applies changes; every suggestion requires explicit acceptance

**Configuration:**
- Set `AI_CLAUDE_API_KEY` in `.env` — without a key the button stays disabled (503)
- `@anthropic-ai/sdk` added to `serverExternalPackages` in `next.config.mjs`

---

### Step 2 — Version History (H1, H2, H3) ✅

**H1** — Versioning on save: already implemented in Sprint 1 — every PATCH automatically creates a new `ArtifactVersion`.

**API:**
- `GET /api/.../versions` — all versions (newest first) including author data and parsed fields
- `POST /api/.../versions/:vid` — restore version: resets artifact content and creates a new version

**Frontend (`VersionList`):**
- Collapsible section below comments
- Current version with blue "Current" badge
- Each version expandable → shows fields as preview
- Restore button (EDITOR+ only) with `ConfirmDialog`
- After restore: SWR cache for artifact, versions, and tree invalidated

---

### Step 3 — Progress View (I1, I2) ✅

**API:**
- `GET /api/projects/:id/progress` — aggregates stats per artifact type: `total`, `done`, `inReview`, `draft`, `progress%`, `missing` flag; plus overall stats (`overallProgress`, `missingTypes`)

**Frontend:**
- `ProgressOverview` — summary bar (overall progress %, count done, missing phases) + grid of phase cards
- `PhaseCard` — per artifact type: progress bar, status breakdown (dots in green/yellow/grey), orange warning for missing phases, CTA link to create
- `/projects/:id/progress` — server-rendered page for fast initial render
- "Progress" button (BarChart3 icon) in explorer header visible to all roles

---

## Sprint 3 Complete ✅

---

## Progress: Sprint 4

### Step 1 — Full-Text Search (K1) ✅

- `GET /api/projects/:id/search?q=&type=&status=&tag=` — LIKE search over title and `fields` JSON, combinable with type, status, and tag filters
- `SearchDialog` — command palette modal with 250ms debounce, keyboard navigation (↑↓↵Esc), snippet preview from field content
- `SearchButton` — opens dialog; global ⌘K/Ctrl+K shortcut
- Search button in explorer header visible to all roles

---

### Step 2 — Tags and Tag Filtering (K2, K3) ✅

- `GET/POST /api/projects/:id/tags` — manage project tags (upsert by name)
- `GET/POST/DELETE /api/projects/:id/artifacts/:aid/tags` — assign/remove tags
- `TagEditor` — inline tag chip editor in ArtifactHeader: dropdown with existing tags, "Create tag" option, remove via X
- Tag filter dropdown in SearchDialog (shown when project has tags)

---

### Step 3 — Status Filter in Explorer Tree (K3) ✅

- Filter bar at the top of the artifact tree: All / Draft / In Review / Done
- Client-side filter with no extra API call
- Active filter highlighted with a blue pill badge

---

### Step 4 — Board View with Drag & Drop (J1, J2) ✅

- `BoardCard` — draggable card using the native HTML5 Drag & Drop API
- `BoardColumn` — drop zone per status, visual highlight on drag-over, empty state
- `BoardView` — 3 columns (Draft / In Review / Done), optimistic status update via PATCH, type filter toolbar
- Clicking a card opens the artifact in the explorer (`/projects/:id?artifact=ID`)
- `/projects/:id/board` — board page with breadcrumb; board button in explorer header

---

### Step 5 — Error Boundaries and Hardening (L3) ✅

- `(dashboard)/error.js` — React error boundary for all dashboard pages with reset/back button
- `(dashboard)/not-found.js` — 404 page for unknown project/artifact IDs
- `app/not-found.js` — minimal root 404 for unknown top-level routes
- Backend validation (Zod), tenant isolation, and roles fully implemented

---

## Sprint 4 Complete ✅

## MVP Fully Implemented ✅

All P0 features from the spec are implemented:

| Sprint | Features |
|---|---|
| Sprint 1 | Auth (A1–A3), project management (B1–B4), explorer (C1–C3), artifact CRUD (D1–D5) |
| Sprint 2 | Relations (E1–E3), comments (G1–G2), roles (L1–L2) |
| Sprint 3 | AI suggestions (F1–F5), version history (H1–H3), progress view (I1–I2) |
| Sprint 4 | Search (K1), tags (K2), filters (K3), board view (J1–J2), error handling (L3) |

---

## Extension: Full Product Model

### Extension Step 1 — Admin-Only User Management ✅

**What was implemented:**
- Global role concept `systemRole` (`ADMIN` | `USER`) on the User model, separate from project roles
- User `status` (`ACTIVE` | `INACTIVE`) — soft deactivation instead of physical deletion
- Inactive users cannot log in (auth check in `authorize()`)
- Admin-only middleware (`requireAdmin`) protects all admin routes server-side

**New domain fields on User:**
- `firstName`, `lastName` — structured name
- `systemRole` — system-wide role (`ADMIN` / `USER`)
- `status` — account status (`ACTIVE` / `INACTIVE`)

**New API endpoints (admin-only):**
- `GET  /api/admin/users` — user list
- `POST /api/admin/users` — create user
- `GET  /api/admin/users/:id` — user detail
- `PATCH /api/admin/users/:id` — edit user (incl. password reset)
- `DELETE /api/admin/users/:id` — deactivate user (soft delete)

**New UI areas:**
- `/admin/users` — user list with status badges, activate/deactivate
- `/admin/users/new` — create user (first name, last name, email, password, role, status)
- `/admin/users/:id/edit` — edit user
- Sidebar: admin section visible only to admins (`Administration > User Management`)

**Known limitations:**
- No email flows (no password reset by email, no invitation logic)
- Self-service registration remains active (can optionally be disabled)
- No audit log for admin actions (planned for later steps)

---

### Extension Step 2 — Domain Model: 26 PRD Object Types ✅

**What was implemented:**
- 20 new artifact types (no DB migration needed — types stored as strings)
- Domain group structure (7 groups) instead of an alphabetical type list
- Explorer navigation with two-level structure: Group → Type → Artifacts
- Field definitions for all 26 types

**New domain objects:**

| Group | Types |
|---|---|
| Research | Market Analysis, Competitor, Research Finding, Problem Statement, Opportunity, Hypothesis |
| Audience | User Persona *(existing)*, Buyer Persona |
| Strategy | Product Vision *(existing)*, Value Proposition, Positioning, Business Model, KPI/OKR |
| Discovery & Design | Use Case *(existing)*, User Journey, Feature, Epic |
| Delivery | User Story *(existing)*, Functional Requirement *(existing)*, NFR, Acceptance Criteria, Dependency, Risk, Decision |
| Planning & Release | Roadmap Item, Release, Launch Task |
| Feedback & Iteration | Feedback Item, Iteration |

**New UI areas:**
- Explorer tree: two-level group navigation — collapsible group → collapsible type
- `ExplorerGroupSection` — new component for group headers with total count
- All new types immediately creatable and editable in the explorer (generic form)

**No API change needed** — existing artifact CRUD endpoints work for all types.

**Known limitations:**
- Type-specific field components (with specialized UX) not yet available for all new types — generic form used as fallback
- Progress view now shows all 26 types (can become long with many empty phases)

---

### Extension Step 3 — Generalized Relations + Traceability ✅

**What was implemented:**

**Smart relation suggestions:**
- `RELATION_SUGGESTIONS` in `constants.js` — map `[sourceType][targetType] → recommended relation type` for all 26 artifact types
- `RelationAddDialog` revised:
  - Target artifact selected first (better UX ordering)
  - Candidates grouped by domain group (Research / Audience / Strategy / …) via `<optgroup>`
  - Relation type auto-suggested once target is chosen; "(recommended)" hint shown
  - Manual override always possible

**New Traceability view:**
- `GET /api/projects/:id/traceability` — returns all artifacts + all relations (source direction only for efficiency)
- `TraceabilityView` component — grouped overview of all artifacts with their connections:
  - Summary bar: total / connected / isolated / relation count
  - Per group (7 domain groups): collapsible section with color coding
  - Per artifact: connections as colored badges with arrow direction, clickable → explorer
  - Isolated artifacts (no connections) visible but dimmed
- `/projects/:id/traceability` — new page, server-rendered
- New "Traceability" button (`GitBranch` icon) in explorer header

---

### Extension Step 7 — Review / Hardening ✅

**Critical bugfix — AI prompts for all 26 artifact types:**

This was the most severe remaining bug: all 20 new artifact types had **no prompt templates** — every AI suggestion request for a new type resulted in a 500 error ("No prompt builder for type: FEATURE").

**20 new prompt templates created** (`src/lib/ai/prompts/`):

| Group | New templates |
|---|---|
| Research | market-analysis, competitor, research-finding, problem-statement, opportunity, hypothesis |
| Audience | buyer-persona |
| Strategy | value-proposition, positioning, business-model, kpi-okr |
| Discovery | user-journey, feature, epic |
| Delivery | non-functional-requirement, acceptance-criteria, dependency, risk, decision |
| Planning | roadmap-item, release, launch-task |
| Feedback | feedback-item, iteration |

**Each template includes:**
- Product Manager role description
- Current field values in prompt context
- Exact JSON output format with the correct field keys
- Type-specific quality rules (e.g. OKR format, Given/When/Then, mitigation strategies)

**Upstream validation in AI route:**
- `hasPromptBuilder()` export in `prompts/index.js`
- AI route now checks the type **before** the provider call
- Returns 400 with a clear message instead of 500 for unknown types (safety net)

---

### Extension Step 6 — Improved Traceability ✅

**What was implemented:**

**Bugfix — SQLite query:**
- `traceability/page.js` was using `OR: [{ source: { projectId } }, { target: { projectId } }]` — the same nested filter pattern that caused SQLite hangs in the traceability API route
- Fix: two-step query (fetch artifact IDs first, then `sourceId: { in: [...] }`) — consistent with the API route

**Filter toolbar:**
- **Visibility filter** (All / Connected only / Isolated only) — clickable pills; summary bar numbers are also clickable and set the filter
- **Group filter** — colored pill buttons for all 7 domain groups (only shown when group has artifacts); toggle logic (click again = back to All)
- **Expand/Collapse All** — two buttons ("Expand all" / "Collapse all") control all group sections simultaneously via `forceOpen` prop

**Relation type visible in badge:**
- Connection badges now explicitly show the relation type ("Derived from:", "Validates:", "Depends on:") before the artifact title
- Direction arrow (← / →) still visible
- Type label of the linked artifact shown inline for better orientation

**Isolated artifacts:**
- Summary bar: isolated count in orange (when > 0) instead of grey — clickable as quick filter
- Group header: shows a separate "X isolated" badge when the group has isolated artifacts

---

### Extension Step 4 — Explorer / Navigation Improvements ✅

**Problem:** With 26 artifact types across 7 groups, the explorer tree became unwieldy — all type groups started expanded, even with 0 entries.

**What was implemented:**

**Explorer tree:**
- `ExplorerTreeGroup` — type groups with 0 artifacts now start **collapsed** (previously: always open → 26 "No entries" rows visible)
- `ExplorerGroupSection` — domain groups also start collapsed when empty
- Group headers with color-coded type accents (one color per group) and colored count badge
- `ARTIFACT_GROUP_COLORS` in `constants.js` — central color token schema for all 7 groups (bg, text, dot, border, header, badge); used consistently across explorer, progress, and traceability

**Progress view:**
- `ProgressOverview` rebuilt: instead of 26 type cards in a flat grid, cards are now **grouped by the 7 domain groups**
- Each group has a colored header with total artifact count and group-level progress bar (% done)
- Empty groups show "No entries" in the header rather than disappearing entirely

**Board view:**
- Type filter now only shows types that **actually have artifacts** (instead of all 26 as a flat button row)
- Canonical type order (via `ARTIFACT_GROUPS`) instead of alphabetical

**Traceability:**
- `TraceabilityView` now uses `ARTIFACT_GROUP_COLORS` from `constants.js` instead of local color maps — consistent coloring guaranteed

---

### Extension Step 5 — Detail Views and Editors for All Object Types ✅

**What was implemented:**

Dedicated, type-specific field components were created for all 20 new artifact types. Each type has a UX tailored to its domain context — with highlights, grid layouts, and structured input formats.

**New field components (20 types, 24 components total):**

| Group | Component | Highlight |
|---|---|---|
| Research | `MarketAnalysisFields` | Summary + market size + trends/sources grid |
| Research | `CompetitorFields` | Name + SWOT grid (strengths/weaknesses side by side) + positioning |
| Research | `ResearchFindingFields` | Insight + method/participants grid + implications |
| Research | `ProblemStatementFields` | Problem + context divider + impact/workaround grid |
| Research | `OpportunityFields` | Description + target audience + value/timing grid |
| Research | `HypothesisFields` | Structured card flow: "We believe → because → Test: → Confirmed when" with connecting arrows |
| Audience | `BuyerPersonaFields` | Name/role grid + profile divider + goals/pain points/buying criteria |
| Strategy | `ValuePropositionFields` | Highlighted blue statement box + target customer + benefits/differentiation grid |
| Strategy | `PositioningFields` | Highlighted purple statement box with template hint + segment/advantage/key message |
| Strategy | `BusinessModelFields` | Revenue/cost grid + channels/partners grid |
| Strategy | `KpiOkrFields` | Highlighted amber objective box + key results + metrics + period/owner grid |
| Discovery | `UserJourneyFields` | Actor/scenario grid + journey steps (large) + pain points/opportunities side by side |
| Discovery | `FeatureFields` | Description + benefit + scope divider + in-scope/out-of-scope grid + priority |
| Discovery | `EpicFields` | Description + goals + scope divider + scope + success criteria |
| Delivery | `NonFunctionalRequirementFields` | Description + category/metric grid + acceptance divider |
| Delivery | `AcceptanceCriteriaFields` | Highlighted teal Given/When/Then box (monospace) + preconditions + outcome |
| Delivery | `DependencyFields` | Description + from/type grid + consequences divider + impact + owner |
| Delivery | `RiskFields` | Description + probability/impact grid + mitigation divider + mitigation + owner |
| Delivery | `DecisionFields` | Context + highlighted indigo decision box + rationale + alternatives/consequences |
| Planning | `RoadmapItemFields` | Description + timeframe + context divider + features + rationale |
| Planning | `ReleaseFields` | Version/date grid + description + content divider + scope + release notes |
| Planning | `LaunchTaskFields` | Description + owner/date grid + checklist divider |
| Feedback | `FeedbackItemFields` | Source/sentiment grid + content + actions divider |
| Feedback | `IterationFields` | Description + learnings + next steps divider + improvements + next steps |

**Infrastructure:**
- `fields/index.js` — `FIELD_COMPONENTS` map fully extended to all 30 types (6 legacy + 24 new)
- `ArtifactForm` uses `FIELD_COMPONENTS[type]` — all types automatically rendered with their specialized form
- No generic fallback rendering needed

---

### Bugfix — Project Settings: Event Handler Prop Error ✅

**Problem:** The settings page `/projects/:id/settings` threw "Event handlers cannot be passed to Client Component props" on load. Cause: the Server Component `page.js` was passing a function (`onInvited`) directly to the Client Component `InviteMember`.

**Fix:**
- New Client Component `MembersSection` created as a wrapper — holds the SWR `mutate` call internally
- `page.js` only passes serializable props (`projectId`, `isOwner`) to `MembersSection`
- `MembersSection` invalidates the SWR cache (`/api/projects/:id/members`) itself after a successful invitation

---

### Extension Step 8 — Multilingual Support (DE / EN) ✅

**Goal:** Admins manage available languages; users choose their preferred display language. No URL prefix — locale is set via cookie.

**Data model:**
- New `Language` model: `code`, `name`, `nativeName`, `isActive`, `isDefault`
- `User.preferredLanguage` — stored language preference per user
- Seed: German (`de`, default) + English (`en`)

**Infrastructure (next-intl):**
- `next-intl` installed and integrated via `createNextIntlPlugin` in `next.config.mjs`
- `src/i18n/request.js` — reads `NEXT_LOCALE` cookie, falls back to `de`
- `src/app/layout.js` — `NextIntlClientProvider` wraps the entire app
- `messages/de.json` + `messages/en.json` — translation keys for nav, auth, common, admin, projects, artifact status

**Admin — Language management (`/admin/languages`):**
- Table of all languages with status badge and default marker
- Actions per language: set as default (⭐), activate/deactivate (👁), delete (🗑)
- Guard: default language cannot be deactivated or deleted
- Form for adding new languages (code / English name / native name)
- API: `GET/POST /api/admin/languages`, `PATCH/DELETE /api/admin/languages/[code]`

**User — Language selection:**
- `LanguagePicker` in sidebar footer — popover with all active languages, checkmark on current
- Language switch: `PATCH /api/users/me/language` → writes `User.preferredLanguage` to DB + sets `NEXT_LOCALE` cookie (30 days)
- Takes effect immediately via `router.refresh()` without a full reload

**Translations applied:**
- `Sidebar` — all nav labels via `useTranslations()`
- `LogoutButton` — "Abmelden" / "Log out"

---

### Extension Step 9 — Database Configuration UI ✅

**Goal:** Admins can configure the database connection for production deployment — directly in the UI, without manually editing files.

**Admin page (`/admin/database`):**
- **DB type selector:** SQLite / PostgreSQL / MariaDB (card-style picker with descriptions)
- **SQLite:** file path input (relative or absolute)
- **PostgreSQL / MariaDB:** host, port, database name, username, password — or toggle to enter a raw connection URL directly
- **`DATABASE_URL` preview** — generated live, password masked, copy button
- **Test connection** — establishes a real connection (`pg` / `mysql2`, 5s timeout), reports server version on success
- **Save configuration** — writes `DATABASE_URL` to `.env.local` (overrides `.env` without modifying it)
- **Post-save checklist** — collapsible, with copy buttons for all required follow-up steps:
  1. Update `prisma/schema.prisma` provider
  2. Install adapter (`@prisma/adapter-pg` / `@prisma/adapter-mysql`)
  3. `npx prisma migrate deploy`
  4. Restart the server

**New packages:** `pg`, `mysql2`

**New utility:** `src/lib/env-config.js` — parse and write `.env` files, URL builder/parser, DB type detection

**API:** `GET/PATCH /api/admin/database`, `POST /api/admin/database/test`

> **Limitation:** Switching databases still requires a server restart and manual Prisma schema update. The UI covers configuration, not automatic migration.

---

### Extension Step 10 — AI Provider Configuration UI ✅

**Goal:** Admins select the AI provider, model, and API key directly in the UI. Changes take effect **immediately without a restart** — configuration is stored in the database and loaded dynamically on every AI request.

**Data model:**
- New `AiConfig` model (singleton, `id = "singleton"`): `provider`, `model`, `apiKey`, `timeoutMs`, `maxTokens`
- Provider factory reads from DB first, falls back to environment variables

**Admin page (`/admin/ai`):**
- **Provider selection:** Anthropic Claude / OpenAI / Disabled
- **Model selection** (radio buttons with recommendation badges):
  - Claude: Opus 4.6 (Powerful), **Sonnet 4.6 (Recommended)**, Haiku 4.5 (Fast)
  - OpenAI: GPT-4o (Powerful), **GPT-4o mini (Recommended)**, GPT-4 Turbo
- **API key input** with show/hide toggle; leave empty = keep existing key; "Key stored" indicator
- **Advanced settings** (collapsible): timeout (ms) and max tokens
- **Test connection** — real mini-call (max 10 tokens) to verify the key
- **Save** — writes to DB, takes effect immediately for all subsequent AI requests
- **When disabled** — info banner; AI button hidden for all users (503 response)

**Architecture changes:**
- `provider-factory.js` — `getAiConfig()` (async, reads from DB), `isAiAvailable(config)`, `getAiProvider(config)` — all functions now accept a config object
- `claude-adapter.js` — accepts config object instead of environment variables
- `openai-adapter.js` — newly implemented (OpenAI SDK), analogous to Claude adapter
- AI route `artifacts/:aid/ai` — calls `getAiConfig()` and passes config to provider
- `AiSession` logging uses dynamic provider name from config

**New packages:** `openai`

**API:** `GET/PATCH /api/admin/ai`, `POST /api/admin/ai/test`

---

### Extension Step 11 — PRD Gap Analysis: 9 Additional Artifact Types ✅

**Goal:** Fill structural gaps in the domain model so a complete PRD can be represented — foundations, governance, measurement, and quality assurance.

**New "Foundations" group** (slate color, first in explorer):

| Type | Field component | Highlight |
|---|---|---|
| Goals & Non-Goals | `GoalsNonGoalsFields` | Green "In Scope" box + red "Out of Scope" box + rationale |
| Stakeholder | `StakeholderFields` | RACI radio card selector (Responsible / Accountable / Consulted / Informed) + name/role grid |
| Assumption | `AssumptionFields` | Amber highlighted assumption box + rationale + impact if wrong + validation approach |
| Constraint | `ConstraintFields` | Orange highlighted constraint box + type selector (Technical / Budget / Regulatory / Time / Resource) + impact |
| Open Question | `OpenQuestionFields` | Yellow question box + context + owner/due date grid + resolution field |

**Extended existing groups:**

| Group | Type | Highlight |
|---|---|---|
| Strategy | Measurement Plan | Objective + key metrics + baseline/target + instrumentation + review cadence |
| Delivery | Test Plan | Scope + approach + entry/exit criteria grid + test risks + owner |
| Delivery | Compliance Requirement | Red highlighted requirement box + regulation/deadline grid + scope + implementation |
| Planning & Release | Milestone | Description + target date/owner grid + success criteria + status pill selector |

**Infrastructure:**
- `ARTIFACT_GROUPS` extended with "foundations" as the first group
- `ARTIFACT_GROUP_COLORS` — slate color token set for foundations group
- `RELATION_SUGGESTIONS` extended to connect all 9 new types into the artifact graph
- 9 new AI prompt templates (`goals-non-goals.js`, `stakeholder.js`, `assumption.js`, `constraint.js`, `open-question.js`, `measurement-plan.js`, `test-plan.js`, `compliance-requirement.js`, `milestone.js`)
- `fields/index.js` and `prompts/index.js` updated — all new types fully registered

---

### Bugfix — FieldHelpers dual API + PRD question 5 coverage ✅

**FieldHelpers API bug (critical):**

The 9 new Foundations field components (GoalsNonGoals, Stakeholder, Assumption, Constraint, OpenQuestion, MeasurementPlan, Milestone, TestPlan, ComplianceRequirement) used a value-based calling convention (`value=`, `onChange(v)`, inline `label=`) that `FieldHelpers` didn't support. All new fields rendered blank and edits were silently dropped.

`FieldHelpers.jsx` now supports both conventions side by side:

| Convention | When used | Pattern |
|---|---|---|
| A — key-based | Original 6 types + most Step 5 types | `<FieldTextarea fieldKey="x" fields={fields} onChange={onChange} />` |
| B — value-based | 9 new Foundations types | `<FieldTextarea label="X" value={fields.x} onChange={(v) => onChange("x", v)} />` |

`FieldTextarea` and `FieldInput` detect which convention is active via the presence of `fieldKey` and route accordingly. The `label` prop renders a `FieldLabel` inline when provided.

**PRD coverage — Question 5:**

A gap analysis against the 10 minimum PRD questions revealed one missing field: *"Why is the current solution insufficient?"* The `Problem Statement` artifact had `currentSolution` (how users solve it today) but no field for the gap that justifies building something new.

- New field `whyInsufficient` added to `ProblemStatementFields`
- AI prompt for `problem-statement` updated to include the field and guide the model to articulate the gap (too slow / expensive / unreliable / doesn't scale / poor UX / risky)

**All 10 PRD starter questions are now covered:**

| # | Question | Artifact / field |
|---|---|---|
| 1 | What is the product idea? | Product Vision → `oneLiner` |
| 2 | What problem does it solve? | Problem Statement → `problem` |
| 3 | Who has this problem? | User Persona + Buyer Persona |
| 4 | How do users solve it today? | Problem Statement → `currentSolution` |
| 5 | Why is the current solution insufficient? | Problem Statement → `whyInsufficient` |
| 6 | What is the desired outcome? | Goals & Non-Goals → `goals` |
| 7 | What is the first use case? | Use Case |
| 8 | Must-have features for v1? | Feature → `priority` + Goals & Non-Goals |
| 9 | What is out of scope for v1? | Goals & Non-Goals → `nonGoals` |
| 10 | How will success be measured? | KPI/OKR + Measurement Plan |

**German → English label translation:**

The original 4 field components still had German UI labels:
- `UserPersonaFields` — Name, Goals, Pain points, Context/Background
- `ProblemStatementFields` — all labels
- `ProductVisionFields` — One-liner, Target users, Value proposition
- `FeatureFields` — Description, User value, In/Out of scope, Priority

---

### Extension Step 12 — Traceability View Enhancements ✅

**Goal:** Make the traceability view actionable — surface gaps in the artifact graph and let users drill into specific relation types and statuses.

**Summary bar:**
- New **domain coverage** stat — shows what % of all 35 artifact types have at least one instance in the project, with a color-coded progress bar (orange → blue → green at 100%)

**Filter toolbar** (3 rows):
- Row 1: All / Linked / Isolated (unchanged)
- Row 2: **Status filter** — All statuses / Draft / In Review / Done
- Row 3: **Relation type filter** — All / Derives From (n) / Depends On (n) / Relates To (n) / Validates (n); only shows types that exist in the project, with counts

**Per-group improvements:**
- **Coverage bar** in each group header — thin bar showing what % of the group's artifact types have at least one artifact, with color-coded threshold (green ≥ 100%, blue ≥ 50%, orange < 50%)
- **Gap detection (missing types)** — collapsible section at the bottom of each group listing which types are absent, with direct "+ [Type name]" links that open the Explorer pre-set to create that type
- Empty groups show a dashed placeholder with a "Create first" call to action instead of being hidden

**Connection badges:**
- Relation type filter applies to the badge list — per-artifact row shows only connections of the selected type; shows a note if connections exist but none match the filter

---

### Extension Step 14 — Interactive Artifact Graph ✅

**Goal:** Make artifact relations a first-class visual feature — a full interactive node graph where artifacts are nodes, relations are directed edges, and new connections can be created by dragging directly on the canvas.

**New dependency:** `@xyflow/react` (React Flow v12)

**API:**
- `GET /api/projects/:id/graph` — returns `{ artifacts: [...], relations: [...] }` using a two-step SQLite-safe query (no nested OR)

**Graph page (`/projects/:id/graph`):**
- Server-rendered page, accessible via the **Graph** button (network icon) in the explorer header
- Full-viewport canvas with pan, zoom (0.15×–2×), and fit-view on load
- Header with breadcrumb back to the Explorer

**`ArtifactGraph` client component:**
- All artifacts rendered as custom nodes, laid out in **columns by domain group** (one column per group, artifacts stacked vertically — empty groups skipped)
- All relations rendered as directed smooth-step edges, color-coded by type:
  - Derived from → blue
  - Depends on → orange (animated dashes)
  - Related to → gray
  - Validates → green
- **MiniMap** for overview navigation
- **Controls** (zoom in/out/fit) in bottom-left
- **Legend panel** (top-right) — relation type colors + interaction hints
- **Group color legend** (bottom-left) — one dot per domain group

**Interaction model:**
- **Double-click** a node → opens the artifact in the Explorer (`/projects/:id?artifact=ID`)
- **Drag** from a node's right handle to another node's left handle → opens `GraphRelationDialog`
- **Pan/zoom** — standard touch and mouse gestures

**`ArtifactNode` custom node:**
- Group-colored header bar (matches Explorer, Progress, Traceability colors)
- Artifact type label (uppercase, small)
- Artifact title (bold, 2-line clamp)
- Status dot + label
- Source handle (right) and target handle (left) for drag-connect

**`GraphRelationDialog`:**
- Shows source artifact → target artifact with type labels
- Relation type dropdown, pre-populated with a smart suggestion (same `RELATION_SUGGESTIONS` map used in the Explorer)
- Recommended type marked
- On confirm: POSTs to the existing relations API; new edge appears on canvas immediately without a full refetch
- On duplicate or error: inline error message

**Files added/changed:**
- `src/app/api/projects/[projectId]/graph/route.js` (new)
- `src/app/(dashboard)/projects/[projectId]/graph/page.js` (new)
- `src/components/graph/ArtifactGraph.jsx` (new)
- `src/components/graph/ArtifactNode.jsx` (new)
- `src/components/graph/GraphRelationDialog.jsx` (new)
- `src/app/(dashboard)/projects/[projectId]/page.js` — Graph button added to header

---

### Bug-fix Pass — Code Review Findings ✅

A full codebase review identified and fixed 9 bugs across all severity levels.

**Critical fixes:**

| # | File | Bug | Fix |
|---|---|---|---|
| 1 | `StarterContextPanel.jsx` | Rules of Hooks violation — `useSWR` was called after a conditional `return null`, causing React to throw when the artifact type changed | Moved hook before early return; passes `null` SWR key when type has no mapping |
| 2 | `ArtifactForm.jsx` | Status de-sync — `ArtifactHeader`'s quick-cycle button PATCHes status directly; `ArtifactForm`'s local state only resets on artifact ID change, so saving the form could overwrite the toggle | Status `<Select>` hidden in edit mode; `status` removed from PATCH body — `ArtifactHeader` exclusively owns status in edit mode |

**High fixes (silent failures):**

| # | File | Bug | Fix |
|---|---|---|---|
| 3 | `ArtifactHeader.jsx` | `handleDelete` never checked `res.ok` — on 403/500 the UI still redirected and cleared the artifact | Now checks response; only redirects on success; shows error banner on failure |
| 4 | `ArtifactHeader.jsx` | `handleStatusChange` had no `else` branch — API errors were silently discarded with no user feedback | Added error state, error banner, and `catch` for network errors |
| 5 | `VersionList.jsx` | `handleRestore` closed the confirm dialog on both success and failure — user had no way to know a restore failed | Error shown inline; dialog only closes on success |

**Medium fixes:**

| # | File | Bug | Fix |
|---|---|---|---|
| 6 | `starter/route.js` | `JSON.parse(project.prdStarter)` was unguarded — corrupted DB data would throw a 500 with no proper error shape | Wrapped in try/catch; falls back to `STARTER_DEFAULTS` |
| 7 | `project-access.js` | Archived projects were read-only in the UI but fully writable via the API — `project.status` was fetched but never checked | Write operations on `ARCHIVED` projects now return 403 |
| 8 | `artifacts/[artifactId]/route.js` | `GET` called `requireArtifactAccess` (one DB fetch) then immediately did a second `findUnique` for the same row | GET now returns the artifact already fetched by `requireArtifactAccess` |
| 9 | `tags/route.js` | `DELETE /artifact/tags` skipped `requireArtifactAccess` — project membership was checked but not artifact ownership; duplicate import | Added artifact access check; merged duplicate import |

**Low fixes:**

| # | File | Bug | Fix |
|---|---|---|---|
| 10 | `TraceabilityView.jsx` | Connection badges used array index as React key — unstable when filter order changes | Replaced with stable key `${direction}-${artifact.id}-${relationType}` |

---

### Extension Step 13 — PRD Starter (10-Question Onboarding) ✅

**Goal:** Capture the minimum information needed to start a PRD at project creation — 10 structured questions — and surface relevant answers inline while editing each artifact, so high-level decisions stay consistent with detailed content.

**Data model:**
- `Project.prdStarter String?` — the 10 starter answers stored as a JSON string
- Migration: `prisma/migrations/20260427172426_add_prd_starter`

**API:**
- `GET  /api/projects/:id/starter` — returns parsed answers (VIEWER+), falls back to empty defaults if not filled in yet
- `PATCH /api/projects/:id/starter` — saves 10 known keys, strips unknown keys (EDITOR+)

**Starter page (`/projects/:id/starter`):**
- Server-rendered page; accessible via the "Starter" button (Rocket icon) in the explorer header for all roles
- `StarterForm` client component:
  - 10 questions with label, hint text, and a multi-line textarea per question
  - Completion bar: X/10 answered, with CheckCircle2 / Circle icon per question
  - Each question shows which artifact types use that answer as **colored type badges** (existing artifacts) or **dashed "+ Create" links** (missing artifacts)
  - Save button with "✓ Saved" confirmation; form fields disabled for VIEWERs

**Project creation flow:**
- After creating a new project, `ProjectForm` now redirects to `/projects/:id/starter` instead of the explorer — so users fill in the 10 questions before creating their first artifact

**Inline context panel (`StarterContextPanel`):**
- Thin collapsible blue panel shown above the artifact form when editing or creating an artifact
- Fetches starter answers via SWR (cached, no extra round-trip after first load)
- Shows only the answers relevant to the current artifact type (e.g. `productIdea` for Product Vision, `problemSolved + currentSolution + whyInsufficient` for Problem Statement)
- If the relevant answers are empty, shows a "Complete the starter →" prompt with a link
- Renders nothing when the artifact type has no starter mapping — zero noise

**Starter → artifact mapping (`src/lib/starterContext.js`):**

| Artifact type | Starter questions shown |
|---|---|
| Product Vision | What is the product idea? |
| Problem Statement | What problem does it solve? + How do users solve it today? + Why insufficient? |
| User Persona | Who has this problem? |
| Buyer Persona | Who has this problem? |
| Goals & Non-Goals | What is the desired outcome? + What is out of scope? |
| Use Case | What is the first use case? |
| Feature | Must-have features for v1? + What is out of scope? |
| Epic | Must-have features for v1? |
| KPI/OKR | How will success be measured? |
| Measurement Plan | How will success be measured? |

**Bugfixes shipped with this step:**

*Session expiry on reseed:*
- Seed users now have **stable fixed IDs** (`seed-user-admin`, `seed-user-alice`, `seed-user-bob`) so JWT sessions remain valid after a reseed — no forced logout on every `npm run db:seed`

*Stale JWT → 500 instead of 401:*
- `requireAuth()` now verifies the session user still exists in the DB after reading the JWT
- If the user ID is not found (stale token after a DB reset), a clean 401 "Session expired — please log in again" is returned instead of a FK constraint violation crashing the request

*PrismaClientValidationError after schema change:*
- Root cause: `prisma migrate dev` runs migrations but does not always regenerate the client
- Fix: `npx prisma generate` must be run explicitly after every schema change — documented in dev workflow

---

### Extension Step 15 — Document Import with AI Pre-fill ✅

**Goal:** Let users upload existing PRDs, specs, or any project documents and have the AI automatically extract structured artifacts from the content — reducing the cold-start problem for new projects.

**New dependencies:** `pdf-parse` (PDF text extraction), `mammoth` (DOCX text extraction). Both added to `serverExternalPackages` in `next.config.mjs` to prevent bundling.

**User flow:**
1. Click **Import** (upload icon) in the project header — visible to Editors and Owners only
2. Upload up to 5 files (PDF / DOCX / TXT / MD, max 10 MB each) via drag-and-drop or file picker
3. Click **Mit KI analysieren** — server extracts text, calls AI, returns proposed artifacts
4. Review the proposal list: expand any card to preview field content, check/uncheck individual artifacts
5. Click **X Artefakte erstellen** — all selected artifacts are created in one bulk transaction and the user is redirected to the Explorer

**Extractable artifact types (13):**
`PRODUCT_VISION`, `PROBLEM_STATEMENT`, `GOALS_NON_GOALS`, `USER_PERSONA`, `BUYER_PERSONA`, `STAKEHOLDER`, `ASSUMPTION`, `MARKET_ANALYSIS`, `COMPETITOR`, `VALUE_PROPOSITION`, `KPI_OKR`, `USE_CASE`, `FEATURE`

**API:**
- `POST /api/projects/:id/import` — accepts `multipart/form-data` with `files[]`; extracts text per file type; calls AI with a structured extraction prompt; returns `{ proposals: [{ type, title, fields }] }` — **does not save anything**
- `POST /api/projects/:id/artifacts/bulk` — accepts `{ artifacts: [...] }`; creates all in a single Prisma transaction with version records; max 50 per call

**AI extraction layer (`src/lib/ai/document-extractor.js`):**
- `buildExtractionPrompt(text)` — constructs a prompt with type schemas, field descriptions, and output format instructions; truncates input at 20 000 chars to stay within context limits
- `parseExtractionResponse(text)` — extracts the JSON code block from the AI reply, validates each proposal against the type schema, sanitises field keys, caps title length at 80 chars
- All adapters (Claude + OpenAI) gained an `extractFromDocument(prompt)` method via the base `AiProvider` interface

**Files added/changed:**
- `src/lib/ai/document-extractor.js` (new)
- `src/lib/ai/provider.js` — `extractFromDocument()` added to base interface
- `src/lib/ai/claude-adapter.js` — `extractFromDocument()` implemented (4096 max tokens)
- `src/lib/ai/openai-adapter.js` — `extractFromDocument()` implemented
- `src/app/api/projects/[projectId]/import/route.js` (new)
- `src/app/api/projects/[projectId]/artifacts/bulk/route.js` (new)
- `src/components/import/DocumentImport.jsx` (new)
- `src/app/(dashboard)/projects/[projectId]/import/page.js` (new)
- `src/app/(dashboard)/projects/[projectId]/page.js` — Import button added
- `next.config.mjs` — `pdf-parse` and `mammoth` added to `serverExternalPackages`
- `USER_MANUAL.md` — Section 14: Document Import added (v1.1)

---

### Extension Step 16 — Formal Relation Pickers (ArtifactRefField) ✅

Key free-text fields that asked "who is the target user?" were replaced with live relation pickers that create formal `Relation` records in the database — so persona links appear automatically in the artifact graph, traceability view, and relation badges.

**New component:** `src/components/artifacts/fields/ArtifactRefField.jsx`
- Fetches existing relations + all project artifacts via SWR
- Renders linked items as colored chips with × remove button
- Dropdown filtered to the specified `targetTypes`; creates/deletes Relation records via the existing API

**Updated field components:**

| Component | Field replaced | Linked types |
|---|---|---|
| `ProductVisionFields` | `targetUsers` textarea | USER_PERSONA, BUYER_PERSONA |
| `ProductVisionFields` | `valueProposition` textarea | VALUE_PROPOSITION |
| `UseCaseFields` | `actor` input | USER_PERSONA, BUYER_PERSONA |
| `ValuePropositionFields` | `targetCustomer` input | USER_PERSONA, BUYER_PERSONA |
| `UserStoryFields` | `role` row | USER_PERSONA, BUYER_PERSONA |
| `UserJourneyFields` | `actor` input | USER_PERSONA, BUYER_PERSONA |
| `OpportunityFields` | `targetAudience` input | USER_PERSONA, BUYER_PERSONA |
| `PositioningFields` | `targetSegment` input | USER_PERSONA, BUYER_PERSONA |

---

### Extension Step 17 — UX Polish Pass ✅

- **Hydration fix:** `ExplorerTreeGroup` outer toggle changed from `<button>` to `<div role="button" tabIndex={0}>` — the `<button>` inside `<button>` HTML violation caused a React hydration error in the browser
- **Error states (UX-6):** `RelationList`, `AiSuggestButton`, `InviteMember`, `MemberList` all standardised to `bg-red-50 border border-red-200 text-red-700` boxes
- **Success feedback (UX-7):** `InviteMember` + `MemberList` show `CheckCircle2` + green banner after successful operations
- **Spinner standardisation (UX-8):** `Loader2 animate-spin` usages replaced with `<Spinner>` component throughout
- **DocumentImport rejection feedback (UX-9):** files over 10 MB or exceeding the 5-file limit now show a visible warning banner

---

### Extension Step 18 — Member Management: Owner-Only Controls ✅

Non-owners previously saw the role dropdown and remove button in project settings — clicking either resulted in a 403 error. Fixed by threading `isOwner` from the settings page down through `MembersSection` → `MemberList`: non-owners see a plain role label. `InviteMember` rewritten to use shared `Input`/`Select`/`Button` components.

---

### Extension Step 19 — Account Self-Service ✅

**API:**
- `GET/PATCH /api/users/me` — read and update display name
- `POST /api/users/me/password` — verify current password (bcrypt), hash and save new password; returns field-level error on mismatch

**UI:**
- `/account` — two-section form: Profile (name + disabled email) and Change Password (current / new / confirm with client-side equality check)
- Sidebar footer — account link showing user name or email, with active-state highlight

---

### Extension Step 20 — Artifact Export (JSON + CSV) ✅

**API:** `GET /api/projects/:id/export?format=json|csv`
- **JSON:** full nested structure `{ project, artifacts: [...with fields...] }`
- **CSV:** fixed columns (id, type, type_label, title, status, createdAt, updatedAt, fields) where `fields` is a JSON string

**UI:** `ExportSection` component in project settings — two buttons with per-format loading states; uses fetch → blob → `createObjectURL` → anchor click to trigger the browser download.

---

### Extension Step 21 — Landing Page Rewrite ✅

All five public pages replaced with PM Copilot-specific content. Root `/` now shows the full landing page for unauthenticated visitors (authenticated users redirect to `/projects`). `SITE` and `NAV_LINKS` constants added — Navbar and Footer were importing them but they didn't exist, so both components were broken. Pages updated: Hero, FeatureHighlights, Testimonials, LogoBar, CtaBanner, `/features`, `/pricing`, `/about`, `/contact`.

---

### Extension Step 22 — Unit Test Suite (Vitest) ✅

**99 tests, 10 files, all passing.** First test coverage in the project.

**Setup:** `vitest` + `@vitest/coverage-v8` + `@testing-library/react` + `jsdom`. Global `next/server` mock in `src/__tests__/setup.js`. Path alias `@/` wired via `vitest.config.js`.

**Coverage:** all Zod validators, `errors.js`, `validateBody`/`validateParams`, `requireAuth` / `requireAdmin` / `requireProjectAccess` / `requireArtifactAccess` middleware (Prisma and next-auth mocked with `vi.mock`), and `parseExtractionResponse` / `buildExtractionPrompt` from the document extractor.

**Commands:** `npm test` · `npm run test:watch` · `npm run test:coverage`

---

### Extension Step 23 — Unified Project Navigation (ProjectNavBar) ✅

Replaced 7 duplicated inline `<header>` blocks across all project sub-pages with a single shared `ProjectNavBar` client component (`src/components/layout/ProjectNavBar.jsx`).

**Two-row layout:**
- **Row 1** — `Projekte / {projectName}` breadcrumb (left); Search, Importieren (non-VIEWER), Einstellungen (OWNER) utility actions (right)
- **Row 2** — Tab strip: Explorer · Starter · Board · Fortschritt · Graph · Traceability with `border-b-2 border-blue-600` active-state highlight driven by `usePathname()`

**Pages updated:** Explorer, Board, Fortschritt, Graph, Traceability, Starter, Import. Also fixed Starter breadcrumb "Projects" → "Projekte".

---

### UX Audit Pass — Items UX-0 through UX-9 ✅

All nine actionable items from the 2026-05-04 UX audit resolved. Key changes per item:

- **UX-0** — Shared `ProjectNavBar` with tab strip and active-state (see Step 23)
- **UX-1** — Verified: all label maps (`ARTIFACT_TYPE_LABELS`, `ARTIFACT_STATUS_LABELS`, `RELATION_TYPE_LABELS`), `TraceabilityView`, `ArtifactGraph`, `GraphRelationDialog` are fully German. No English visible in the authenticated app.
- **UX-4** — `DocumentImport` proposal checkboxes converted to native `<input type="checkbox" className="sr-only">` inside `<label>` with visual icon; drop zone and file remove buttons have `aria-label`; all progress bars have full ARIA (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- **UX-5** — `ArtifactNode` source handle is blue with `cursor: "crosshair"`; target handle has `cursor: "cell"`; both have German `title` tooltips; legend panel explains the drag-to-connect gesture
- **UX-2/3/6/7/8/9** — Previously completed (admin components, ConfirmDialog, error boxes, success banners, Spinner, file rejection warnings)

---

### UX Audit Pass — Items UX-10 through UX-16 ✅

Remaining audit items resolved:

- **UX-10** — Shared `ProjectPageSkeleton` component (`src/components/layout/ProjectPageSkeleton.jsx`): animated two-row skeleton (breadcrumb row + tab-strip row) matching the ProjectNavBar layout, plus a centered spinner. All four sub-page `loading.js` files (board, progress, graph, traceability) now use it.
- **UX-11** — StarterContextPanel already had `transition-all duration-200`, text labels, and `aria-expanded`; no changes needed.
- **UX-12** — Delete dialog description now tells users to check version history before deleting instead of the misleading "nicht rückgängig über die Benutzeroberfläche" phrasing.
- **UX-13** — `StatusPipeline` component in `ArtifactHeader`: three states shown inline with colored dots — current step blue + bold, completed steps green, upcoming steps gray. Cycle direction is now always visible at a glance.
- **UX-14** — TraceabilityView empty-group CTA unified: "+ Erstes anlegen" → "+ Hinzufügen" (matches PhaseCard).
- **UX-15** — Already standardised (`disabled:opacity-50` across Button, Input, Select).
- **UX-16** — `rounded-md` → `rounded-lg` on RelationList and VersionList action buttons. `rounded-xl` for cards and dialogs is intentional.

All 17 items (UX-0 through UX-16) are now closed.

---

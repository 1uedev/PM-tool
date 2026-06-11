# AI Architecture & Process Documentation

> How PM Copilot uses AI, end to end — documented from the implementation as of 2026-06-11.
> Covers: provider abstraction, the two AI features (field suggestions, document import),
> guardrails, logging, configuration, and an evaluation with an improvement roadmap.

---

## 1. Overview

PM Copilot uses AI in exactly **two user-facing features**, plus an admin configuration area:

| Feature | Entry point | API | What the AI does |
|---|---|---|---|
| **Field suggestions** | „KI-Vorschläge" button in the artifact form | `POST /api/projects/:id/artifacts/:aid/ai` | Improves/completes the fields of **one existing artifact**, using linked artifacts as context |
| **Document import** | `/projects/:id/import` upload page | `POST /api/projects/:id/import` | Reads uploaded documents (PDF/DOCX/TXT/MD) and **proposes new artifacts + relations** for review |
| Admin: AI settings | `/admin/ai` | `GET/PATCH /api/admin/ai`, `POST /api/admin/ai/test` | Configure provider/model/key, run a live connection test |

The AI **never writes to the database on its own**. Every output is a proposal that a human
explicitly accepts (guardrail F5, see §6).

---

## 2. Provider abstraction (adapter pattern)

```
lib/ai/
├── provider.js           # AiProvider base class (interface)
├── provider-factory.js   # config resolution + adapter selection
├── claude-adapter.js     # Anthropic SDK
├── openai-adapter.js     # OpenAI SDK
├── prompts/              # 39 per-artifact-type prompt templates + parser
└── document-extractor.js # extraction prompt, parser, chunking, merging
```

Every adapter implements three methods:

| Method | Used by | max_tokens | Timeout |
|---|---|---|---|
| `suggest(artifact, context)` | field suggestions | from config (default 2048) | from config (default 30 s) |
| `extractFromDocument(prompt)` | document import | 4096 (hard-coded) | from config |
| `testConnection()` | admin test button | 10 | 10 s (hard-coded) |

### Configuration resolution (`getAiConfig()`)

1. **DB first:** the `AiConfig` singleton row (`provider`, `model`, `apiKey`, `timeoutMs`, `maxTokens`)
   maintained via `/admin/ai`. The API key is stored **AES-256-GCM-encrypted** (`lib/crypto.js`,
   key derived from `CONFIG_SECRET`, fallback `NEXTAUTH_SECRET`) and decrypted on read.
2. **Env fallback** (initial setup / CI): `AI_PROVIDER`, `AI_CLAUDE_API_KEY` / `AI_OPENAI_API_KEY`,
   `AI_TIMEOUT_MS`, `AI_MAX_TOKENS`. Default models: `claude-sonnet-4-6` (Claude) / `gpt-5.4` (OpenAI).
3. `isAiAvailable(config)` is false when provider is `"disabled"` or no key is set —
   AI routes then return 503 and the UI buttons surface the error instead of crashing.

---

## 3. Feature 1 — Field suggestions (per artifact)

### Request flow

```
ArtifactForm (edit mode, EDITOR+)
  └─ AiSuggestButton ──POST──▶ /api/projects/:id/artifacts/:aid/ai
       guards: requireAuth → project role EDITOR → artifact tenant check
       rate limit: 30 requests/hour per user (429 + retryAfterSec)
       │
       ├─ 1. load artifact incl. relationsFrom/relationsTo (with target/source fields)
       ├─ 2. build context string: one line per related artifact
       │       "[TYPE] Title: fieldValue | fieldValue | …"
       ├─ 3. buildPrompt(type, fields, context)   ← per-type template
       ├─ 4. provider.suggest(...)                ← single LLM call
       ├─ 5. parseSuggestions(text, type)         ← JSON → { fields } or { raw }
       └─ 6. log AiSession (success AND failure), return { fields|raw, durationMs }
```

### Prompt templates

One builder per artifact type in `lib/ai/prompts/` — **39 types** registered in
`prompts/index.js` (`PROMPT_BUILDERS`). All templates follow the same pattern (German):

- role framing („Du bist ein erfahrener Product Manager…")
- the artifact's current field values (empty fields marked `(leer)`)
- optional project context from related artifacts
- a strict JSON skeleton matching exactly the type's field schema
- type-specific quality rules + „kein Text außerhalb des JSON"

Types without a registered builder get an early, clear 400 from the route
(`hasPromptBuilder` check) instead of a 500.

### Response parsing (`parseSuggestions`)

- extracts the first `{ … }` block (models may wrap JSON in markdown fences)
- coerces every value to a string
- **on parse failure it does not error** — returns `{ raw: text }` and the UI shows the
  raw text in the suggestion panel (degraded but usable)

### UI behavior (the guardrail in practice)

`AiSuggestionPanel` renders the suggestions in a **separate purple region** below the button,
never inside the form fields. Per field there is an accept action; „Alle übernehmen" accepts
everything. Accepting only writes into the **client-side form state** — the artifact is
unchanged until the user saves, and saving creates a new `ArtifactVersion` like any other edit.
Closing the panel discards everything.

### Logging

Every call writes an `AiSession` row: `provider`, `mode: "suggest"`,
`prompt: "<TYPE>/<artifactId>"` (a reference, not the full prompt text), the JSON response
(or the error message on failure), `artifactId`, `userId`, `durationMs`.

---

## 4. Feature 2 — Document import (extraction)

### UI flow (`DocumentImport.jsx`, 3 steps)

1. **Upload** — drag & drop, up to 5 files (PDF, DOCX, TXT, MD), 10 MB each.
   Optional **auto-create mode** checkbox (opt-in before analysis): skip review, create everything.
2. **Analyze** — `POST /api/projects/:id/import` (multipart). Returns proposals + relations + stats.
3. **Review & create** — proposals listed with type badge, **confidence badge** (color-coded),
   `inferred` flag, expandable **evidence quotes** (verbatim from the document, with file name)
   and a rationale; relations in their own panel. Everything is pre-selected; the user deselects
   what they don't want, then „Erstellen" sends the selection to
   `POST /api/projects/:id/artifacts/bulk`, which creates artifacts (v1 versions) **and**
   relations in one DB transaction.

### Server pipeline (`import/route.js` + `document-extractor.js`)

```
files ──▶ validation                 max 5 files, 10 MB each, declared MIME on allowlist,
                                     magic-byte sniffing (%PDF / ZIP PK\x03\x04 / no NUL bytes)
      ──▶ text extraction            pdf-parse (PDF), mammoth (DOCX), utf-8 (TXT/MD)
      ──▶ combine + cap              files joined with "--- filename ---" separators,
                                     hard cap 250 000 chars (truncated with warning)
      ──▶ chunking                   12 000 chars/chunk, 800 overlap,
                                     prefers paragraph/sentence boundaries
      ──▶ per chunk (sequential):    buildExtractionPrompt → provider.extractFromDocument
      ──▶ parseExtractionResponse    never throws; sanitizes everything (see below)
      ──▶ mergeExtractionResults     dedupe across chunks, remap relation ids
      ──▶ response                   proposals, relations, coverage stats, warnings
```

Rate limit: **10 imports/hour per user** (each import fans out into one LLM call per chunk).

### The extraction prompt

Built dynamically from a **single source of truth**: the supported types and their field
schemas are derived from `ARTIFACT_FIELD_DEFS` + `ARTIFACT_TYPE_ORDER`/`ARTIFACT_GROUPS` —
adding a new artifact type to the constants automatically makes it extractable (currently
30 of 35 canonical types; the 5 without schemas are surfaced as warnings, not silently skipped).

The prompt contains 16 explicit rules, most importantly:

- only evidenced artifacts; plausible-but-unproven ones must carry `"inferred": true` and lower confidence
- no empty artifacts, no duplicates, multiple artifacts of one type when the document warrants it
- answer in the **document's language**
- per artifact: `confidence` (0–1), up to 3 verbatim `evidence` quotes, a `rationale`
- relations only between proposed artifacts (`clientId` references), only canonical relation types
- „Halluziniere nicht. Bei Unsicherheit lieber weniger Artefakte erzeugen."
- strict JSON only; multi-chunk runs get a chunk note („erfinde keine Artefakte aus anderen Chunks")

### Defensive parsing & merging

`parseExtractionResponse` accepts fenced or bare JSON, repairs trailing commas, drops unknown
types/fields with warnings, clamps confidence to [0,1], truncates titles (200), field values
(4000), quotes (400) and rationales (600), and **never throws**. `mergeExtractionResults`
deduplicates across chunks by `(type, lowercased title)` keeping the higher-confidence variant,
merges evidence, and rewrites relation ids accordingly.

---

## 5. Configuration reference

```env
AI_PROVIDER="claude"            # "claude" | "openai" | "disabled" (env fallback only)
AI_CLAUDE_API_KEY="sk-ant-…"    # env fallback; the admin UI stores keys encrypted in the DB
AI_OPENAI_API_KEY="sk-…"
AI_TIMEOUT_MS=30000
AI_MAX_TOKENS=2048
CONFIG_SECRET="…"               # optional dedicated encryption secret (default: NEXTAUTH_SECRET)
```

DB config (admin UI) takes precedence over env. Provider `"disabled"` or a missing key turns
all AI endpoints into clean 503s; the UI keeps working without AI.

---

## 6. Guardrails (spec F5) — status

| Guardrail | Status |
|---|---|
| AI never overwrites artifact content automatically | ✅ suggestions go to a separate panel; import goes through review (auto-create is an explicit opt-in) |
| Output shown as proposal in a separate UI region | ✅ purple suggestion panel / import review list |
| Explicit accept (single or all) | ✅ per-field accept, accept-all; per-proposal checkboxes on import |
| Accepting creates a new version | ✅ accept → form state → save → `ArtifactVersion`; bulk create writes v1 |
| Timeouts + provider errors don't block editing | ✅ configurable timeout, caught errors, error states in UI |
| Every request logged in `AiSession` | ⚠️ **suggestions yes (incl. failures), document import not at all** — see finding E3 |
| Cost control | ✅ rate limits (30 suggest/h, 10 imports/h per user), 250k char cap, max_tokens caps |

---

## 7. Evaluation

### What works well

- **Clean adapter pattern.** Providers are genuinely swappable; config precedence (DB → env)
  is sensible; keys are encrypted at rest; the disabled state degrades gracefully.
- **Single source of truth for schemas.** The extraction prompt and parser are both generated
  from `ARTIFACT_FIELD_DEFS` — no parallel type lists to drift apart.
- **Defensive parsing everywhere.** Both parsers never throw, repair common model mistakes,
  clamp/truncate every value, and degrade to a usable state (`{raw}` fallback, warnings).
- **Evidence-based extraction.** Confidence + verbatim quotes + `inferred` flag + rationale is
  a genuinely good anti-hallucination design and makes the review step meaningful.
- **Human in the loop, consistently.** Nothing reaches the DB without an explicit user action.

### Findings & improvement roadmap (prioritized)

**E1 — User-controlled extraction volume and scope (requested).** ⭐ ✅ **implemented (Step 39)**
The import page now has a **„Max. Vorschläge" selector** (10 / 25 / 50 / unbegrenzt, default 25)
and **per-group toggle chips** (default: all). `maxArtifacts` + `includeTypes[]` go through the
API into the prompt (rule 17 + restricted type catalogue), the parser (type whitelist), and a
global confidence-sorted hard cap (`applyProposalLimit`) after the cross-chunk merge — relations
whose endpoints were cut are pruned, and the drop count surfaces as a warning in the review UI.

**E2 — Enforce structured output instead of prompt discipline.**
Both adapters parse free text with regex/repair heuristics. Anthropic supports **forced tool
use with a JSON schema**, OpenAI supports `response_format: json_schema`. Using them would
eliminate the `{raw}` fallback and the trailing-comma repair entirely, and the schemas already
exist (`buildTypeSchemas()`). Highest robustness win per line of code.

**E3 — Document import is not logged.**
`AiSession` only records suggestion calls; import calls (the most expensive ones — one per
chunk) leave no trace. Blocker: `AiSession.artifactId` is required, and an import has no
artifact. Make `artifactId` optional / add `projectId`, then log one row per chunk
(or one per import with chunk count) including duration.

**E4 — No token/cost tracking.**
Both SDKs return token usage on every response; the app only stores `durationMs`. Persist
`inputTokens`/`outputTokens` in `AiSession` and show an aggregate on `/admin/ai` — that turns
the rate limits from guesses into informed settings.

**E5 — Sequential chunk processing.**
A 250k-char document means ~21 chunks processed one after another (potentially minutes).
Process chunks with bounded concurrency (e.g. 3 in parallel) — the merge step is already
order-independent. Combine with progress feedback (the UI currently shows only a spinner;
chunk count is already in the stats, so an SSE/polling progress bar is straightforward).

**E6 — Model-default drift.** ✅ **implemented (Step 39)**
Default model names live in `AI_DEFAULT_MODELS` (`lib/constants.js`); both adapters and the
provider factory consume it. (The admin UI's curated dropdown list is still its own list —
acceptable, since it's a display concern.)

**E7 — Suggestion prompts are hard-coded German.**
The import follows the document's language, but all 39 suggestion templates instruct German
output regardless of the artifact's language. Since next-intl and per-user language settings
already exist, the templates should take a target language parameter.

**E8 — Cross-chunk relations are impossible.**
Rule 13 restricts relations to artifacts of the same chunk, so a Vision in chunk 1 and a
Feature in chunk 9 are never linked. A cheap second pass — one extra LLM call with only the
merged titles+types, asking for plausible relations — would close this without re-sending
the document.

**E9 — Unbounded suggestion context.**
The suggest route concatenates **all** related artifacts' full field values into the prompt.
A heavily linked artifact produces a very large prompt. Cap the context (e.g. first 300 chars
per related artifact, max 10 relations, prefer DERIVES_FROM/VALIDATES).

**E10 — Title-only deduplication.**
Cross-chunk dedupe matches exact `(type, lowercased title)` — „Login-Feature" and
„Feature: Login" both survive. Acceptable for now; a normalized-token similarity check
(or including dedupe in the E8 second pass) would tighten it.

### Suggested implementation order

| Step | Items | Effort | Payoff |
|---|---|---|---|
| 1 | ~~**E1** (volume/scope control) + **E6** (model constants)~~ ✅ done (Step 39) | small | direct user value, requested |
| 2 | **E3 + E4** (import logging + token tracking) | small | visibility before tuning anything else |
| 3 | **E2** (structured output) | medium | robustness, removes parser heuristics |
| 4 | **E5** (parallel chunks + progress) | medium | UX on large documents |
| 5 | **E7–E10** | small–medium | polish |

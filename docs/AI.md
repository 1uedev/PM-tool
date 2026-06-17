# AI Architecture & Process Documentation

> How PM Copilot uses AI, end to end — documented from the implementation as of 2026-06-17.
> Covers: provider abstraction, the two AI features (field suggestions, document import),
> guardrails, logging, configuration, and an evaluation with an improvement roadmap.

---

## 1. Overview

PM Copilot uses AI in exactly **two user-facing features**, plus an admin configuration area:

| Feature | Entry point | API | What the AI does |
|---|---|---|---|
| **Field suggestions** | „KI-Vorschläge" button in the artifact form | `POST /api/projects/:id/artifacts/:aid/ai` | Improves/completes the fields of **one existing artifact**, using linked artifacts as context |
| **Document import** | `/projects/:id/import` upload page | `POST /api/projects/:id/import` | Reads uploaded documents (PDF/DOCX/TXT/MD) and **proposes new artifacts + relations** for review |
| Admin: AI settings | `/admin/ai` | `GET/PATCH /api/admin/ai`, `POST /api/admin/ai/test`, `POST /api/admin/ai/ollama-models` | Configure provider/model/key (or local Ollama server + model), run a live connection test |

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
├── ollama-adapter.js     # local Ollama (OpenAI-compatible API) + model listing
├── prompts/              # 39 per-artifact-type prompt templates + parser
└── document-extractor.js # extraction prompt, parser, chunking, merging
```

Three providers: **claude** (Anthropic SDK), **openai** (OpenAI SDK), and **ollama** (local,
via Ollama's OpenAI-compatible `/v1` endpoint — reuses the OpenAI SDK with a custom `baseURL`
and a placeholder key). Every adapter implements:

| Method | Used by | max_tokens | Timeout |
|---|---|---|---|
| `suggest(artifact, context)` | field suggestions | from config (default 2048) | from config (default 30 s) |
| `extractFromDocument(prompt, { schema })` | document import + relation pass | 4096 (hard-coded) | from config |
| `testConnection()` | admin test button | 10 (cloud) | 10 s (hard-coded) |

Cloud adapters enforce **structured output** (Step 41): Claude via forced tool use with a JSON
schema per call type, OpenAI via JSON mode. The Ollama adapter uses JSON mode too; its
`testConnection()` instead checks server reachability + that the chosen model is installed
(via `/api/tags`), avoiding a slow cold model load. All adapters return normalized token usage
(`{ inputTokens, outputTokens }`), and `suggest` honors the artifact's target `language`.

### Local models (Ollama)

`ollama-adapter.js` also exports `listOllamaModels(baseUrl)`, which queries Ollama's native
`GET /api/tags` to enumerate **locally installed models**. The admin route
`POST /api/admin/ai/ollama-models` exposes this so the settings UI can populate a live model
picker. No API key is involved; the only config is the server URL (`baseUrl`, default
`http://localhost:11434`) and the chosen model name.

### Configuration resolution (`getAiConfig()`)

1. **DB first:** the `AiConfig` singleton row (`provider`, `model`, `apiKey`, `baseUrl`,
   `timeoutMs`, `maxTokens`) maintained via `/admin/ai`. The API key is stored
   **AES-256-GCM-encrypted** (`lib/crypto.js`, key derived from `CONFIG_SECRET`, fallback
   `NEXTAUTH_SECRET`) and decrypted on read. Ollama rows store no key (just `baseUrl`).
2. **Env fallback** (initial setup / CI): `AI_PROVIDER`, `AI_CLAUDE_API_KEY` / `AI_OPENAI_API_KEY`,
   `AI_OLLAMA_BASE_URL` / `AI_OLLAMA_MODEL`, `AI_TIMEOUT_MS`, `AI_MAX_TOKENS`. Default models:
   `claude-sonnet-4-6` (Claude) / `gpt-5.4` (OpenAI); Ollama has no default (user-installed).
3. `isAiAvailable(config)` is false when provider is `"disabled"`; cloud providers require an
   API key, **ollama requires only a base URL** (always satisfied via the default). When
   unavailable, AI routes return 503 and the UI buttons surface the error instead of crashing.

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
AI_PROVIDER="claude"            # "claude" | "openai" | "ollama" | "disabled" (env fallback only)
AI_CLAUDE_API_KEY="sk-ant-…"    # env fallback; the admin UI stores keys encrypted in the DB
AI_OPENAI_API_KEY="sk-…"
AI_OLLAMA_BASE_URL="http://localhost:11434"  # local Ollama server (no key)
AI_OLLAMA_MODEL="llama3.2"      # which installed model to use
AI_TIMEOUT_MS=30000
AI_MAX_TOKENS=2048
CONFIG_SECRET="…"               # optional dedicated encryption secret (default: NEXTAUTH_SECRET)
```

DB config (admin UI) takes precedence over env. Provider `"disabled"`, a missing cloud key, or
an unreachable Ollama server turns all AI endpoints into clean 503s; the UI keeps working
without AI. **Ollama** runs models locally — no API key and no data leaves the machine; the
admin page lists installed models live and lets the admin pick one.

---

## 6. Guardrails (spec F5) — status

| Guardrail | Status |
|---|---|
| AI never overwrites artifact content automatically | ✅ suggestions go to a separate panel; import goes through review (auto-create is an explicit opt-in) |
| Output shown as proposal in a separate UI region | ✅ purple suggestion panel / import review list |
| Explicit accept (single or all) | ✅ per-field accept, accept-all; per-proposal checkboxes on import |
| Accepting creates a new version | ✅ accept → form state → save → `ArtifactVersion`; bulk create writes v1 |
| Timeouts + provider errors don't block editing | ✅ configurable timeout, caught errors, error states in UI |
| Every request logged in `AiSession` | ✅ suggestions (incl. failures) and document imports (one project-level row per run, incl. failures), both with token usage |
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

**E2 — Enforce structured output instead of prompt discipline.** ✅ **implemented (Step 41)**
Claude uses forced tool use (`tool_choice`) with JSON schemas (`buildSuggestionSchema` per
artifact type, `EXTRACTION_RESULT_SCHEMA`, `RELATION_PASS_SCHEMA`); the tool input is the
guaranteed-parseable result. OpenAI uses JSON mode (`response_format: json_object`). The
sanitizing parsers stay in place as the validation layer; the free-text path remains as a
defensive fallback.

**E3 — Document import is not logged.** ✅ **implemented (Step 40)**
`AiSession.artifactId` is now optional and a `projectId` column exists; every import run logs
one project-level row (file/chunk/limit summary as prompt, result counts as response, total
duration) — failures included.

**E4 — No token/cost tracking.** ✅ **implemented (Step 40)**
Both adapters return normalized `{ inputTokens, outputTokens }`; suggest and import sessions
persist them, and `/admin/ai` shows a 30-day usage card (requests, tokens, Ø duration,
per-feature breakdown).

**E5 — Sequential chunk processing.** ✅ **implemented (Step 41)**
Chunks are analyzed with bounded concurrency (3 in parallel, order-preserving); the analyze
button shows an elapsed-seconds counter plus a hint during analysis. True per-chunk SSE
progress remains a possible future refinement.

**E6 — Model-default drift.** ✅ **implemented (Step 39)**
Default model names live in `AI_DEFAULT_MODELS` (`lib/constants.js`); both adapters and the
provider factory consume it. (The admin UI's curated dropdown list is still its own list —
acceptable, since it's a display concern.)

**E7 — Suggestion prompts are hard-coded German.** ✅ **implemented (Step 41)**
`buildPrompt(type, fields, context, language)` appends an overriding output-language
instruction when the user's `preferredLanguage` is not German; the suggest route passes the
preference from the DB.

**E8 — Cross-chunk relations are impossible.** ✅ **implemented (Step 41)**
Multi-chunk imports run one follow-up call (`buildRelationPassPrompt`) over the merged
artifact titles+types only; results are sanitized against the known clientIds, deduped
against existing relations, token-tracked, and non-fatal on failure.

**E9 — Unbounded suggestion context.** ✅ **implemented (Step 41)**
Context capped at 10 related artifacts × 300 chars each.

**E10 — Title-only deduplication.** ✅ **implemented (Step 41)**
The dedupe key now normalizes titles (case-fold, strip punctuation, token-sort), so wording
variants like „Login-Feature" vs. „Feature: Login" collapse.

### Suggested implementation order

| Step | Items | Effort | Payoff |
|---|---|---|---|
| 1 | ~~**E1** (volume/scope control) + **E6** (model constants)~~ ✅ done (Step 39) | small | direct user value, requested |
| 2 | ~~**E3 + E4** (import logging + token tracking)~~ ✅ done (Step 40) | small | visibility before tuning anything else |
| 3 | ~~**E2** (structured output)~~ ✅ done (Step 41) | medium | robustness, removes parser heuristics |
| 4 | ~~**E5** (parallel chunks + progress)~~ ✅ done (Step 41) | medium | UX on large documents |
| 5 | ~~**E7–E10**~~ ✅ done (Step 41) | small–medium | polish |

**All findings from this review are implemented** (Steps 39–41).

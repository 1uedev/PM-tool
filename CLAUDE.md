# PM Copilot — Coding Prompt

> System-Prompt für KI-gestützte Implementierung des PM Copilot MVP.
> Basiert auf: PM Copilot Product Spec v1.1 (Developer Version), Stand 20. April 2026.

---

## Projektbeschreibung

PM Copilot ist ein KI-gestütztes Produktmanagementsystem für strukturierte PM-Artefakte, Traceability und kontextbezogene Assistenz. Das MVP umfasst: sichere Authentifizierung, Projektverwaltung, eine Explorer-Ansicht mit Baumstruktur, sechs strukturierte Artefakttypen, Artefaktrelationen, KI-Vorschläge (selektiv übernehmbar), Kommentare, Versionshistorie und eine Fortschrittssicht.

**Wichtige Einschränkung:** Keine echte kollaborative Echtzeitbearbeitung im MVP. Kein Live-Co-Editing, keine Cursor-Presence, keine Konfliktlösung.

---

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Sprache | JavaScript (kein TypeScript im MVP) |
| Styling | Tailwind CSS 3 |
| ORM | Prisma |
| Datenbank | SQLite (MVP) → PostgreSQL (Production) |
| Auth | NextAuth.js (Credentials Provider, JWT-basiert) |
| KI-Provider | Provider-agnostisch via Adapter-Pattern (Claude, OpenAI, etc.) |
| Icons | Lucide React |
| State | React Context + SWR oder TanStack Query für Server-State |
| Validierung | Zod (shared zwischen Client und Server) |
| Testing | Vitest + React Testing Library |

---

## Projektstruktur

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js
│   │   ├── register/page.js
│   │   └── layout.js                  # Auth-Layout ohne Sidebar
│   ├── (dashboard)/
│   │   ├── layout.js                  # Dashboard-Layout mit Sidebar
│   │   ├── projects/
│   │   │   ├── page.js                # Projektliste (B2)
│   │   │   └── new/page.js            # Projekt anlegen (B1)
│   │   └── projects/[projectId]/
│   │       ├── page.js                # Explorer View (C1)
│   │       ├── settings/page.js       # Projekt bearbeiten (B3, B4)
│   │       ├── board/page.js          # Board View light (J1, J2) — P1
│   │       └── progress/page.js       # Fortschrittssicht (I1, I2)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js
│   │   ├── projects/
│   │   │   ├── route.js               # GET (Liste), POST (anlegen)
│   │   │   └── [projectId]/
│   │   │       ├── route.js           # GET, PATCH, DELETE
│   │   │       ├── artifacts/
│   │   │       │   ├── route.js       # GET (Liste), POST (anlegen)
│   │   │       │   └── [artifactId]/
│   │   │       │       ├── route.js           # GET, PATCH, DELETE
│   │   │       │       ├── versions/route.js  # GET Versionen
│   │   │       │       ├── comments/route.js  # GET, POST Kommentare
│   │   │       │       ├── relations/route.js # GET, POST, DELETE Relationen
│   │   │       │       └── ai/route.js        # POST KI-Vorschläge
│   │   │       └── search/route.js    # GET Suche — P1
│   │   └── ai/
│   │       └── providers/route.js     # Health-Check für KI-Provider
│   └── layout.js                      # Root-Layout
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── EmptyState.jsx
│   ├── projects/
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectForm.jsx
│   │   └── ProjectList.jsx
│   ├── explorer/
│   │   ├── ExplorerTree.jsx           # Baumnavigation links
│   │   ├── ExplorerTreeGroup.jsx      # Gruppierung nach Typ
│   │   ├── ExplorerTreeItem.jsx       # Einzelnes Artefakt im Baum
│   │   └── ExplorerDetail.jsx         # Detailbereich rechts
│   ├── artifacts/
│   │   ├── ArtifactForm.jsx           # Generisches Formular-Wrapper
│   │   ├── ArtifactStatusBadge.jsx
│   │   ├── ArtifactHeader.jsx
│   │   ├── fields/                    # Typ-spezifische Feldgruppen
│   │   │   ├── UserPersonaFields.jsx
│   │   │   ├── ProblemHypothesisFields.jsx
│   │   │   ├── ProductVisionFields.jsx
│   │   │   ├── UseCaseFields.jsx
│   │   │   ├── UserStoryFields.jsx
│   │   │   └── FunctionalRequirementFields.jsx
│   │   ├── relations/
│   │   │   ├── RelationList.jsx
│   │   │   └── RelationAddDialog.jsx
│   │   ├── comments/
│   │   │   ├── CommentList.jsx
│   │   │   └── CommentForm.jsx
│   │   └── versions/
│   │       ├── VersionList.jsx
│   │       └── VersionDiff.jsx
│   ├── ai/
│   │   ├── AiSuggestButton.jsx        # Trigger für KI-Vorschläge
│   │   ├── AiSuggestionPanel.jsx      # Vorschläge getrennt anzeigen
│   │   └── AiSuggestionItem.jsx       # Einzelner Vorschlag mit Übernahme
│   ├── progress/
│   │   ├── ProgressOverview.jsx
│   │   └── PhaseCard.jsx
│   ├── board/                          # P1
│   │   ├── BoardView.jsx
│   │   ├── BoardColumn.jsx
│   │   └── BoardCard.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Select.jsx
│       ├── Dialog.jsx
│       ├── Badge.jsx
│       ├── Spinner.jsx
│       └── ConfirmDialog.jsx
├── lib/
│   ├── prisma.js                      # Prisma Client Singleton
│   ├── auth.js                        # NextAuth Config
│   ├── validators/                    # Zod Schemas
│   │   ├── project.js
│   │   ├── artifact.js
│   │   ├── comment.js
│   │   └── relation.js
│   ├── ai/
│   │   ├── provider.js               # Provider-Interface + Factory
│   │   ├── claude-adapter.js          # Claude/Anthropic Adapter
│   │   ├── openai-adapter.js          # OpenAI Adapter
│   │   └── prompts/                   # Prompt-Templates pro Artefakttyp
│   │       ├── user-persona.js
│   │       ├── problem-hypothesis.js
│   │       ├── product-vision.js
│   │       ├── use-case.js
│   │       ├── user-story.js
│   │       └── functional-requirement.js
│   ├── errors.js                      # Konsistentes Fehlerformat
│   ├── middleware/
│   │   ├── auth-guard.js              # Auth-Check für API Routes
│   │   └── project-access.js          # Rollen- und Projektzugriff
│   └── constants.js
└── prisma/
    ├── schema.prisma
    ├── seed.js
    └── migrations/
```

---

## Datenmodell (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  // SQLite: "file:./dev.db" | Postgres: "postgresql://..."
}

// ─── Auth & Users ───

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  memberships   ProjectMember[]
  comments      Comment[]
  versions      ArtifactVersion[]
  aiSessions    AiSession[]
}

// ─── Projects ───

model Project {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  members     ProjectMember[]
  artifacts   Artifact[]
}

model ProjectMember {
  id        String      @id @default(cuid())
  role      ProjectRole @default(EDITOR)
  userId    String
  projectId String
  createdAt DateTime    @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
}

enum ProjectRole {
  OWNER
  EDITOR
  VIEWER
}

// ─── Artifacts ───

model Artifact {
  id          String         @id @default(cuid())
  type        ArtifactType
  title       String
  status      ArtifactStatus @default(DRAFT)
  fields      Json           // Typ-spezifische Felder als JSON
  projectId   String
  deleted     Boolean        @default(false)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  project     Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  versions    ArtifactVersion[]
  comments    Comment[]
  tags        ArtifactTag[]
  aiSessions  AiSession[]

  relationsFrom Relation[] @relation("RelationSource")
  relationsTo   Relation[] @relation("RelationTarget")

  @@index([projectId, type])
  @@index([projectId, deleted])
}

enum ArtifactType {
  USER_PERSONA
  PROBLEM_HYPOTHESIS
  PRODUCT_VISION
  USE_CASE
  USER_STORY
  FUNCTIONAL_REQUIREMENT
}

enum ArtifactStatus {
  DRAFT
  IN_REVIEW
  DONE
}

// ─── Relations ───

model Relation {
  id           String       @id @default(cuid())
  type         RelationType
  sourceId     String
  targetId     String
  createdAt    DateTime     @default(now())

  source Artifact @relation("RelationSource", fields: [sourceId], references: [id], onDelete: Cascade)
  target Artifact @relation("RelationTarget", fields: [targetId], references: [id], onDelete: Cascade)

  @@unique([sourceId, targetId, type])
  @@index([sourceId])
  @@index([targetId])
}

enum RelationType {
  DERIVES_FROM    // Ableitung (z.B. Story aus Use Case)
  DEPENDS_ON      // Abhängigkeit
  RELATES_TO      // Allgemeine Verknüpfung
  VALIDATES       // Validiert (z.B. Anforderung validiert Hypothese)
}

// ─── Versions ───

model ArtifactVersion {
  id          String   @id @default(cuid())
  version     Int
  title       String
  fields      Json
  status      ArtifactStatus
  authorId    String
  artifactId  String
  createdAt   DateTime @default(now())

  author   User     @relation(fields: [authorId], references: [id])
  artifact Artifact @relation(fields: [artifactId], references: [id], onDelete: Cascade)

  @@unique([artifactId, version])
  @@index([artifactId])
}

// ─── Comments ───

model Comment {
  id         String   @id @default(cuid())
  content    String
  authorId   String
  artifactId String
  createdAt  DateTime @default(now())

  author   User     @relation(fields: [authorId], references: [id])
  artifact Artifact @relation(fields: [artifactId], references: [id], onDelete: Cascade)

  @@index([artifactId])
}

// ─── Tags (P1) ───

model Tag {
  id        String        @id @default(cuid())
  name      String
  projectId String
  createdAt DateTime      @default(now())

  artifacts ArtifactTag[]

  @@unique([name, projectId])
}

model ArtifactTag {
  artifactId String
  tagId      String

  artifact Artifact @relation(fields: [artifactId], references: [id], onDelete: Cascade)
  tag      Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([artifactId, tagId])
}

// ─── AI Sessions ───

model AiSession {
  id          String   @id @default(cuid())
  provider    String   // "claude", "openai", etc.
  mode        String   // "suggest"
  prompt      String   // @db.Text in Postgres
  response    String   // @db.Text in Postgres
  artifactId  String
  userId      String
  durationMs  Int?
  createdAt   DateTime @default(now())

  artifact Artifact @relation(fields: [artifactId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id])

  @@index([artifactId])
}
```

---

## Datenbank-Strategie: SQLite → PostgreSQL

Das MVP startet mit **SQLite** für maximale Einfachheit (kein externer DB-Server, kein Docker, sofort lauffähig). Die Architektur ist so angelegt, dass der Wechsel zu PostgreSQL minimal-invasiv ist.

### SQLite im MVP

- Datenbankdatei: `prisma/dev.db`
- Enums werden von Prisma automatisch als String-Spalten abgebildet — das ist korrekt so.
- `Json`-Felder werden als TEXT gespeichert — Prisma handled die Serialisierung.
- Kein `@db.Text` oder andere Postgres-spezifische Annotationen verwenden.
- Volltextsuche (K1) wird über `LIKE`-Queries implementiert — bei Postgres-Migration auf `tsvector` umstellen.

### Migration auf PostgreSQL (später)

Wenn PostgreSQL benötigt wird, sind nur diese Änderungen nötig:

1. `schema.prisma`: `provider = "sqlite"` → `provider = "postgresql"`
2. `.env`: `DATABASE_URL` von `file:./dev.db` auf Postgres-Connection-String ändern
3. Optional: `@db.Text` für lange Textfelder (prompt, response in AiSession) hinzufügen
4. Optional: Volltextsuche auf `@@fulltext` oder `tsvector` umstellen
5. `npx prisma migrate dev` für neue Migration ausführen

**Regel:** Verwende keine SQLite-spezifischen Features (z.B. `PRAGMA`). Schreibe alle Queries über Prisma, damit sie DB-agnostisch bleiben.

---

## Artefakttyp-Felder (JSON-Schema für `fields`)

Jeder Artefakttyp speichert seine Felder als JSON im `fields`-Feld. Hier die exakten Strukturen:

```javascript
// USER_PERSONA
{
  name: "",           // Name der Persona
  goals: "",          // Ziele (Freitext/Rich-Text)
  painPoints: "",     // Pain Points
  context: ""         // Kontext / Hintergrund
}

// PROBLEM_HYPOTHESIS
{
  problem: "",        // Problembeschreibung
  targetAudience: "", // Zielgruppe
  assumption: "",     // Annahme
  validation: ""      // Validierungsansatz
}

// PRODUCT_VISION
{
  oneLiner: "",       // Einzeiler / Elevator Pitch
  targetUsers: "",    // Zielnutzer
  valueProposition: "" // Nutzenversprechen
}

// USE_CASE
{
  actor: "",          // Akteur
  goal: "",           // Ziel
  flow: "",           // Ablauf (Schritte)
  preconditions: ""   // Vorbedingungen
}

// USER_STORY
{
  role: "",           // Als [Rolle]
  action: "",         // möchte ich [Aktion]
  benefit: ""         // damit [Nutzen]
}

// FUNCTIONAL_REQUIREMENT
{
  description: "",       // Beschreibung
  acceptanceCriteria: "" // Akzeptanzkriterien
}
```

---

## API-Design

### Konsistentes Fehlerformat (L3)

Alle API-Fehler folgen diesem Schema:

```javascript
// Erfolg
{ data: { ... } }
{ data: [ ... ] }

// Fehler
{
  error: {
    code: "VALIDATION_ERROR" | "AUTH_ERROR" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR",
    message: "Menschenlesbare Fehlermeldung",
    details: { ... }  // Optional: Feld-spezifische Validierungsfehler
  }
}
```

HTTP-Status-Codes: `400` (Validierung), `401` (nicht authentifiziert), `403` (nicht autorisiert), `404` (nicht gefunden), `500` (Server).

### Auth-Guard (L1, L2)

Jede API-Route prüft:
1. **Authentifizierung:** Gültiges JWT via NextAuth Session.
2. **Projektzugehörigkeit:** User ist Member des Projekts.
3. **Rollenprüfung:** VIEWER darf nur lesen, EDITOR darf bearbeiten, OWNER darf Projekt verwalten.
4. **Tenant-Isolation:** Kein Zugriff auf fremde Projekt-IDs möglich.

### API-Endpunkte

```
POST   /api/auth/register              — Registrierung (A1)
       Body: { email, password, name? }

GET    /api/projects                    — Projektliste (B2)
POST   /api/projects                    — Projekt anlegen (B1)
GET    /api/projects/:id                — Projekt Details
PATCH  /api/projects/:id                — Projekt bearbeiten (B3)
PATCH  /api/projects/:id/archive        — Projekt archivieren (B4)

GET    /api/projects/:id/artifacts      — Artefaktliste (mit Filter)
POST   /api/projects/:id/artifacts      — Artefakt erstellen (D1)
GET    /api/projects/:id/artifacts/:aid — Artefakt Details
PATCH  /api/projects/:id/artifacts/:aid — Artefakt bearbeiten (D2)
DELETE /api/projects/:id/artifacts/:aid — Artefakt löschen / Soft Delete (D5)

POST   /api/projects/:id/artifacts/:aid/relations   — Relation anlegen (E1)
DELETE /api/projects/:id/artifacts/:aid/relations/:rid — Relation löschen (E3)

POST   /api/projects/:id/artifacts/:aid/ai          — KI-Vorschläge anfordern (F1)
       Body: { mode: "suggest" }

GET    /api/projects/:id/artifacts/:aid/comments     — Kommentare laden (G2)
POST   /api/projects/:id/artifacts/:aid/comments     — Kommentar hinzufügen (G1)

GET    /api/projects/:id/artifacts/:aid/versions      — Versionsliste (H2)
POST   /api/projects/:id/artifacts/:aid/versions/:vid/restore — Version wiederherstellen (H3)

GET    /api/projects/:id/progress                     — Fortschrittsdaten (I1, I2)
GET    /api/projects/:id/search?q=...                 — Volltextsuche (K1) — P1
```

---

## KI-Provider Adapter Pattern (F1–F5)

```javascript
// lib/ai/provider.js — Interface
export class AiProvider {
  async suggest(artifact, context) {
    throw new Error("Not implemented");
  }
}

// lib/ai/claude-adapter.js
import Anthropic from "@anthropic-ai/sdk";
import { AiProvider } from "./provider";

export class ClaudeAdapter extends AiProvider {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.AI_CLAUDE_API_KEY });
  }

  async suggest(artifact, context) {
    const prompt = buildPrompt(artifact.type, artifact.fields, context);
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    return parseSuggestions(response.content[0].text, artifact.type);
  }
}

// lib/ai/provider-factory.js
export function getAiProvider() {
  const provider = process.env.AI_PROVIDER || "claude";
  switch (provider) {
    case "claude": return new ClaudeAdapter();
    case "openai": return new OpenAiAdapter();
    default: throw new Error(`Unknown AI provider: ${provider}`);
  }
}
```

### Guardrails (F5)

- KI überschreibt **niemals** automatisch Artefaktinhalte.
- Jede KI-Ausgabe wird als **Vorschlag** in einer separaten UI-Region angezeigt.
- Nutzer übernimmt Vorschläge **explizit** (einzeln oder alle).
- Übernahme erzeugt eine **neue Version** des Artefakts.
- Timeouts (max 30s) und Provider-Fehler werden abgefangen, ohne die Artefaktbearbeitung zu blockieren.
- Jede KI-Anfrage wird in `AiSession` protokolliert (Provider, Dauer, Artefaktbezug).

---

## Implementierungsregeln

### Allgemein

1. **Sprache:** Alle Code-Kommentare und Variablennamen auf **Englisch**. UI-Labels und Texte auf **Deutsch**.
2. **Keine toten Features:** Implementiere nur, was in der Spec als P0 oder P1 markiert ist. P2 wird nicht angefasst.
3. **Soft Delete:** Artefakte werden über ein `deleted: true` Flag markiert, nicht physisch gelöscht. Standardabfragen filtern `deleted: false`.
4. **Optimistic UI:** Speicher-Aktionen zeigen sofort den erwarteten Zustand, mit Rollback bei Fehler.
5. **Validierung:** Zod-Schemas werden **shared** zwischen Client (Form-Validierung) und Server (API-Validierung) verwendet.

### Frontend

6. **Explorer View:** Zwei-Spalten-Layout. Links: Baumnavigation mit Artefakten gruppiert nach Typ. Rechts: Detailbereich mit Formular, Relationen, Kommentaren und Versionsliste.
7. **Ungespeicherte Änderungen:** Vor dem Navigationswechsel im Explorer wird geprüft, ob ungespeicherte Änderungen vorliegen (Confirm-Dialog).
8. **Empty States:** Jeder leere Zustand (keine Projekte, keine Artefakte, keine Kommentare) hat eine eigene sinnvolle Darstellung mit Handlungsaufforderung.
9. **Loading States:** Jede asynchrone Aktion zeigt einen Ladezustand (Spinner, Skeleton).
10. **Destruktive Aktionen:** Löschen und Wiederherstellen erfordern immer einen Bestätigungsdialog.

### Backend

11. **Auth auf jeder Route:** Kein API-Endpunkt ohne Auth-Check. Helper-Funktion `withAuth(handler)` oder Middleware.
12. **Tenant-Isolation:** Jede Abfrage enthält `projectId` UND Prüfung der Mitgliedschaft. Kein Zugriff per fremder ID möglich.
13. **Versionierung:** Jede Speicherung eines Artefakts erzeugt automatisch eine neue `ArtifactVersion`. Versions-Nummer wird inkrementiert.
14. **Konsistente Responses:** Immer `{ data: ... }` oder `{ error: { code, message, details? } }`.

### KI

15. **Provider-agnostisch:** KI-Logik verwendet das Adapter-Pattern. Provider wird über `AI_PROVIDER` Env-Variable gewählt.
16. **Prompt-Templates:** Pro Artefakttyp gibt es ein eigenes Prompt-Template in `lib/ai/prompts/`. Templates erhalten den aktuellen Artefaktinhalt und optional verknüpfte Artefakte als Kontext.
17. **Structured Output:** KI-Antworten werden in das Feld-Schema des jeweiligen Artefakttyps geparst. Bei Parse-Fehler wird ein generischer Freitext-Vorschlag angezeigt.

---

## Sprint-Reihenfolge

### Sprint 1 — Foundation

**Ziel:** Auth, Projektverwaltung, Explorer-Grundlayout, Artefakt-CRUD.

Implementiere in dieser Reihenfolge:

1. Prisma Schema (SQLite) + Migration + Seed-Daten
2. NextAuth Setup (Credentials Provider, JWT)
3. Registrierung (A1) + Login (A2) + Logout (A3)
4. Auth-Guard Middleware + Fehlerformat
5. Projekt CRUD: Anlegen (B1), Liste (B2), Bearbeiten (B3), Archivieren (B4)
6. Explorer Layout (C1): Zwei-Spalten mit Platzhalter
7. Artefakt erstellen (D1) + Artefakt bearbeiten (D2) mit generischem Formular
8. Typ-spezifische Felder (D3) für alle 6 Typen
9. Artefaktstatus (D4) + Soft Delete (D5)
10. Explorer-Baum: Gruppierung (C3) + Navigation (C2)

### Sprint 2 — Relations & Collaboration

**Ziel:** Artefakte verknüpfen, Kommentare, Statusverwaltung.

1. Relation anlegen (E1) mit Auswahl-Dialog
2. Verknüpfte Artefakte anzeigen (E2) in Detailansicht
3. Relation löschen (E3)
4. Kommentar hinzufügen (G1) + Kommentarverlauf (G2)
5. Rollenbasierte Zugriffsprüfung (L1) — VIEWER/EDITOR/OWNER
6. Tenant-/Projektisolation (L2) absichern

### Sprint 3 — AI & Versioning

**Ziel:** KI-Vorschläge, Versionshistorie, Fortschritt.

1. KI-Provider Adapter Setup + Prompt-Templates
2. KI-Vorschläge anfordern (F1)
3. Vorschläge getrennt anzeigen (F2) — separates Panel
4. Vorschläge selektiv übernehmen (F3)
5. KI-Logging (F4) + Guardrails (F5)
6. Versionierung bei Speicherung (H1)
7. Versionsliste anzeigen (H2)
8. Version wiederherstellen (H3)
9. Fortschritt über Kernphasen (I1)
10. Fehlende Artefakte sichtbar machen (I2)

### Sprint 4 — Search, Board, Polish

**Ziel:** P1-Features, Hardening, QA.

1. Volltextsuche (K1)
2. Tags vergeben (K2) + Filter nach Tags
3. Filter nach Typ und Status (K3)
4. Board View (J1) + Drag & Drop (J2)
5. Validierung aller API-Endpunkte härten (L3)
6. Error Handling und Edge Cases
7. Responsive Design und Accessibility
8. E2E-Tests für Kern-Flows

---

## Definition of Done (pro Feature)

- Alle Akzeptanzkriterien der Spec erfüllt
- Frontend- und Backend-Logik umgesetzt
- Fehlerfälle behandelt (leere States, Netzwerkfehler, Validierung)
- Grundlegende Tests vorhanden (Unit + Integration)
- Rechteprüfung berücksichtigt (Auth-Guard + Rollen)
- Logging für kritische Aktionen (KI-Anfragen, Löschungen)
- Kein bekannter Blocker für den Kernflow

---

## Environment Variables

```env
# Database — SQLite für MVP, Postgres für Production
DATABASE_URL="file:./dev.db"
# DATABASE_URL="postgresql://user:password@localhost:5432/pmcopilot"  # Production

# Auth
NEXTAUTH_SECRET="generate-a-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider
AI_PROVIDER="claude"                    # "claude" | "openai"
AI_CLAUDE_API_KEY="sk-ant-..."
AI_OPENAI_API_KEY="sk-..."
AI_TIMEOUT_MS=30000
AI_MAX_TOKENS=2048
```

---

## Wichtige Hinweise

1. **Beginne immer mit Sprint 1.** Die Sprints bauen aufeinander auf.
2. **Erstelle Prisma-Migrationen** bevor du Frontend-Code schreibst.
3. **Teste Auth-Flows zuerst** — alle weiteren Features hängen davon ab.
4. **KI-Features sind optional lauffähig** — wenn kein API-Key konfiguriert ist, wird der KI-Button deaktiviert statt einen Fehler zu werfen.
5. **Commit nach jedem abgeschlossenen Epic** — nicht nach jedem File.
6. **Halte dich an die Spec** — implementiere keine Features, die nicht in diesem Dokument stehen.

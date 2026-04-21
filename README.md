# PM Copilot

KI-gestütztes Produktmanagementsystem für strukturierte PM-Artefakte, Traceability und kontextbezogene Assistenz.

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Sprache | JavaScript |
| Styling | Tailwind CSS 3 |
| ORM | Prisma 7 |
| Datenbank | SQLite (MVP) |
| Auth | NextAuth.js 4 (Credentials Provider, JWT) |
| Datenfetching | SWR |
| Validierung | Zod 3 |
| Icons | Lucide React |

## Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Datenbank initialisieren und Seed-Daten einspielen
npx prisma migrate dev
node prisma/seed.mjs

# Entwicklungsserver starten
npm run dev
```

Die App läuft dann unter [http://localhost:3000](http://localhost:3000).

### Demo-Zugangsdaten

| E-Mail | Passwort | System-Rolle | Projekt-Rolle |
|---|---|---|---|
| admin@example.com | password123 | Admin | — |
| alice@example.com | password123 | User | Owner (Smart Home App) |
| bob@example.com | password123 | User | Editor (Smart Home App) |

### Umgebungsvariablen

`.env` wird nicht eingecheckt. Vorlage:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dein-geheimes-secret"
NEXTAUTH_URL="http://localhost:3000"
AI_PROVIDER="claude"
AI_CLAUDE_API_KEY=""
AI_TIMEOUT_MS=30000
AI_MAX_TOKENS=2048
```

### Nützliche Skripte

```bash
npm run db:seed    # Seed-Daten einspielen
npm run db:reset   # DB zurücksetzen und neu seeden
npx prisma studio  # Datenbank-Browser öffnen
```

---

## Fortschritt: Sprint 1

### Schritt 1 — Prisma Schema, Migration, Seed ✅

- Prisma 7 mit SQLite-Adapter (`@prisma/adapter-better-sqlite3`) aufgesetzt
- Vollständiges Datenmodell angelegt: `User`, `Project`, `ProjectMember`, `Artifact`, `Relation`, `ArtifactVersion`, `Comment`, `Tag`, `ArtifactTag`, `AiSession`
- Erste Migration ausgeführt (`prisma/migrations/…_init`)
- Seed-Script (`prisma/seed.mjs`) mit Demo-Daten:
  - 2 User (alice & bob)
  - 1 Projekt „Smart Home App"
  - 6 Artefakte (alle Typen, verschiedene Status)
  - 3 Relationen zwischen Artefakten
  - Je eine initiale Version pro Artefakt
  - 1 Kommentar
- `src/lib/prisma.js` — Prisma-Client-Singleton mit Adapter

---

### Schritt 2 — NextAuth Setup (Credentials Provider, JWT) ✅

- `src/lib/auth.js` — NextAuth-Config mit Credentials Provider, bcrypt-Passwortprüfung, JWT-Session, Custom Login-Page `/login`
- `src/app/api/auth/[...nextauth]/route.js` — NextAuth API-Handler
- `src/lib/middleware/auth-guard.js` — `requireAuth()` Hilfsfunktion für API-Routes
- `src/lib/errors.js` — `errorResponse()` / `successResponse()` für konsistente API-Antworten
- `src/middleware.js` — Next.js Middleware schützt `/projects/*` und `/api/projects/*` automatisch
- `src/components/auth/SessionProvider.jsx` — Client-Wrapper für `SessionProvider`
- Root-Layout mit `SessionProvider` gewrappt

**Gelöste Besonderheiten:**
- Zod auf v3 gehalten (next-auth v4 inkompatibel mit Zod v4)
- `"type": "module"` entfernt — ESM/CJS-Konflikt mit next-auth; stattdessen `.mjs` für Seed und Config
- `serverExternalPackages` für Prisma/bcryptjs verhindert Webpack-Bundling-Fehler

---

### Schritt 3 — Registrierung, Login, Logout (A1, A2, A3) ✅

- `POST /api/auth/register` — Registrierung mit Zod-Validierung, bcrypt-Hashing, Duplikat-Check
- `src/app/(auth)/layout.js` — zentriertes Auth-Layout ohne Sidebar
- `/login` — `LoginForm` mit `signIn()`, Fehleranzeige, Ladeindikator, Redirect nach `/projects`
- `/register` — `RegisterForm` mit API-Call, Auto-Login nach Registrierung, Feldvalidierung
- `LogoutButton` — `signOut()` → `/login`
- Root `/` leitet authentifizierte User zu `/projects`, Gäste zu `/login`
- Neue UI-Primitives: `Input`, `Spinner`, `Button` (überarbeitet)

---

### Schritt 4 — Auth-Guard Middleware + Fehlerformat (L1, L2, L3) ✅

- `src/lib/middleware/project-access.js`:
  - `requireProjectAccess(userId, projectId, requiredRole)` — prüft Membership + Rolle (VIEWER / EDITOR / OWNER) mit Tenant-Isolation
  - `requireArtifactAccess(artifactId, projectId)` — stellt sicher, dass Artefakt zum Projekt gehört
- `src/lib/validators/index.js`:
  - `validateBody(request, schema)` — parst JSON-Body und validiert gegen Zod-Schema
  - `validateParams(searchParams, schema)` — validiert URL-Query-Parameter
- `src/lib/constants.js` — alle Domain-Enums und deutsche Labels (`PROJECT_STATUS`, `PROJECT_ROLE`, `ARTIFACT_TYPE`, `ARTIFACT_STATUS`, `RELATION_TYPE`)

**Pattern für alle API-Routes:**
```js
const { session, response: authErr } = await requireAuth();
if (authErr) return authErr;

const { membership, response: accessErr } = await requireProjectAccess(session.user.id, projectId, "EDITOR");
if (accessErr) return accessErr;

const { data, response: validErr } = await validateBody(request, mySchema);
if (validErr) return validErr;
```

---

### Schritt 5 — Projekt CRUD (B1, B2, B3, B4) ✅

**API:**
- `GET /api/projects` — Projektliste mit Artefakt-Anzahl
- `POST /api/projects` — Projekt anlegen, Creator wird automatisch OWNER
- `GET/PATCH/DELETE /api/projects/:id` — Details, Bearbeiten (EDITOR+), Löschen (OWNER)
- `PATCH /api/projects/:id/archive` — Archivieren / Reaktivieren (OWNER)
- Alle Routes mit `requireAuth` + `requireProjectAccess` abgesichert

**Frontend:**
- Dashboard-Layout mit `Sidebar` (Auth-Gate, Server Component)
- `/projects` — Projektgrid, aktive + archivierte Sektion, Empty State
- `/projects/new` — Formular mit Validierung
- `/projects/:id/settings` — Bearbeiten + Aktionen (Archivieren, Löschen mit Bestätigungsdialog)
- Neue Komponenten: `ProjectCard`, `ProjectList`, `ProjectForm`, `ProjectSettingsActions`
- Neue UI-Primitives: `Badge`, `ConfirmDialog`, `Sidebar`, `Header`, `EmptyState`

---

### Schritt 6 — Explorer Layout (C1) ✅

Zwei-Spalten-Layout für `/projects/:id`:

```
┌─────────────────────────────────────────┐
│ Breadcrumb              Einstellungen   │  ← Header
├──────────────┬──────────────────────────┤
│ Artefakte    │                          │
│              │                          │
│ USER PERSONA │   Detail-Bereich         │
│  • Persona A │                          │
│              │   → leer: Hinweistext    │
│ PROBLEM HYP. │   → ?artifact=ID: Form   │
│  • Hyp. B    │   → ?new=TYPE: Neuanlage │
│              │                          │
│ USE CASE (0) │                          │
│  Keine...    │                          │
└──────────────┴──────────────────────────┘
```

- `ExplorerTree` (Server Component) — gruppiert Artefakte nach Typ in kanonischer Reihenfolge
- `ExplorerTreeGroup` — aufklappbare Gruppe mit Item-Count und `+`-Button (hover)
- `ExplorerTreeItem` — Eintrag mit Status-Dot (grün / gelb / grau), setzt `?artifact=ID` in der URL
- `ExplorerDetail` (Client Component) — liest URL-Params, zeigt kontextabhängigen Inhalt
- `GET /api/projects/:id/artifacts` — Liste aller nicht-gelöschten Artefakte, optionaler `?type=` Filter
- URL-Params als State (`?artifact=ID`, `?new=TYPE`) — deep-linkable, kein extra Client-State

---

### Schritt 7 — Artefakt erstellen und bearbeiten (D1, D2) ✅

**API:**
- `POST /api/projects/:id/artifacts` — erstellt Artefakt + Version 1 in einer Transaktion, merged Felder mit Type-Defaults
- `GET /api/projects/:id/artifacts/:aid` — vollständiges Artefakt mit geparsten JSON-Feldern
- `PATCH /api/projects/:id/artifacts/:aid` — Update mit automatischer Versionierung

**Frontend:**
- `ArtifactForm` — unified Create/Edit-Formular:
  - Titel + Status-Select im Header
  - Alle Felder des Typs als beschriftete Inputs / Textareas
  - Optimistisches Speicher-Feedback („✓ Gespeichert")
  - Bei Neuanlage: Redirect auf `?artifact=ID`
- `ExplorerDetail` (live):
  - `?artifact=ID` → SWR-Fetch → `ArtifactForm` (Edit-Modus)
  - `?new=TYPE` → `ArtifactForm` (Create-Modus)
  - Leer → Hinweistext
- `ExplorerTreeClient` — Client-Wrapper mit SWR-Revalidierung nach Mutations, server-gerenderte Initialdaten als Fallback

**Shared:**
- `src/lib/artifactFields.js` — Feld-Definitionen (key, label, placeholder, multiline, rows) für alle 6 Artefakttypen + `getDefaultFields()`
- `src/lib/validators/artifact.js` — Zod-Schemas für Create und Update
- `Select` UI-Primitive

---

### Schritt 8 — Typ-spezifische Feldkomponenten (D3) ✅

Für jeden der 6 Artefakttypen eine dedizierte Feldkomponente mit typengerechtem UX:

| Komponente | Besonderheit |
|---|---|
| `UserPersonaFields` | Name, Ziele, Pain Points, Kontext als beschriftete Felder |
| `ProblemHypothesisFields` | Visueller Trenner zwischen Problem-Teil und Hypothese-Teil |
| `ProductVisionFields` | Einzeiler in hervorgehobenem blauen Kasten |
| `UseCaseFields` | Akteur + Ziel nebeneinander, Ablauf in Mono-Textarea |
| `UserStoryFields` | Klassisches „Als … möchte ich … damit …"-Format mit verbundener Darstellung |
| `FunctionalRequirementFields` | Akzeptanzkriterien in Mono-Textarea mit Hinweis-Text |

- `FieldHelpers.jsx` — gemeinsame Primitive: `FieldLabel`, `FieldInput`, `FieldTextarea`, `FieldGroup`, `SectionDivider`
- `fields/index.js` — `FIELD_COMPONENTS`-Map für dynamisches Rendering nach Typ
- `ArtifactForm` — generischer Renderer entfernt, nutzt jetzt `FIELD_COMPONENTS[artifactType]`

---

### Schritt 9 — Artefaktstatus und Soft Delete (D4, D5) ✅

**D4 — Statusverwaltung:**
- `ArtifactHeader` — zeigt Typ-Label + `ArtifactStatusBadge` + Quick-Status-Button
- Quick-Status-Toggle: ein Klick wechselt DRAFT → IN_REVIEW → DONE → DRAFT (zyklisch), schreibt sofort eine neue Version, invalidiert SWR-Cache im Baum und Detail
- Status-Button zeigt nächsten Zielstatus als Label an

**D5 — Soft Delete:**
- `DELETE /api/projects/:id/artifacts/:aid` — setzt `deleted: true`, physisch bleibt der Eintrag erhalten
- Löschen-Icon im `ArtifactHeader` öffnet `ConfirmDialog` mit Artefakt-Titel
- Nach Bestätigung: SWR-Cache invalidiert, Redirect auf leeren Explorer, Tree-Refresh
- Alle Standardabfragen filtern bereits `deleted: false` — gelöschte Artefakte tauchen nicht mehr auf

---

### Schritt 10 — Explorer-Baum: Navigation und Unsaved-Changes-Guard (C2, C3) ✅

**C2 — Navigation:**
- Klick auf Baumeintrag setzt `?artifact=ID` in der URL → Detail-Panel lädt das Artefakt per SWR
- Klick auf `+` in einer Gruppe setzt `?new=TYPE` → neues Artefakt-Formular
- **Unsaved-Changes-Guard** (Spec-Regel 7): Wenn das Formular dirty ist und der Nutzer navigiert (anderes Artefakt, + Neu, Seite verlassen), erscheint ein `ConfirmDialog` — „Verwerfen und wechseln" oder „Abbrechen"
- `DirtyFormContext` — React Context, schreibt/liest `isDirty` global zwischen `ArtifactForm`, `ExplorerTreeItem` und `ExplorerTreeGroup`
- `ArtifactForm` setzt `isDirty = true` bei jeder Feldänderung, `isDirty = false` nach erfolgreichem Save oder beim Wechsel zu einem anderen Artefakt (via `useEffect` auf `artifact.id`)

**C3 — Gruppierung:**
- 6 Gruppen in kanonischer Reihenfolge: Persona → Hypothese → Vision → Use Case → Story → Anforderung
- Jede Gruppe: aufklappbar, zeigt Artefakt-Anzahl, `+`-Button bei Hover
- Leere Gruppen zeigen „Keine Einträge" (kein visuelles Rauschen)
- Status-Dot pro Item: grün (Fertig), gelb (In Prüfung), grau (Entwurf)

---

## Sprint 1 abgeschlossen ✅

Alle 10 Schritte von Sprint 1 sind implementiert.

---

## Fortschritt: Sprint 2

### Schritt 1 — Relation anlegen (E1) ✅

**API:**
- `GET /api/projects/:id/artifacts/:aid/relations` — lädt alle Relationen (von und zu diesem Artefakt), inkl. verknüpfte Artefakt-Metadaten
- `POST /api/projects/:id/artifacts/:aid/relations` — legt eine neue Relation an (Duplikat-Check, Self-Reference-Check)
- `DELETE /api/projects/:id/artifacts/:aid/relations/:rid` — löscht Relation (prüft Zugehörigkeit zum Artefakt)

**Frontend:**
- `RelationList` — zeigt alle Verknüpfungen unterhalb des Artefakt-Formulars; jede Zeile mit Löschen-Button und `ConfirmDialog`
- `RelationAddDialog` — Modal zur Auswahl von Beziehungstyp und Ziel-Artefakt
- `ExplorerDetail` — integriert `RelationList` unterhalb des Formulars

**Shared:**
- `src/lib/validators/relation.js` — Zod-Schema für Relation anlegen

---

### Schritt 2 — Kommentare (G1, G2) ✅

**API:**
- `GET /api/projects/:id/artifacts/:aid/comments` — lädt alle Kommentare chronologisch (älteste zuerst), inkl. Autorendaten
- `POST /api/projects/:id/artifacts/:aid/comments` — fügt neuen Kommentar hinzu (VIEWER+ darf kommentieren)

**Frontend:**
- `CommentList` — zeigt Kommentarthread unterhalb der Verknüpfungen; Avatar-Initialen, Name und Zeitstempel pro Eintrag
- `CommentForm` — Textarea mit Senden-Button, optimistisches Update via SWR mutate
- `ExplorerDetail` — integriert `CommentList` nach `RelationList`

**Shared:**
- `src/lib/validators/comment.js` — Zod-Schema (min 1, max 2000 Zeichen)

---

---

### Schritt 3 — Rollenbasierte Zugriffsprüfung (L1, L2) ✅

**Konzept:** VIEWER = Lesezugriff, EDITOR = Bearbeiten, OWNER = Projekteinstellungen

**`ProjectRoleContext`** (`src/lib/ProjectRoleContext.js`):
- React Context mit `ProjectRoleProvider` + `useProjectRole()` Hook
- `hasRole(userRole, requiredRole)` prüft Rollenhierarchie (VIEWER < EDITOR < OWNER)

**Frontend-Anpassungen:**
| Komponente | VIEWER | EDITOR | OWNER |
|---|---|---|---|
| Settings-Button | versteckt | versteckt | sichtbar |
| `+`-Button im Baum | versteckt | sichtbar | sichtbar |
| Status-Toggle + Löschen | versteckt | sichtbar | sichtbar |
| Formular-Felder | disabled | editierbar | editierbar |
| Speichern-Button | versteckt | sichtbar | sichtbar |
| Relation hinzufügen/löschen | versteckt | sichtbar | sichtbar |
| Kommentieren | möglich | möglich | möglich |

**Backend:** Bereits in `requireProjectAccess()` implementiert — alle Schreib-Endpoints erfordern EDITOR+, Projektverwaltung erfordert OWNER.

---

## Sprint 2 abgeschlossen ✅

---

## Fortschritt: Sprint 3

### Schritt 1 — KI-Provider Adapter + Vorschläge (F1–F5) ✅

**Backend:**
- `src/lib/ai/provider.js` — Basis-Interface `AiProvider`
- `src/lib/ai/claude-adapter.js` — Claude-Adapter (`claude-sonnet-4-6`), Timeout-Handling
- `src/lib/ai/provider-factory.js` — `getAiProvider()` + `isAiAvailable()` (prüft API-Key)
- `src/lib/ai/prompts/` — 6 Prompt-Templates (je Artefakttyp), JSON-Output-Format
- `src/lib/ai/prompts/index.js` — `buildPrompt()` + `parseSuggestions()` mit JSON-Parse-Fallback
- `POST /api/.../ai` — Vorschläge anfordern, verknüpfte Artefakte als Kontext, AiSession-Logging (F4)

**Frontend:**
- `AiSuggestButton` — lila Button im Formular (nur Edit-Modus, nur EDITOR+); zeigt Ladeindikator
- `AiSuggestionPanel` — separates Panel mit allen Vorschlägen, „Alle übernehmen"-Button (F2, F3)
- `AiSuggestionItem` — einzelner Vorschlag mit ✓-Button; nach Übernahme aus Panel entfernt (F3)
- Guardrails (F5): KI überschreibt nie automatisch; jeder Vorschlag wird explizit übernommen

**Konfiguration:**
- `AI_CLAUDE_API_KEY` in `.env` setzen — ohne Key bleibt der Button deaktiviert (503)
- `@anthropic-ai/sdk` zu `serverExternalPackages` in `next.config.mjs` hinzugefügt

---

---

### Schritt 2 — Versionshistorie (H1, H2, H3) ✅

**H1** — Versionierung bei Speicherung: bereits in Sprint 1 implementiert — jeder PATCH erzeugt automatisch eine neue `ArtifactVersion`.

**API:**
- `GET /api/.../versions` — alle Versionen (neueste zuerst) inkl. Autorendaten und geparsten Feldern
- `POST /api/.../versions/:vid` — Version wiederherstellen: setzt Artefakt-Inhalt zurück und legt neue Version an

**Frontend (`VersionList`):**
- Einklappbare Sektion unterhalb der Kommentare
- Aktuelle Version mit blauem „Aktuell"-Badge
- Jede Version aufklappbar → zeigt Felder als Vorschau
- Wiederherstellen-Button (nur EDITOR+) mit `ConfirmDialog`
- Nach Wiederherstellung: SWR-Cache für Artefakt, Versionen und Baum invalidiert

---

### Schritt 3 — Fortschrittsansicht (I1, I2) ✅

**API:**
- `GET /api/projects/:id/progress` — aggregiert Stats pro Artefakttyp: `total`, `done`, `inReview`, `draft`, `progress%`, `missing`-Flag; plus Gesamt-Stats (`overallProgress`, `missingTypes`)

**Frontend:**
- `ProgressOverview` — Summary-Bar (Gesamtfortschritt %, Anzahl fertig, fehlende Phasen) + Grid der Phasenkarten
- `PhaseCard` — pro Artefakttyp: Fortschrittsbalken, Status-Aufschlüsselung (Punkte in grün/gelb/grau), orange Warnung für fehlende Phasen, CTA-Link zum Anlegen
- `/projects/:id/progress` — Server-seitig gerendertes Page.js für schnelles Initial-Rendering
- „Fortschritt"-Button (BarChart3-Icon) im Explorer-Header für alle Rollen sichtbar

---

## Sprint 3 abgeschlossen ✅

---

## Fortschritt: Sprint 4

### Schritt 1 — Volltextsuche (K1) ✅

- `GET /api/projects/:id/search?q=&type=&status=&tag=` — LIKE-Suche über Titel und `fields`-JSON, kombinierbar mit Typ-, Status- und Tag-Filter
- `SearchDialog` — Command-Palette-Modal mit 250ms Debounce, Keyboard-Navigation (↑↓↵Esc), Snippet-Vorschau aus Feldinhalten
- `SearchButton` — Öffnet Dialog; globaler ⌘K/Ctrl+K Shortcut
- Suchen-Button im Explorer-Header für alle Rollen sichtbar

---

### Schritt 2 — Tags vergeben und Filter nach Tags (K2, K3) ✅

- `GET/POST /api/projects/:id/tags` — Projekt-Tags verwalten (upsert by name)
- `GET/POST/DELETE /api/projects/:id/artifacts/:aid/tags` — Tags zuweisen/entfernen
- `TagEditor` — inline Tag-Chip-Editor im ArtifactHeader: Dropdown mit bestehenden Tags, „Tag erstellen"-Option, Entfernen per X
- Tag-Filter-Dropdown in SearchDialog (erscheint wenn Projekt-Tags vorhanden)

---

### Schritt 3 — Status-Filter im Explorer-Tree (K3) ✅

- Filterleiste oben im Artefakt-Baum: Alle / Entwurf / In Prüfung / Fertig
- Client-seitiger Filter ohne extra API-Call
- Aktiver Filter mit blauem Pill-Badge hervorgehoben

---

### Schritt 4 — Board View mit Drag & Drop (J1, J2) ✅

- `BoardCard` — draggable Karte mit nativer HTML5 Drag & Drop API
- `BoardColumn` — Drop-Zone pro Status, visuelles Highlight bei Drag-Over, Leer-Zustand
- `BoardView` — 3 Spalten (Entwurf / In Prüfung / Fertig), optimistisches Status-Update via PATCH, Typ-Filter-Toolbar
- Klick auf Karte öffnet Artefakt im Explorer (`/projects/:id?artifact=ID`)
- `/projects/:id/board` — Board-Seite mit Breadcrumb; Board-Button im Explorer-Header

---

### Schritt 5 — Error Boundaries und Hardening (L3) ✅

- `(dashboard)/error.js` — React Error Boundary für alle Dashboard-Seiten mit Reset/Zurück-Button
- `(dashboard)/not-found.js` — 404-Seite für unbekannte Projekt/Artefakt-IDs
- `app/not-found.js` — minimales Root-404 für unbekannte Top-Level-Routen
- Backend-Validierung (Zod), Tenant-Isolation und Rollen bereits vollständig implementiert

---

## Sprint 4 abgeschlossen ✅

## MVP vollständig implementiert ✅

Alle P0-Features aus der Spec sind umgesetzt:

| Sprint | Features |
|---|---|
| Sprint 1 | Auth (A1–A3), Projektverwaltung (B1–B4), Explorer (C1–C3), Artefakt-CRUD (D1–D5) |
| Sprint 2 | Relationen (E1–E3), Kommentare (G1–G2), Rollen (L1–L2) |
| Sprint 3 | KI-Vorschläge (F1–F5), Versionshistorie (H1–H3), Fortschrittsansicht (I1–I2) |
| Sprint 4 | Suche (K1), Tags (K2), Filter (K3), Board View (J1–J2), Error Handling (L3) |

---

## Erweiterung: Vollständiges Produktmodell

### Erweiterungsschritt 1 — Admin-only Benutzerverwaltung ✅

**Neu umgesetzt:**
- Globales Rollenkonzept `systemRole` (`ADMIN` | `USER`) am User-Modell, getrennt von Projekt-Rollen
- Benutzer-`status` (`ACTIVE` | `INACTIVE`) — Soft-Deaktivierung statt physischer Löschung
- Inaktive Benutzer können sich nicht einloggen (Auth-Check in `authorize()`)
- Admin-only Middleware (`requireAdmin`) schützt alle Admin-Routen serverseitig

**Neue Domänen-Felder am User-Objekt:**
- `firstName`, `lastName` — strukturierter Name
- `systemRole` — systemweite Rolle (`ADMIN` / `USER`)
- `status` — Kontostatus (`ACTIVE` / `INACTIVE`)

**Neue API-Endpunkte (alle Admin-only):**
- `GET  /api/admin/users` — Benutzerliste
- `POST /api/admin/users` — Benutzer anlegen
- `GET  /api/admin/users/:id` — Benutzerdetail
- `PATCH /api/admin/users/:id` — Benutzer bearbeiten (inkl. Passwort-Reset)
- `DELETE /api/admin/users/:id` — Benutzer deaktivieren (Soft Delete)

**Neue UI-Bereiche:**
- `/admin/users` — Benutzerliste mit Status-Badges, Reaktivieren/Deaktivieren
- `/admin/users/new` — Benutzer anlegen (Vorname, Nachname, E-Mail, Passwort, Rolle, Status)
- `/admin/users/:id/edit` — Benutzer bearbeiten
- Sidebar: Admin-Bereich nur für Admins sichtbar (`Administration > Benutzerverwaltung`)

**Bekannte Einschränkungen:**
- Keine E-Mail-Flows (kein Passwort-Reset per Mail, keine Einladungslogik)
- Self-Service-Registrierung bleibt aktiv (kann optional deaktiviert werden)
- Kein Audit-Log für Admin-Aktionen (geplant für spätere Schritte)

**Nächster Schritt:**
- Schritt 2: Domänenmodell erweitern — zusätzliche PRD-/Produktobjekttypen (Marktanalyse, Epic, Feature, Roadmap, etc.)

---

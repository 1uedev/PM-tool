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

| E-Mail | Passwort | Rolle |
|---|---|---|
| alice@example.com | password123 | Owner |
| bob@example.com | password123 | Editor |

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

## Noch ausstehend (Sprint 1, Schritte 8–10)

- **Schritt 8** — Typ-spezifische Feldkomponenten (D3) für alle 6 Typen
- **Schritt 9** — Artefaktstatus (D4) + Soft Delete (D5)
- **Schritt 10** — Explorer-Baum: Gruppierung (C3) + Navigation (C2)

## Geplant (Sprint 2–4)

- Sprint 2: Relationen, Kommentare, Rollenprüfung
- Sprint 3: KI-Vorschläge, Versionshistorie, Fortschrittsansicht
- Sprint 4: Volltextsuche, Tags, Board View, Hardening

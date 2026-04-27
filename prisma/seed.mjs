import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbUrl = `file:${path.join(__dirname, "..", "dev.db")}`;

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.aiSession.deleteMany();
  await prisma.artifactTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.relation.deleteMany();
  await prisma.artifactVersion.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.language.deleteMany();

  // Seed languages
  await prisma.language.create({
    data: { code: "de", name: "German", nativeName: "Deutsch", isActive: true, isDefault: true },
  });
  await prisma.language.create({
    data: { code: "en", name: "English", nativeName: "English", isActive: true, isDefault: false },
  });
  console.log("Languages created: de, en");

  // Create users
  const passwordHash = await bcrypt.hash("password123", 10);

  // Fixed IDs so active sessions stay valid across reseeds
  const admin = await prisma.user.create({
    data: {
      id: "seed-user-admin",
      email: "admin@example.com",
      passwordHash,
      firstName: "System",
      lastName: "Admin",
      name: "System Admin",
      systemRole: "ADMIN",
      status: "ACTIVE",
    },
  });

  const alice = await prisma.user.create({
    data: {
      id: "seed-user-alice",
      email: "alice@example.com",
      passwordHash,
      firstName: "Alice",
      lastName: "Muster",
      name: "Alice Muster",
      systemRole: "USER",
      status: "ACTIVE",
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: "seed-user-bob",
      email: "bob@example.com",
      passwordHash,
      firstName: "Bob",
      lastName: "Beispiel",
      name: "Bob Beispiel",
      systemRole: "USER",
      status: "ACTIVE",
    },
  });

  console.log("Users created:", admin.email, alice.email, bob.email);

  // Create demo project
  const project = await prisma.project.create({
    data: {
      name: "Smart Home App",
      description:
        "Eine mobile App zur Steuerung smarter Heimgeräte für technikaffine Haushalte.",
      status: "ACTIVE",
    },
  });

  // Add members
  await prisma.projectMember.create({
    data: { userId: alice.id, projectId: project.id, role: "OWNER" },
  });
  await prisma.projectMember.create({
    data: { userId: bob.id, projectId: project.id, role: "EDITOR" },
  });

  console.log("Project created:", project.name);

  // Create artifacts
  const persona = await prisma.artifact.create({
    data: {
      type: "USER_PERSONA",
      title: "Tech-affiner Hausbesitzer",
      status: "DONE",
      projectId: project.id,
      fields: JSON.stringify({
        name: "Max Müller",
        goals:
          "Seinen Haushalt effizienter und komfortabler gestalten, Energie sparen.",
        painPoints:
          "Komplizierte Bedienoberflächen, Inkompatibilität zwischen verschiedenen Smart-Home-Systemen.",
        context:
          "35 Jahre alt, IT-Projektmanager, lebt mit Familie im Eigenheim. Besitzt bereits mehrere smarte Geräte verschiedener Hersteller.",
      }),
    },
  });

  const hypothesis = await prisma.artifact.create({
    data: {
      type: "PROBLEM_HYPOTHESIS",
      title: "Fragmentierte Smart-Home-Steuerung",
      status: "IN_REVIEW",
      projectId: project.id,
      fields: JSON.stringify({
        problem:
          "Nutzer mit mehreren Smart-Home-Geräten verschiedener Hersteller müssen zwischen verschiedenen Apps wechseln und verlieren den Überblick.",
        targetAudience:
          "Technikaffine Hausbesitzer mit 3+ smarten Geräten verschiedener Marken",
        assumption:
          "Eine einheitliche Steueroberfläche würde die Nutzungsfrequenz und Zufriedenheit signifikant erhöhen.",
        validation:
          "Nutzerinterviews mit 20 Haushalten, A/B-Test mit Prototyp vs. separate Apps",
      }),
    },
  });

  const vision = await prisma.artifact.create({
    data: {
      type: "PRODUCT_VISION",
      title: "Smart Home Hub — Produktvision",
      status: "DONE",
      projectId: project.id,
      fields: JSON.stringify({
        oneLiner:
          "Die eine App, die alle smarten Geräte zuhause vereint — einfach, sicher und herstellerunabhängig.",
        targetUsers:
          "Technikaffine Hausbesitzer und Familien mit heterogenem Smart-Home-Ökosystem",
        valueProposition:
          "Vollständige Kontrolle über alle smarten Heimgeräte aus einer einzigen intuitiven App, mit intelligenter Automatisierung und Energieübersicht.",
      }),
    },
  });

  const useCase = await prisma.artifact.create({
    data: {
      type: "USE_CASE",
      title: "Gerät per Sprachbefehl steuern",
      status: "IN_REVIEW",
      projectId: project.id,
      fields: JSON.stringify({
        actor: "Hausbesitzer",
        goal: "Ein Smart-Home-Gerät per Sprachbefehl ein- oder ausschalten",
        flow:
          "1. Nutzer öffnet App oder spricht Wake-Word\n2. Nutzer gibt Sprachbefehl (z.B. 'Wohnzimmerlicht ausschalten')\n3. App erkennt Gerät und Aktion\n4. App sendet Befehl an Gerät\n5. Bestätigung wird angezeigt",
        preconditions:
          "Gerät ist mit App verbunden und online. Mikrofon-Berechtigung ist erteilt.",
      }),
    },
  });

  const story = await prisma.artifact.create({
    data: {
      type: "USER_STORY",
      title: "Licht per App dimmen",
      status: "DRAFT",
      projectId: project.id,
      fields: JSON.stringify({
        role: "Hausbesitzer",
        action: "die Helligkeit meiner smarten Lampen per Schieberegler anpassen",
        benefit:
          "ich die perfekte Lichtatmosphäre für verschiedene Situationen schnell einstellen kann",
      }),
    },
  });

  const requirement = await prisma.artifact.create({
    data: {
      type: "FUNCTIONAL_REQUIREMENT",
      title: "Gerätesteuerung in Echtzeit",
      status: "DRAFT",
      projectId: project.id,
      fields: JSON.stringify({
        description:
          "Die App muss Steuerbefehle an Smart-Home-Geräte innerhalb von 500ms übertragen und eine Bestätigung der Ausführung anzeigen.",
        acceptanceCriteria:
          "- Befehlslatenz < 500ms bei stabiler WLAN-Verbindung\n- Fehlermeldung bei Verbindungsproblemen innerhalb von 3s\n- Gerätestatus wird nach Befehl sofort aktualisiert\n- Offline-Zustand wird klar kommuniziert",
      }),
    },
  });

  console.log("Artifacts created: 6");

  // Create relations
  await prisma.relation.create({
    data: {
      type: "DERIVES_FROM",
      sourceId: hypothesis.id,
      targetId: persona.id,
    },
  });
  await prisma.relation.create({
    data: {
      type: "DERIVES_FROM",
      sourceId: story.id,
      targetId: useCase.id,
    },
  });
  await prisma.relation.create({
    data: {
      type: "VALIDATES",
      sourceId: requirement.id,
      targetId: hypothesis.id,
    },
  });

  console.log("Relations created: 3");

  // Create initial versions for each artifact
  const artifacts = [persona, hypothesis, vision, useCase, story, requirement];
  for (const artifact of artifacts) {
    await prisma.artifactVersion.create({
      data: {
        version: 1,
        title: artifact.title,
        fields: artifact.fields,
        status: artifact.status,
        authorId: alice.id,
        artifactId: artifact.id,
      },
    });
  }

  console.log("Initial versions created: 6");

  // Add a comment
  await prisma.comment.create({
    data: {
      content:
        "Sehr detaillierte Persona — passt gut zu unserer Zielgruppe. Sollten wir noch eine Tech-skeptische Variante ergänzen?",
      authorId: bob.id,
      artifactId: persona.id,
    },
  });

  console.log("Comments created: 1");
  console.log("\nSeed completed successfully!");
  console.log("\nDemo-Zugangsdaten:");
  console.log("  Admin:   admin@example.com / password123  (systemRole: ADMIN)");
  console.log("  Alice:   alice@example.com / password123  (systemRole: USER, Projekt-Owner)");
  console.log("  Bob:     bob@example.com   / password123  (systemRole: USER, Projekt-Editor)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

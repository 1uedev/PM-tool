/**
 * PostgreSQL smoke test.
 *
 * Prerequisites:
 *   1. docker compose -f docker-compose.postgres.yml up -d
 *   2. Wait for Postgres to be healthy (docker compose ps)
 *   3. DATABASE_URL must point to the Postgres instance (see .env.postgres.example)
 *
 * Usage:
 *   DATABASE_URL="postgresql://pmcopilot:pmcopilot@localhost:5433/pmcopilot_test" \
 *     node scripts/smoke-postgres.mjs
 *
 * Exit code 0 = all checks passed.
 * Exit code 1 = a check failed or an unexpected error occurred.
 */

import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || !DATABASE_URL.startsWith("postgresql")) {
  console.error("ERROR: DATABASE_URL must be a PostgreSQL connection string.");
  console.error("  Expected: postgresql://...");
  console.error("  Got:      " + (DATABASE_URL ?? "(not set)"));
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label, err) {
  console.error(`  ✗ ${label}`);
  if (err) console.error("    " + (err.message ?? err));
  failed++;
}

async function run() {
  console.log("\n── PostgreSQL smoke test ──────────────────────────");
  console.log("  DATABASE_URL:", DATABASE_URL.replace(/:([^:@]+)@/, ":***@"));
  console.log("");

  // ── 1. Migrate ───────────────────────────────────────────────────────────
  console.log("Step 1: migrate deploy");
  try {
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL },
      stdio: "pipe",
    });
    ok("prisma migrate deploy");
  } catch (err) {
    fail("prisma migrate deploy", err);
    console.error(err.stderr?.toString());
    await prisma.$disconnect();
    process.exit(1);
  }

  // ── 2. Basic connectivity ─────────────────────────────────────────────────
  console.log("\nStep 2: basic queries");
  try {
    await prisma.$queryRaw`SELECT 1`;
    ok("database connection");
  } catch (err) {
    fail("database connection", err);
  }

  // ── 3. Create a user ─────────────────────────────────────────────────────
  let userId;
  try {
    const hash = await bcrypt.hash("smoke-test-pw", 10);
    const user = await prisma.user.create({
      data: {
        id: "smoke-user-1",
        email: "smoke@test.local",
        passwordHash: hash,
        name: "Smoke Test User",
      },
    });
    userId = user.id;
    ok("user create");
  } catch (err) {
    fail("user create", err);
  }

  // ── 4. Create a project ───────────────────────────────────────────────────
  let projectId;
  try {
    const project = await prisma.project.create({
      data: {
        id: "smoke-project-1",
        name: "Smoke Test Project",
        members: { create: { userId, role: "OWNER" } },
      },
    });
    projectId = project.id;
    ok("project create");
  } catch (err) {
    fail("project create", err);
  }

  // ── 5. Create an artifact ─────────────────────────────────────────────────
  let artifactId;
  try {
    const artifact = await prisma.artifact.create({
      data: {
        id: "smoke-artifact-1",
        type: "USER_PERSONA",
        title: "Smoke Persona",
        status: "DRAFT",
        fields: JSON.stringify({ name: "Test", goals: "", painPoints: "", context: "" }),
        projectId,
        versions: {
          create: {
            version: 1,
            title: "Smoke Persona",
            fields: JSON.stringify({ name: "Test", goals: "", painPoints: "", context: "" }),
            status: "DRAFT",
            authorId: userId,
          },
        },
      },
    });
    artifactId = artifact.id;
    ok("artifact create with version");
  } catch (err) {
    fail("artifact create with version", err);
  }

  // ── 6. Comment ────────────────────────────────────────────────────────────
  try {
    await prisma.comment.create({
      data: { content: "Smoke comment", authorId: userId, artifactId },
    });
    ok("comment create");
  } catch (err) {
    fail("comment create", err);
  }

  // ── 7. Notification ───────────────────────────────────────────────────────
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: "COMMENT_ADDED",
        actorId: userId,
        artifactId,
        projectId,
        meta: JSON.stringify({ artifactTitle: "Smoke Persona", actorName: "Smoke" }),
      },
    });
    ok("notification create");
  } catch (err) {
    fail("notification create", err);
  }

  // ── 8. Project template ───────────────────────────────────────────────────
  try {
    await prisma.projectTemplate.create({
      data: {
        name: "Smoke Template",
        createdById: userId,
        artifacts: {
          create: [{ type: "USER_PERSONA", title: "Skeleton Persona", fields: "{}", sortOrder: 0 }],
        },
      },
    });
    ok("project template create");
  } catch (err) {
    fail("project template create", err);
  }

  // ── 9. Audit log ──────────────────────────────────────────────────────────
  try {
    await prisma.auditLog.create({
      data: { action: "SMOKE_TEST", userId, projectId, meta: "{}" },
    });
    ok("audit log create");
  } catch (err) {
    fail("audit log create", err);
  }

  // ── 10. Query back ────────────────────────────────────────────────────────
  try {
    const result = await prisma.artifact.findMany({
      where: { projectId, deleted: false },
      include: { versions: true, comments: true },
    });
    if (result.length === 1 && result[0].versions.length === 1 && result[0].comments.length === 1) {
      ok("query artifact with relations");
    } else {
      fail("query artifact with relations", new Error(`unexpected counts: ${JSON.stringify({ artifacts: result.length })}`));
    }
  } catch (err) {
    fail("query artifact with relations", err);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  try {
    await prisma.project.delete({ where: { id: "smoke-project-1" } });
    await prisma.user.delete({ where: { id: "smoke-user-1" } });
  } catch {
    // Non-fatal — test DB is ephemeral anyway
  }

  await prisma.$disconnect();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n── Result: ${passed} passed, ${failed} failed ─────────────────────`);
  if (failed > 0) {
    console.error("FAILED — PostgreSQL compatibility check did not pass.\n");
    process.exit(1);
  } else {
    console.log("PASSED — schema is compatible with PostgreSQL.\n");
  }
}

run().catch((err) => {
  console.error("Unhandled error:", err);
  prisma.$disconnect();
  process.exit(1);
});

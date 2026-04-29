import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import prisma from "@/lib/prisma.js";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";

function getDefaultFields(type) {
  const defs = ARTIFACT_FIELD_DEFS[type] ?? [];
  return Object.fromEntries(defs.map((f) => [f.key, ""]));
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return errorResponse("AUTH_ERROR", "Nicht authentifiziert", 401);

  const { projectId } = await params;
  const { response: accessErr } = await requireProjectAccess(
    session.user.id,
    projectId,
    "EDITOR"
  );
  if (accessErr) return accessErr;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Ungültiger JSON-Body", 400);
  }

  const { artifacts } = body;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    return errorResponse("VALIDATION_ERROR", "Keine Artefakte zum Erstellen", 400);
  }
  if (artifacts.length > 50) {
    return errorResponse("VALIDATION_ERROR", "Maximal 50 Artefakte pro Import", 400);
  }

  // Validate each artifact
  for (const a of artifacts) {
    if (!a.type || typeof a.type !== "string") {
      return errorResponse("VALIDATION_ERROR", "Artefakttyp fehlt oder ungültig", 400);
    }
    if (!a.title || typeof a.title !== "string" || !a.title.trim()) {
      return errorResponse("VALIDATION_ERROR", `Titel fehlt für Artefakt vom Typ ${a.type}`, 400);
    }
    if (!ARTIFACT_FIELD_DEFS[a.type] && a.type !== "PROBLEM_HYPOTHESIS") {
      return errorResponse("VALIDATION_ERROR", `Unbekannter Artefakttyp: ${a.type}`, 400);
    }
  }

  // Create all artifacts in a transaction
  const created = await prisma.$transaction(
    artifacts.map((a) => {
      const fields = { ...getDefaultFields(a.type), ...(a.fields ?? {}) };
      return prisma.artifact.create({
        data: {
          type: a.type,
          title: a.title.trim().slice(0, 200),
          status: "DRAFT",
          fields: JSON.stringify(fields),
          projectId,
          versions: {
            create: {
              version: 1,
              title: a.title.trim().slice(0, 200),
              fields: JSON.stringify(fields),
              status: "DRAFT",
              authorId: session.user.id,
            },
          },
        },
        select: { id: true, type: true, title: true, status: true },
      });
    })
  );

  return successResponse({ created, count: created.length }, 201);
}

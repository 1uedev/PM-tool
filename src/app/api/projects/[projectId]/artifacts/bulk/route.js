import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { requireProjectAccess } from "@/lib/middleware/project-access.js";
import { errorResponse, successResponse } from "@/lib/errors.js";
import prisma from "@/lib/prisma.js";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";
import { RELATION_TYPE } from "@/lib/constants.js";

// Bulk import limit. Large PRDs can produce 50+ artifacts spanning all
// sections plus multiple features/stories/risks, so we raise the ceiling.
const MAX_BULK_ARTIFACTS = 100;
const VALID_RELATION_TYPES = new Set(Object.values(RELATION_TYPE));

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

  const { artifacts, relations } = body;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    return errorResponse("VALIDATION_ERROR", "Keine Artefakte zum Erstellen", 400);
  }
  if (artifacts.length > MAX_BULK_ARTIFACTS) {
    return errorResponse(
      "VALIDATION_ERROR",
      `Maximal ${MAX_BULK_ARTIFACTS} Artefakte pro Import`,
      400
    );
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

  // Build the artifact-create operations. We capture each artifact's
  // clientId (if any) so we can map it to the real DB id after the transaction.
  const inputs = artifacts.map((a) => {
    const fields = { ...getDefaultFields(a.type), ...(a.fields ?? {}) };
    const title = a.title.trim().slice(0, 200);
    return {
      clientId: typeof a.clientId === "string" ? a.clientId : null,
      data: {
        type: a.type,
        title,
        status: "DRAFT",
        fields: JSON.stringify(fields),
        projectId,
        versions: {
          create: {
            version: 1,
            title,
            fields: JSON.stringify(fields),
            status: "DRAFT",
            authorId: session.user.id,
          },
        },
      },
    };
  });

  // Validate / sanitize the optional relations payload up front so we can
  // include create-statements inside the same transaction.
  const incomingRelations = Array.isArray(relations) ? relations : [];
  const sanitizedRelations = [];
  const relationWarnings = [];

  // Build a clientId → input-index map (since transaction returns in order).
  const clientIdToIdx = new Map();
  inputs.forEach((inp, idx) => {
    if (inp.clientId) clientIdToIdx.set(inp.clientId, idx);
  });

  for (const r of incomingRelations) {
    if (!r || typeof r !== "object") continue;
    const src = typeof r.sourceClientId === "string" ? r.sourceClientId : "";
    const tgt = typeof r.targetClientId === "string" ? r.targetClientId : "";
    const type = typeof r.type === "string" ? r.type : "";
    if (!src || !tgt || src === tgt) {
      relationWarnings.push("Relation ohne gültige Source/Target wurde übersprungen");
      continue;
    }
    if (!VALID_RELATION_TYPES.has(type)) {
      relationWarnings.push(`Relation mit ungültigem Typ '${type}' wurde übersprungen`);
      continue;
    }
    if (!clientIdToIdx.has(src) || !clientIdToIdx.has(tgt)) {
      relationWarnings.push(
        `Relation ${src} → ${tgt} verweist auf Artefakte außerhalb dieses Imports und wurde übersprungen`
      );
      continue;
    }
    sanitizedRelations.push({
      sourceIdx: clientIdToIdx.get(src),
      targetIdx: clientIdToIdx.get(tgt),
      type,
    });
  }

  // Create artifacts (with v1) and relations in one transaction.
  let created;
  let createdRelations = [];
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: create artifacts in order so indices line up with input order.
      const out = [];
      for (const inp of inputs) {
        const row = await tx.artifact.create({
          data: inp.data,
          select: { id: true, type: true, title: true, status: true },
        });
        out.push(row);
      }

      // Step 2: create relations referencing the new IDs.
      const rels = [];
      for (const rel of sanitizedRelations) {
        const sourceId = out[rel.sourceIdx]?.id;
        const targetId = out[rel.targetIdx]?.id;
        if (!sourceId || !targetId) continue;
        try {
          const r = await tx.relation.create({
            data: { sourceId, targetId, type: rel.type },
            select: { id: true, sourceId: true, targetId: true, type: true },
          });
          rels.push(r);
        } catch (err) {
          // Most likely a unique-constraint clash — skip and warn.
          relationWarnings.push(
            `Relation ${sourceId} → ${targetId} (${rel.type}) konnte nicht erstellt werden`
          );
        }
      }
      return { artifacts: out, relations: rels };
    });
    created = result.artifacts;
    createdRelations = result.relations;
  } catch (err) {
    console.error("[bulk] artifact creation failed:", err);
    return errorResponse("SERVER_ERROR", "Erstellen fehlgeschlagen", 500);
  }

  return successResponse(
    {
      created,
      count: created.length,
      relations: createdRelations,
      relationCount: createdRelations.length,
      warnings: relationWarnings,
    },
    201
  );
}

/**
 * Updates an artifact and creates the next ArtifactVersion in one step.
 *
 * Must be called with a transaction client (the `tx` of
 * prisma.$transaction) — the read-increment-write of the version number
 * is only race-free when both queries run in the same transaction.
 * Concurrent saves otherwise compute the same number and violate the
 * @@unique([artifactId, version]) constraint.
 *
 * `fields` is the JSON-stringified fields payload (as stored on the model).
 *
 * `source` records the change provenance ("MANUAL" by default, "AI_CHAT" for
 * changes applied from the AI content chat); `note` optionally stores a short
 * rationale for the change.
 */
export async function updateArtifactWithVersion(
  tx,
  artifactId,
  { title, status, fields, authorId, source = "MANUAL", note = null }
) {
  const lastVersion = await tx.artifactVersion.findFirst({
    where: { artifactId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const nextVersion = (lastVersion?.version ?? 0) + 1;

  return tx.artifact.update({
    where: { id: artifactId },
    data: {
      title,
      status,
      fields,
      versions: {
        create: {
          version: nextVersion,
          title,
          fields,
          status,
          authorId,
          source,
          note,
        },
      },
    },
  });
}

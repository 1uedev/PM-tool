import prisma from "@/lib/prisma.js";

/**
 * Write a single audit log entry. Fire-and-forget — never throws so it
 * cannot disrupt the caller's response path.
 *
 * @param {string} action    "ARTIFACT_DELETE" | "ARTIFACT_RESTORE" | "PROJECT_ARCHIVE" | "PROJECT_UNARCHIVE"
 * @param {string} userId
 * @param {string|null} projectId
 * @param {string|null} targetId   artifactId or projectId depending on action
 * @param {object} meta            free-form context stored as JSON
 */
export async function logAction(action, userId, projectId, targetId, meta = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        projectId: projectId ?? null,
        targetId: targetId ?? null,
        meta: JSON.stringify(meta),
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}

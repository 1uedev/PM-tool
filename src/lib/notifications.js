import prisma from "@/lib/prisma.js";

// Fire-and-forget: create COMMENT_ADDED notifications for all project members
// except the actor. Never throws — a failed notification must not block the response.
export async function createCommentNotifications({
  actorId,
  projectId,
  artifactId,
  artifactTitle,
  contentPreview,
}) {
  try {
    const [members, actor, project] = await Promise.all([
      prisma.projectMember.findMany({
        where: { projectId },
        select: { userId: true },
      }),
      prisma.user.findUnique({
        where: { id: actorId },
        select: { name: true, email: true },
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      }),
    ]);

    const recipients = members
      .map((m) => m.userId)
      .filter((id) => id !== actorId);

    if (recipients.length === 0) return;

    const meta = JSON.stringify({
      artifactTitle: artifactTitle ?? "",
      projectName: project?.name ?? "",
      actorName: actor?.name ?? actor?.email ?? "",
      contentPreview: (contentPreview ?? "").slice(0, 120),
    });

    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type: "COMMENT_ADDED",
        actorId,
        artifactId,
        projectId,
        meta,
      })),
    });
  } catch (err) {
    console.error("[notifications] failed to create notifications:", err);
  }
}

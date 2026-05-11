import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import BoardView from "@/components/board/BoardView.jsx";
import ProjectNavBar from "@/components/layout/ProjectNavBar.jsx";

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return { title: project ? `Board — ${project.name} — PM Copilot` : "PM Copilot" };
}

export default async function BoardPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId } },
    include: { project: { select: { name: true } } },
  });

  if (!membership) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ProjectNavBar projectId={projectId} projectName={membership.project.name} role={membership.role} />

      <BoardView projectId={projectId} />
    </div>
  );
}

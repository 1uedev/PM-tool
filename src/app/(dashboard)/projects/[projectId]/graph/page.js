import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import ArtifactGraph from "@/components/graph/ArtifactGraph.jsx";
import ProjectNavBar from "@/components/layout/ProjectNavBar.jsx";

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return { title: project ? `${project.name} — Graph · PM Copilot` : "PM Copilot" };
}

export default async function GraphPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId } },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!membership) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ProjectNavBar projectId={projectId} projectName={membership.project.name} role={membership.role} />

      {/* Graph canvas — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        <ArtifactGraph projectId={projectId} />
      </div>
    </div>
  );
}

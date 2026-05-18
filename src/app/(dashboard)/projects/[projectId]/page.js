import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import ExplorerTreeClient from "@/components/explorer/ExplorerTreeClient.jsx";
import ExplorerDetail from "@/components/explorer/ExplorerDetail.jsx";
import ExplorerPanelLayout from "@/components/explorer/ExplorerPanelLayout.jsx";
import { DirtyFormProvider } from "@/lib/DirtyFormContext.js";
import { ProjectRoleProvider } from "@/lib/ProjectRoleContext.js";
import ProjectNavBar from "@/components/layout/ProjectNavBar.jsx";

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return { title: project ? `${project.name} — PM Copilot` : "PM Copilot" };
}

async function getProjectData(projectId, userId) {
  const [membership, artifacts] = await Promise.all([
    prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
      include: { project: true },
    }),
    prisma.artifact.findMany({
      where: { projectId, deleted: false },
      orderBy: { title: "asc" },
      select: { id: true, type: true, title: true, status: true },
    }),
  ]);
  return { membership, artifacts };
}

export default async function ProjectPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const { membership, artifacts } = await getProjectData(projectId, session.user.id);

  if (!membership) notFound();

  const { project, role } = membership;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ProjectNavBar projectId={projectId} projectName={project.name} role={role} />

      {/* Two-column explorer (collapses to single-panel on mobile) */}
      <ProjectRoleProvider role={role}>
      <DirtyFormProvider>
        <ExplorerPanelLayout
          tree={<ExplorerTreeClient projectId={projectId} initialArtifacts={artifacts} />}
          detail={<ExplorerDetail projectId={projectId} />}
        />
      </DirtyFormProvider>
      </ProjectRoleProvider>
    </div>
  );
}

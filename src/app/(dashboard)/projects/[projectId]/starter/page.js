import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import StarterForm from "@/components/starter/StarterForm.jsx";
import ProjectNavBar from "@/components/layout/ProjectNavBar.jsx";
import { STARTER_DEFAULTS } from "@/lib/starterContext.js";
import { PROJECT_ROLE } from "@/lib/constants.js";

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
  return { title: project ? `PRD Starter — ${project.name} — PM Copilot` : "PM Copilot" };
}

async function getData(projectId, userId) {
  const [membership, artifacts] = await Promise.all([
    prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
      include: { project: { select: { name: true, prdStarter: true } } },
    }),
    prisma.artifact.findMany({
      where: { projectId, deleted: false },
      select: { id: true, type: true, title: true, status: true },
      orderBy: { title: "asc" },
    }),
  ]);
  return { membership, artifacts };
}

export default async function StarterPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const { membership, artifacts } = await getData(projectId, session.user.id);

  if (!membership) notFound();

  const { project, role } = membership;
  const canEdit = role === PROJECT_ROLE.OWNER || role === PROJECT_ROLE.EDITOR;
  const starter = project.prdStarter ? JSON.parse(project.prdStarter) : STARTER_DEFAULTS;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ProjectNavBar projectId={projectId} projectName={project.name} role={role} />

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <StarterForm
          projectId={projectId}
          initialStarter={starter}
          artifacts={artifacts}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}

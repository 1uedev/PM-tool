import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import StarterForm from "@/components/starter/StarterForm.jsx";
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
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/projects" className="text-gray-500 hover:text-gray-900">Projects</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-900">
            {project.name}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900">PRD Starter</span>
        </div>
        <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Explorer
        </Link>
      </header>

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

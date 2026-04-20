import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import { Settings } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import ExplorerTreeClient from "@/components/explorer/ExplorerTreeClient.jsx";
import ExplorerDetail from "@/components/explorer/ExplorerDetail.jsx";

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
      {/* Top bar */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/projects" className="text-gray-500 hover:text-gray-900">
            Projekte
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900">{project.name}</span>
        </div>
        <Button href={`/projects/${projectId}/settings`} variant="ghost">
          <Settings className="h-4 w-4" />
          Einstellungen
        </Button>
      </header>

      {/* Two-column explorer */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tree */}
        <aside className="flex w-64 flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="flex h-10 flex-shrink-0 items-center border-b border-gray-100 px-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Artefakte
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ExplorerTreeClient
              projectId={projectId}
              initialArtifacts={artifacts}
            />
          </div>
        </aside>

        {/* Right: Detail */}
        <main className="flex flex-1 flex-col overflow-hidden bg-gray-50">
          <ExplorerDetail projectId={projectId} />
        </main>
      </div>
    </div>
  );
}

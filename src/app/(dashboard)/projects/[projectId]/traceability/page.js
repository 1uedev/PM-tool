import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import TraceabilityView from "@/components/traceability/TraceabilityView.jsx";

async function getTraceabilityData(projectId, userId) {
  const [membership, artifacts] = await Promise.all([
    prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
      include: { project: { select: { name: true } } },
    }),
    prisma.artifact.findMany({
      where: { projectId, deleted: false },
      select: { id: true, type: true, title: true, status: true },
      orderBy: { title: "asc" },
    }),
  ]);

  // Two-step query to avoid SQLite nested-filter hang
  const artifactIds = artifacts.map((a) => a.id);
  const relations = artifactIds.length > 0
    ? await prisma.relation.findMany({
        where: { sourceId: { in: artifactIds } },
        select: { id: true, type: true, sourceId: true, targetId: true },
      })
    : [];

  return { membership, artifacts, relations };
}

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return { title: project ? `Traceability — ${project.name} — PM Copilot` : "PM Copilot" };
}

export default async function TraceabilityPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const { membership, artifacts, relations } = await getTraceabilityData(projectId, session.user.id);

  if (!membership) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/projects" className="text-gray-500 hover:text-gray-900">Projekte</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-900">
            {membership.project.name}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900">Traceability</span>
        </div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Explorer
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <TraceabilityView
          artifacts={artifacts}
          relations={relations}
          projectId={projectId}
        />
      </div>
    </div>
  );
}

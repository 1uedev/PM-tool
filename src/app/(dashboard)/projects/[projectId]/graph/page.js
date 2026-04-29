import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";
import ArtifactGraph from "@/components/graph/ArtifactGraph.jsx";

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
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {membership.project.name}
        </Link>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-1.5">
          <Network className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">Artifact Graph</span>
        </div>
      </header>

      {/* Graph canvas — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        <ArtifactGraph projectId={projectId} />
      </div>
    </div>
  );
}

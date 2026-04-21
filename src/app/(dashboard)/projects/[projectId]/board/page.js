import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import BoardView from "@/components/board/BoardView.jsx";

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
      {/* Top bar */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/projects" className="text-gray-500 hover:text-gray-900">Projekte</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-900">
            {membership.project.name}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium text-gray-900">Board</span>
        </div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Explorer
        </Link>
      </header>

      <BoardView projectId={projectId} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import { Settings } from "lucide-react";
import Button from "@/components/ui/Button.jsx";

export default async function ProjectPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId } },
    include: { project: true },
  });

  if (!membership) notFound();

  const { project } = membership;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
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

      <main className="flex flex-1 items-center justify-center text-gray-400">
        <p className="text-sm">Explorer wird in Schritt 6 implementiert.</p>
      </main>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import DocumentImport from "@/components/import/DocumentImport.jsx";
import ProjectNavBar from "@/components/layout/ProjectNavBar.jsx";

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return { title: project ? `${project.name} — Import · PM Copilot` : "PM Copilot" };
}

export default async function ImportPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId } },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!membership) notFound();

  if (membership.role === "VIEWER") {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
        Nur Editoren und Owner können Dokumente importieren.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ProjectNavBar projectId={projectId} projectName={membership.project.name} role={membership.role} />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-lg font-semibold text-gray-900">Artefakte aus Dokumenten importieren</h1>
          <p className="mt-1 text-sm text-gray-500">
            Lade ein PRD, eine Spezifikation oder andere Projektdokumente hoch. Die KI analysiert den Inhalt
            und schlägt passende Artefakte vor, die du mit einem Klick in dein Projekt übernehmen kannst.
          </p>
        </div>

        <DocumentImport projectId={projectId} />
      </div>
    </div>
  );
}

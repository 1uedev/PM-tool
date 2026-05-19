import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import ProjectForm from "@/components/projects/ProjectForm.jsx";
import ProjectSettingsActions from "@/components/projects/ProjectSettingsActions.jsx";
import MembersSection from "@/components/projects/members/MembersSection.jsx";
import ExportSection from "@/components/projects/ExportSection.jsx";
import SaveAsTemplateDialog from "@/components/projects/SaveAsTemplateDialog.jsx";

export const metadata = { title: "Projekteinstellungen — PM Copilot" };

async function getProject(projectId, userId) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    include: { project: true },
  });
  return membership ?? null;
}

export default async function ProjectSettingsPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const membership = await getProject(projectId, session.user.id);

  if (!membership) notFound();

  const { project, role } = membership;

  const artifacts = role === "OWNER"
    ? await prisma.artifact.findMany({
        where: { projectId, deleted: false },
        select: { id: true, type: true, title: true },
        orderBy: [{ type: "asc" }, { createdAt: "asc" }],
      })
    : [];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <h1 className="text-base font-semibold text-gray-900">
          Einstellungen — {project.name}
        </h1>
        <Link href={`/projects/${projectId}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Explorer
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-2xl flex flex-col gap-10">
        <section>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Allgemein
          </h2>
          <ProjectForm project={project} />
        </section>

        {/* Members section — visible to all, but invite/role-change only for OWNER */}
        <section>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Mitglieder
          </h2>
          <MembersSection projectId={projectId} isOwner={role === "OWNER"} />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Export
          </h2>
          <ExportSection projectId={projectId} projectName={project.name} />
        </section>

        {role === "OWNER" && (
          <section>
            <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Vorlage
            </h2>
            <p className="mb-3 text-sm text-gray-500">
              Speichere dieses Projekt als Vorlage, um neue Projekte mit der gleichen Struktur schnell zu starten.
            </p>
            <SaveAsTemplateDialog project={project} artifacts={artifacts} />
          </section>
        )}

        {role === "OWNER" && (
          <section>
            <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Aktionen
            </h2>
            <ProjectSettingsActions project={project} />
          </section>
        )}
      </main>
    </div>
  );
}

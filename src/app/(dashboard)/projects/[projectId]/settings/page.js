import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import ProjectForm from "@/components/projects/ProjectForm.jsx";
import ProjectSettingsActions from "@/components/projects/ProjectSettingsActions.jsx";

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

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
        <h1 className="text-base font-semibold text-gray-900">
          Einstellungen — {project.name}
        </h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl flex flex-col gap-10">
        <section>
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Allgemein
          </h2>
          <ProjectForm project={project} />
        </section>

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

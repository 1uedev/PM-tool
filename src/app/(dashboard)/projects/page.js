import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import ProjectList from "@/components/projects/ProjectList.jsx";
import Button from "@/components/ui/Button.jsx";
import { Plus } from "lucide-react";

export const metadata = { title: "Projekte — PM Copilot" };

async function getProjects(userId) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          _count: { select: { artifacts: { where: { deleted: false } } } },
        },
      },
    },
    orderBy: { project: { updatedAt: "desc" } },
  });

  return memberships.map(({ role, project }) => ({
    ...project,
    role,
    artifactCount: project._count.artifacts,
  }));
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const projects = await getProjects(session.user.id);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
        <h1 className="text-base font-semibold text-gray-900">Projekte</h1>
        <Button href="/projects/new">
          <Plus className="h-4 w-4" />
          Neues Projekt
        </Button>
      </header>

      <main className="flex-1 p-6">
        <ProjectList projects={projects} />
      </main>
    </div>
  );
}

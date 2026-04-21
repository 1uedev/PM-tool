import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import prisma from "@/lib/prisma.js";
import Link from "next/link";
import ProgressOverview from "@/components/progress/ProgressOverview.jsx";

async function getProgressData(projectId, userId) {
  const [membership, artifacts] = await Promise.all([
    prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
      include: { project: { select: { name: true } } },
    }),
    prisma.artifact.findMany({
      where: { projectId, deleted: false },
      select: { type: true, status: true },
    }),
  ]);
  return { membership, artifacts };
}

const TYPE_ORDER = [
  "USER_PERSONA",
  "PROBLEM_HYPOTHESIS",
  "PRODUCT_VISION",
  "USE_CASE",
  "USER_STORY",
  "FUNCTIONAL_REQUIREMENT",
];

function computeProgress(artifacts) {
  const phases = TYPE_ORDER.map((type) => {
    const ofType = artifacts.filter((a) => a.type === type);
    const total = ofType.length;
    const done = ofType.filter((a) => a.status === "DONE").length;
    const inReview = ofType.filter((a) => a.status === "IN_REVIEW").length;
    const draft = ofType.filter((a) => a.status === "DRAFT").length;
    return {
      type, total, done, inReview, draft,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      missing: total === 0,
    };
  });

  const totalArtifacts = artifacts.length;
  const totalDone = artifacts.filter((a) => a.status === "DONE").length;
  const overallProgress = totalArtifacts > 0 ? Math.round((totalDone / totalArtifacts) * 100) : 0;
  const missingTypes = phases.filter((p) => p.missing).length;

  return { phases, totalArtifacts, totalDone, overallProgress, missingTypes };
}

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return { title: project ? `Fortschritt — ${project.name} — PM Copilot` : "PM Copilot" };
}

export default async function ProgressPage({ params }) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const { membership, artifacts } = await getProgressData(projectId, session.user.id);

  if (!membership) notFound();

  const data = computeProgress(artifacts);

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
          <span className="font-medium text-gray-900">Fortschritt</span>
        </div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Explorer
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <ProgressOverview data={data} projectId={projectId} />
      </div>
    </div>
  );
}

import { withProjectRoute } from "@/lib/middleware/with-project-route.js";
import prisma from "@/lib/prisma.js";
import { ARTIFACT_TYPE_LABELS } from "@/lib/constants.js";
import { generateProjectReport } from "@/lib/pdf/generateProjectReport.js";

// GET /api/projects/:id/export?format=json|csv|pdf
export const GET = withProjectRoute({ role: "VIEWER" }, async (request, { params }) => {
  const { projectId } = params;

  const format = new URL(request.url).searchParams.get("format") ?? "json";

  const [project, artifacts] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, description: true, status: true, createdAt: true },
    }),
    prisma.artifact.findMany({
      where: { projectId, deleted: false },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
      select: {
        id: true, type: true, title: true, status: true,
        fields: true, createdAt: true, updatedAt: true,
      },
    }),
  ]);

  const filename = `${project.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export`;

  if (format === "csv") {
    const rows = [
      ["id", "type", "type_label", "title", "status", "createdAt", "updatedAt", "fields"],
      ...artifacts.map((a) => [
        a.id,
        a.type,
        ARTIFACT_TYPE_LABELS[a.type] ?? a.type,
        `"${(a.title ?? "").replace(/"/g, '""')}"`,
        a.status,
        new Date(a.createdAt).toISOString(),
        new Date(a.updatedAt).toISOString(),
        `"${JSON.stringify(a.fields ?? {}).replace(/"/g, '""')}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await generateProjectReport(project, artifacts);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  // Default: JSON
  const payload = {
    exportedAt: new Date().toISOString(),
    project,
    artifacts: artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      status: a.status,
      fields: a.fields,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.json"`,
    },
  });
});

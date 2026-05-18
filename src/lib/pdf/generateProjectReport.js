import PDFDocument from "pdfkit";
import { ARTIFACT_TYPE_LABELS, ARTIFACT_GROUPS } from "@/lib/constants.js";
import { ARTIFACT_FIELD_DEFS } from "@/lib/artifactFields.js";

// ─── Helpers ───────────────────────────────────────────────────────────────

function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseFields(raw) {
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw ?? {};
}

function getFieldLabel(type, key) {
  const defs = ARTIFACT_FIELD_DEFS[type];
  if (!Array.isArray(defs)) return key;
  return defs.find((d) => d.key === key)?.label ?? key;
}

const STATUS_LABELS = { DRAFT: "Entwurf", IN_REVIEW: "In Prüfung", DONE: "Fertig" };
const PROJECT_STATUS_LABELS = { ACTIVE: "Aktiv", ARCHIVED: "Archiviert" };

// ─── Color palette ────────────────────────────────────────────────────────

const C = {
  primary:   "#1d4ed8",
  dark:      "#111827",
  mid:       "#374151",
  gray:      "#6b7280",
  lightLine: "#e5e7eb",
  divider:   "#d1d5db",
  statusDot: { DRAFT: "#9ca3af", IN_REVIEW: "#fbbf24", DONE: "#22c55e" },
};

// ─── Layout constants ─────────────────────────────────────────────────────

const MARGIN = 50;
const PAGE_H = 841; // A4 height in points

// ─── Drawing helpers ──────────────────────────────────────────────────────

function hRule(doc, color = C.divider, weight = 0.5) {
  const w = doc.page.width - MARGIN * 2;
  doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + w, doc.y)
    .strokeColor(color).lineWidth(weight).stroke();
}

function needsNewPage(doc, reserve = 120) {
  return doc.y > PAGE_H - MARGIN - reserve;
}

// ─── Main export ──────────────────────────────────────────────────────────

/**
 * Generates a PDF report Buffer for a project.
 * @param {object} project  - { id, name, description, status, createdAt }
 * @param {object[]} artifacts - sorted artifact list
 * @returns {Promise<Buffer>}
 */
export function generateProjectReport(project, artifacts) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: { Title: project.name, Author: "PM Copilot", Subject: "Projektbericht" },
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width - MARGIN * 2;

    // ── Cover ──────────────────────────────────────────────────────────────
    doc.fillColor(C.primary).fontSize(26).font("Helvetica-Bold").text(project.name, { width: W });
    doc.moveDown(0.4);

    if (project.description) {
      doc.fillColor(C.mid).fontSize(11).font("Helvetica").text(project.description, { width: W });
      doc.moveDown(0.4);
    }

    const statusStr = PROJECT_STATUS_LABELS[project.status] ?? project.status;
    const dateStr = new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
    doc.fillColor(C.gray).fontSize(9).font("Helvetica")
      .text(`Status: ${statusStr}   ·   Exportiert: ${dateStr}   ·   PM Copilot`, { width: W });

    doc.moveDown(1);
    hRule(doc, C.primary, 1.5);
    doc.moveDown(1);

    // ── Summary ────────────────────────────────────────────────────────────
    doc.fillColor(C.dark).fontSize(14).font("Helvetica-Bold").text("Zusammenfassung", { width: W });
    doc.moveDown(0.6);

    // Build group counts
    const countByType = {};
    for (const a of artifacts) countByType[a.type] = (countByType[a.type] ?? 0) + 1;

    const groupStats = ARTIFACT_GROUPS
      .map((g) => ({
        label: g.label,
        count: g.types.reduce((s, t) => s + (countByType[t] ?? 0), 0),
      }))
      .filter((g) => g.count > 0);

    // Two-column grid
    const colW = W / 2;
    const rowH = 28;
    const gridStartY = doc.y;

    groupStats.forEach(({ label, count }, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = MARGIN + col * colW;
      const y = gridStartY + row * rowH;
      doc.fillColor(C.primary).fontSize(16).font("Helvetica-Bold").text(String(count), x, y, { width: 35 });
      doc.fillColor(C.mid).fontSize(10).font("Helvetica").text(label, x + 36, y + 3, { width: colW - 40 });
    });

    const gridRows = Math.ceil(groupStats.length / 2);
    doc.y = gridStartY + gridRows * rowH + 6;
    doc.moveDown(0.5);

    doc.fillColor(C.gray).fontSize(9).font("Helvetica")
      .text(`${artifacts.length} Artefakte gesamt`, { width: W });

    doc.moveDown(1);
    hRule(doc);
    doc.moveDown(0.8);

    // ── Artifacts by group ─────────────────────────────────────────────────
    for (const group of ARTIFACT_GROUPS) {
      const groupArtifacts = artifacts.filter((a) => group.types.includes(a.type));
      if (groupArtifacts.length === 0) continue;

      // Group starts on a new page
      doc.addPage();

      // Group header
      doc.fillColor(C.primary).fontSize(18).font("Helvetica-Bold").text(group.label, { width: W });
      doc.moveDown(0.3);
      hRule(doc, C.primary, 2);
      doc.moveDown(0.8);

      // Sort by type order within group, then title
      const sorted = [...groupArtifacts].sort((a, b) => {
        const ta = group.types.indexOf(a.type);
        const tb = group.types.indexOf(b.type);
        if (ta !== tb) return ta - tb;
        return a.title.localeCompare(b.title, "de");
      });

      for (const artifact of sorted) {
        const fields = parseFields(artifact.fields);
        const fieldEntries = Object.entries(fields)
          .map(([key, val]) => ({ key, label: getFieldLabel(artifact.type, key), text: stripHtml(String(val ?? "")) }))
          .filter((f) => f.text);

        // Estimate height needed (rough: title + type + 20px per field line)
        const estimatedH = 45 + fieldEntries.reduce((s, f) => s + Math.max(1, Math.ceil(f.text.length / 80)) * 14, 0);
        if (needsNewPage(doc, estimatedH)) doc.addPage();

        // Artifact title
        doc.fillColor(C.dark).fontSize(12).font("Helvetica-Bold").text(artifact.title, MARGIN, doc.y, { width: W - 60 });

        // Status dot + label — same line, right-aligned
        const statusY = doc.y - 14;
        const statusLabel = STATUS_LABELS[artifact.status] ?? artifact.status;
        const dotColor = C.statusDot[artifact.status] ?? C.statusDot.DRAFT;
        const dotX = MARGIN + W - 55;
        doc.circle(dotX, statusY + 5, 4).fillColor(dotColor).fill();
        doc.fillColor(C.gray).fontSize(9).font("Helvetica").text(statusLabel, dotX + 8, statusY + 1, { width: 50 });

        doc.moveDown(0.1);

        // Type label
        doc.fillColor(C.gray).fontSize(8).font("Helvetica")
          .text(ARTIFACT_TYPE_LABELS[artifact.type] ?? artifact.type, { width: W });
        doc.moveDown(0.4);

        // Field values
        for (const { label, text } of fieldEntries) {
          if (needsNewPage(doc, 60)) doc.addPage();
          doc.fillColor(C.gray).fontSize(8).font("Helvetica-Bold").text(label, { width: W });
          doc.fillColor(C.mid).fontSize(9).font("Helvetica").text(text, { width: W, indent: 0 });
          doc.moveDown(0.3);
        }

        doc.moveDown(0.3);
        hRule(doc, C.lightLine, 0.5);
        doc.moveDown(0.5);
      }
    }

    doc.end();
  });
}

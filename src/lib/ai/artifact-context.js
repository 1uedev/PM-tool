// Shared helpers for building the AI context around a single artifact —
// used by both the suggestion route and the AI chat route so the two stay
// in sync.

// Prisma include that loads an artifact's related artifacts (both directions)
// with just the fields needed for context.
export const ARTIFACT_CONTEXT_INCLUDE = {
  relationsFrom: {
    include: { target: { select: { type: true, title: true, fields: true } } },
  },
  relationsTo: {
    include: { source: { select: { type: true, title: true, fields: true } } },
  },
};

// Caps so a heavily linked artifact cannot blow up the prompt.
const MAX_CONTEXT_ARTIFACTS = 10;
const MAX_CONTEXT_CHARS_PER_ARTIFACT = 300;

/**
 * Builds a plain-text context string from an artifact's related artifacts.
 * Expects the artifact to have been loaded with ARTIFACT_CONTEXT_INCLUDE.
 * Returns "" when there are no related artifacts.
 */
export function buildRelatedContext(artifact) {
  const related = [
    ...(artifact.relationsFrom ?? []).map((r) => r.target),
    ...(artifact.relationsTo ?? []).map((r) => r.source),
  ]
    .filter(Boolean)
    .slice(0, MAX_CONTEXT_ARTIFACTS);

  if (related.length === 0) return "";

  return related
    .map((a) => {
      const fields = typeof a.fields === "string" ? JSON.parse(a.fields) : a.fields;
      const values = Object.values(fields ?? {})
        .filter(Boolean)
        .join(" | ")
        .slice(0, MAX_CONTEXT_CHARS_PER_ARTIFACT);
      return `[${a.type}] ${a.title}: ${values}`;
    })
    .join("\n");
}

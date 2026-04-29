/**
 * AI-powered document extraction.
 * Analyzes uploaded document text and proposes PM artifacts to create.
 */

// Artifact types that can reasonably be extracted from documents
const EXTRACTABLE_TYPES = [
  "PRODUCT_VISION",
  "PROBLEM_STATEMENT",
  "GOALS_NON_GOALS",
  "USER_PERSONA",
  "BUYER_PERSONA",
  "STAKEHOLDER",
  "ASSUMPTION",
  "MARKET_ANALYSIS",
  "COMPETITOR",
  "VALUE_PROPOSITION",
  "KPI_OKR",
  "USE_CASE",
  "FEATURE",
];

// Field schema for extraction — subset of artifactFields used in the prompt
const TYPE_SCHEMAS = {
  PRODUCT_VISION: {
    fields: ["oneLiner", "targetUsers", "valueProposition"],
    description: "Overall product direction, elevator pitch, or product vision statement",
  },
  PROBLEM_STATEMENT: {
    fields: ["problem", "context", "impact", "currentSolution"],
    description: "A clearly described user or business problem",
  },
  GOALS_NON_GOALS: {
    fields: ["goals", "nonGoals", "rationale"],
    description: "Project scope boundaries: what is in and out of scope",
  },
  USER_PERSONA: {
    fields: ["name", "goals", "painPoints", "context"],
    description: "A fictional user archetype representing a target user segment",
  },
  BUYER_PERSONA: {
    fields: ["name", "role", "goals", "painPoints", "buyingCriteria"],
    description: "A buyer decision-maker persona (B2B context)",
  },
  STAKEHOLDER: {
    fields: ["name", "role", "involvement", "responsibility", "contact"],
    description: "A person or group with interest or influence in the project",
  },
  ASSUMPTION: {
    fields: ["assumption", "rationale", "impact", "validatedBy", "owner"],
    description: "An unvalidated belief or premise the team is working with",
  },
  MARKET_ANALYSIS: {
    fields: ["summary", "marketSize", "trends", "sources"],
    description: "Market size, landscape, and trends",
  },
  COMPETITOR: {
    fields: ["name", "strengths", "weaknesses", "positioning", "differentiator"],
    description: "A competing product or company",
  },
  VALUE_PROPOSITION: {
    fields: ["statement", "targetCustomer", "keyBenefit", "differentiator"],
    description: "The core value promise to customers",
  },
  KPI_OKR: {
    fields: ["objective", "keyResults", "metrics", "timeframe", "owner"],
    description: "Objectives, key results, or KPIs",
  },
  USE_CASE: {
    fields: ["actor", "goal", "flow", "preconditions"],
    description: "A user-goal interaction with the system",
  },
  FEATURE: {
    fields: ["description", "userValue", "inScope", "outOfScope", "priority"],
    description: "A product feature or capability",
  },
};

/**
 * Builds the extraction prompt for the AI.
 * @param {string} documentText - Extracted plain text from the uploaded document(s)
 * @returns {string}
 */
export function buildExtractionPrompt(documentText) {
  const typeDescriptions = EXTRACTABLE_TYPES.map((type) => {
    const schema = TYPE_SCHEMAS[type];
    return `- ${type}: ${schema.description}. Fields: ${schema.fields.join(", ")}`;
  }).join("\n");

  return `You are a product management expert. Analyze the following document and extract structured PM artifacts from it.

For each artifact you find, output a JSON object with:
- "type": one of the supported types (listed below)
- "title": a concise, descriptive title (max 80 chars)
- "fields": an object with the type-specific fields filled in from the document content

Only extract artifacts that have clear supporting content in the document. Do not invent content that is not in the document.

Supported artifact types and their fields:
${typeDescriptions}

Return ONLY a valid JSON array of artifact objects, wrapped in a markdown code block like this:
\`\`\`json
[
  {
    "type": "PRODUCT_VISION",
    "title": "...",
    "fields": {
      "oneLiner": "...",
      "targetUsers": "...",
      "valueProposition": "..."
    }
  }
]
\`\`\`

If a field cannot be filled from the document, set it to an empty string "".
If no artifacts can be extracted, return an empty array [].

---

DOCUMENT CONTENT:
${documentText.slice(0, 20000)}`;
}

/**
 * Parses the AI response and returns an array of artifact proposals.
 * @param {string} responseText
 * @returns {Array<{ type: string, title: string, fields: object }>}
 */
export function parseExtractionResponse(responseText) {
  try {
    // Extract JSON from markdown code block
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = match ? match[1].trim() : responseText.trim();
    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => {
        return (
          typeof item === "object" &&
          item !== null &&
          EXTRACTABLE_TYPES.includes(item.type) &&
          typeof item.title === "string" &&
          item.title.trim().length > 0 &&
          typeof item.fields === "object" &&
          item.fields !== null
        );
      })
      .map((item) => {
        // Ensure only valid field keys are included, fill missing with ""
        const schema = TYPE_SCHEMAS[item.type];
        const cleanFields = {};
        for (const key of schema.fields) {
          cleanFields[key] = typeof item.fields[key] === "string" ? item.fields[key] : "";
        }
        return {
          type: item.type,
          title: item.title.trim().slice(0, 80),
          fields: cleanFields,
        };
      });
  } catch {
    return [];
  }
}

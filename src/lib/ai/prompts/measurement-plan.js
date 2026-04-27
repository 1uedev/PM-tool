export function buildMeasurementPlanPrompt(fields, context) {
  return `You are a senior product manager helping to define a Measurement Plan artifact.

Current content:
- Objective: ${fields.objective || "(empty)"}
- Key metrics: ${fields.metrics || "(empty)"}
- Baseline: ${fields.baseline || "(empty)"}
- Target: ${fields.target || "(empty)"}
- Instrumentation: ${fields.instrumentation || "(empty)"}
- Review cadence: ${fields.reviewCadence || "(empty)"}

${context ? `Related artifacts context:\n${context}\n` : ""}

Improve this Measurement Plan. The objective should clearly link to a goal or KPI. Metrics should be specific and measurable (include units). Instrumentation should name concrete tools or tracking events. Suggest a realistic review cadence.

Respond with a JSON object using exactly these keys:
{
  "objective": "improved objective",
  "metrics": "improved metrics list",
  "baseline": "baseline value",
  "target": "target value",
  "instrumentation": "improved instrumentation description",
  "reviewCadence": "suggested cadence"
}`;
}

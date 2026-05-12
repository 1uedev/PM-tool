import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function GoalsNonGoalsFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">In Scope</p>
        <FieldTextarea
          label="Goals — What this will achieve"
          value={fields.goals}
          onChange={(v) => onChange("goals", v)}
          disabled={disabled}
          placeholder="What outcomes, capabilities, or results are we committing to deliver?"
          rows={4}
          rich
        />
      </div>

      <SectionDivider label="Boundary" />

      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700">Out of Scope</p>
        <FieldTextarea
          label="Non-Goals — What this will NOT do"
          value={fields.nonGoals}
          onChange={(v) => onChange("nonGoals", v)}
          disabled={disabled}
          placeholder="What are we explicitly not doing? List things that might seem related but are out of scope."
          rows={4}
          rich
        />
      </div>

      <FieldGroup>
        <FieldTextarea
          label="Rationale"
          value={fields.rationale}
          onChange={(v) => onChange("rationale", v)}
          disabled={disabled}
          placeholder="Why were these boundaries set? What constraints or decisions drove them?"
          rows={3}
          rich
        />
      </FieldGroup>
    </div>
  );
}

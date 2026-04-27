import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function ProblemStatementFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Clear and specific">The problem</FieldLabel>
        <FieldTextarea fieldKey="problem" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="What specific problem exists? Who experiences it?" rows={3} />
      </FieldGroup>

      <SectionDivider label="Context" />

      <FieldGroup>
        <FieldLabel hint="Situation, trigger, environment">Context</FieldLabel>
        <FieldTextarea fieldKey="context" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="When and where does the problem occur? What triggers it?" rows={2} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="User & business">Impact</FieldLabel>
        <FieldTextarea fieldKey="impact" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="How severely does this affect users or the business? What happens if it stays unsolved?" rows={3} />
      </FieldGroup>

      <SectionDivider label="Current solution" />

      <FieldGroup>
        <FieldLabel hint="Workaround or status quo">How users solve it today</FieldLabel>
        <FieldTextarea fieldKey="currentSolution" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="How is the problem handled today? (manual process, spreadsheet, existing tool, phone calls…)" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="The gap that justifies building something new">Why the current solution is insufficient</FieldLabel>
        <FieldTextarea fieldKey="whyInsufficient" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Why does the current approach fall short? (too slow, too expensive, unreliable, doesn't scale, poor UX, risky…)" rows={3} />
      </FieldGroup>
    </div>
  );
}

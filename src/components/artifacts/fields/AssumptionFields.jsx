import { FieldGroup, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function AssumptionFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Assumption</p>
        <FieldTextarea
          label="We are assuming that…"
          value={fields.assumption}
          onChange={(v) => onChange("assumption", v)}
          disabled={disabled}
          placeholder="State the assumption clearly and specifically. What are we treating as true without full evidence?"
          rows={3}
        />
      </div>

      <FieldGroup>
        <FieldTextarea
          label="Rationale"
          value={fields.rationale}
          onChange={(v) => onChange("rationale", v)}
          disabled={disabled}
          placeholder="Why are we making this assumption? What evidence or reasoning supports it?"
          rows={3}
        />
      </FieldGroup>

      <SectionDivider label="Risk & Validation" />

      <FieldGroup>
        <FieldTextarea
          label="Impact if wrong"
          value={fields.impact}
          onChange={(v) => onChange("impact", v)}
          disabled={disabled}
          placeholder="What happens to the plan if this assumption turns out to be false?"
          rows={3}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldTextarea
            label="How to validate"
            value={fields.validatedBy}
            onChange={(v) => onChange("validatedBy", v)}
            disabled={disabled}
            placeholder="What test, research, or data would confirm or disprove this?"
            rows={3}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldInput
            label="Owner"
            value={fields.owner}
            onChange={(v) => onChange("owner", v)}
            disabled={disabled}
            placeholder="Who is responsible for validating this?"
          />
        </FieldGroup>
      </div>
    </div>
  );
}

import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

const CONSTRAINT_TYPES = ["Technical", "Budget", "Regulatory", "Time", "Resource"];

export default function ConstraintFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-700">Constraint</p>
        <FieldTextarea
          label="We are constrained by…"
          value={fields.constraint}
          onChange={(v) => onChange("constraint", v)}
          disabled={disabled}
          placeholder="State the constraint clearly. What limit, boundary, or non-negotiable condition applies?"
          rows={3}
        />
      </div>

      <FieldGroup>
        <FieldLabel>Type</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {CONSTRAINT_TYPES.map((type) => (
            <label
              key={type}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors
                ${fields.type === type
                  ? "border-orange-400 bg-orange-50 font-medium text-orange-800"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="constraintType"
                value={type}
                checked={fields.type === type}
                onChange={() => onChange("type", type)}
                disabled={disabled}
                className="sr-only"
              />
              {type}
            </label>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup>
        <FieldTextarea
          label="Rationale"
          value={fields.rationale}
          onChange={(v) => onChange("rationale", v)}
          disabled={disabled}
          placeholder="Why does this constraint exist? Where does it come from?"
          rows={3}
        />
      </FieldGroup>

      <SectionDivider label="Impact" />

      <FieldGroup>
        <FieldTextarea
          label="Impact on project"
          value={fields.impact}
          onChange={(v) => onChange("impact", v)}
          disabled={disabled}
          placeholder="How does this constraint affect scope, timeline, design decisions, or team capacity?"
          rows={3}
        />
      </FieldGroup>
    </div>
  );
}

import { FieldGroup, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function ComplianceRequirementFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700">Compliance Requirement</p>
        <FieldTextarea
          label="Requirement"
          value={fields.requirement}
          onChange={(v) => onChange("requirement", v)}
          disabled={disabled}
          placeholder="State the compliance requirement precisely. What must the system or process do or avoid?"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldInput
            label="Regulation / Standard"
            value={fields.regulation}
            onChange={(v) => onChange("regulation", v)}
            disabled={disabled}
            placeholder="e.g. GDPR Art. 17, ISO 27001, SOC 2"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldInput
            label="Deadline"
            value={fields.deadline}
            onChange={(v) => onChange("deadline", v)}
            disabled={disabled}
            placeholder="e.g. 2026-08-01 or at launch"
          />
        </FieldGroup>
      </div>

      <SectionDivider label="Implementation" />

      <FieldGroup>
        <FieldTextarea
          label="Scope"
          value={fields.scope}
          onChange={(v) => onChange("scope", v)}
          disabled={disabled}
          placeholder="Which parts of the system, data, or processes does this requirement apply to?"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldTextarea
          label="Implementation approach"
          value={fields.implementation}
          onChange={(v) => onChange("implementation", v)}
          disabled={disabled}
          placeholder="How will this requirement be satisfied? What technical or process controls are planned?"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldInput
          label="Owner"
          value={fields.owner}
          onChange={(v) => onChange("owner", v)}
          disabled={disabled}
          placeholder="Who is accountable for ensuring compliance?"
        />
      </FieldGroup>
    </div>
  );
}

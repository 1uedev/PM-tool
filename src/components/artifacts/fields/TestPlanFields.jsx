import { FieldGroup, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function TestPlanFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <FieldTextarea
          label="Scope"
          value={fields.scope}
          onChange={(v) => onChange("scope", v)}
          disabled={disabled}
          placeholder="What features, flows, or requirements does this test plan cover?"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldTextarea
          label="Test approach"
          value={fields.approach}
          onChange={(v) => onChange("approach", v)}
          disabled={disabled}
          placeholder="How will testing be conducted? (e.g. manual, automated, exploratory, regression, load testing)"
          rows={4}
        />
      </FieldGroup>

      <SectionDivider label="Entry & Exit Criteria" />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldTextarea
            label="Entry criteria"
            value={fields.entryCriteria}
            onChange={(v) => onChange("entryCriteria", v)}
            disabled={disabled}
            placeholder="What must be true before testing starts?"
            rows={3}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldTextarea
            label="Exit criteria"
            value={fields.exitCriteria}
            onChange={(v) => onChange("exitCriteria", v)}
            disabled={disabled}
            placeholder="What conditions must be met before testing is complete?"
            rows={3}
          />
        </FieldGroup>
      </div>

      <SectionDivider label="Risks & Ownership" />

      <FieldGroup>
        <FieldTextarea
          label="Test risks"
          value={fields.risks}
          onChange={(v) => onChange("risks", v)}
          disabled={disabled}
          placeholder="What could prevent thorough testing? (e.g. missing test environments, data gaps, time pressure)"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldInput
          label="Owner"
          value={fields.owner}
          onChange={(v) => onChange("owner", v)}
          disabled={disabled}
          placeholder="Who is responsible for executing this test plan?"
        />
      </FieldGroup>
    </div>
  );
}

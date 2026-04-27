import { FieldGroup, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function MeasurementPlanFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <FieldTextarea
          label="Objective"
          value={fields.objective}
          onChange={(v) => onChange("objective", v)}
          disabled={disabled}
          placeholder="What outcome or behavior are we measuring? Link to a KPI/OKR or Goal."
          rows={3}
        />
      </FieldGroup>

      <SectionDivider label="Metrics" />

      <FieldGroup>
        <FieldTextarea
          label="Key metrics"
          value={fields.metrics}
          onChange={(v) => onChange("metrics", v)}
          disabled={disabled}
          placeholder="List the specific metrics, events, or KPIs to track. Include units and calculation method."
          rows={4}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldInput
            label="Baseline"
            value={fields.baseline}
            onChange={(v) => onChange("baseline", v)}
            disabled={disabled}
            placeholder="Current value before the change"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldInput
            label="Target"
            value={fields.target}
            onChange={(v) => onChange("target", v)}
            disabled={disabled}
            placeholder="Goal value / success threshold"
          />
        </FieldGroup>
      </div>

      <SectionDivider label="Implementation" />

      <FieldGroup>
        <FieldTextarea
          label="Instrumentation"
          value={fields.instrumentation}
          onChange={(v) => onChange("instrumentation", v)}
          disabled={disabled}
          placeholder="How will we collect this data? What tracking events, dashboards, or tools are used?"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldInput
          label="Review cadence"
          value={fields.reviewCadence}
          onChange={(v) => onChange("reviewCadence", v)}
          disabled={disabled}
          placeholder="e.g. Weekly, Monthly, After each release"
        />
      </FieldGroup>
    </div>
  );
}

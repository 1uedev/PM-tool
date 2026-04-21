import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function RiskFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was könnte schiefgehen?">Risikobeschreibung</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was könnte schiefgehen?" rows={3} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Hoch / Mittel / Niedrig">Wahrscheinlichkeit</FieldLabel>
          <FieldInput fieldKey="probability" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Hoch / Mittel / Niedrig" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Hoch / Mittel / Niedrig">Auswirkung</FieldLabel>
          <FieldTextarea fieldKey="impact" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Hoch / Mittel / Niedrig — Begründung" rows={2} />
        </FieldGroup>
      </div>

      <SectionDivider label="Maßnahmen" />

      <FieldGroup>
        <FieldLabel hint="Wie reduzieren oder verhindern wir das Risiko?">Mitigationsstrategie</FieldLabel>
        <FieldTextarea fieldKey="mitigation" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Wie reduzieren oder verhindern wir das Risiko?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Wer überwacht dieses Risiko?">Verantwortlicher</FieldLabel>
        <FieldInput fieldKey="owner" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Wer überwacht dieses Risiko?" />
      </FieldGroup>
    </div>
  );
}

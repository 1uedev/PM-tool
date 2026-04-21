import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function FeatureFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was macht dieses Feature?">Beschreibung</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was macht dieses Feature?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Warum braucht der Nutzer das?">Nutzen für den User</FieldLabel>
        <FieldTextarea fieldKey="userValue" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welchen Wert bringt es dem Nutzer?" rows={2} />
      </FieldGroup>

      <SectionDivider label="Scope" />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Explizit enthalten">Im Scope</FieldLabel>
          <FieldTextarea fieldKey="inScope" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Was ist explizit enthalten?" rows={3} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Explizit ausgeschlossen">Nicht im Scope</FieldLabel>
          <FieldTextarea fieldKey="outOfScope" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Was ist explizit ausgeschlossen?" rows={3} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="Hoch / Mittel / Niedrig">Priorität</FieldLabel>
        <FieldInput fieldKey="priority" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Hoch / Mittel / Niedrig — Begründung" />
      </FieldGroup>
    </div>
  );
}

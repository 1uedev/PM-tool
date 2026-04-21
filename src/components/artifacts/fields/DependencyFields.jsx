import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function DependencyFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was hängt von was ab?">Beschreibung der Abhängigkeit</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was hängt von was ab?" rows={3} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Team, System, Feature oder externer Partner">Abhängig von</FieldLabel>
          <FieldInput fieldKey="dependsOn" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Team, System, Feature oder externem Partner" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Intern / Extern / Technisch / Organisatorisch">Typ</FieldLabel>
          <FieldInput fieldKey="type" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Intern / Extern / Technisch / Organisatorisch" />
        </FieldGroup>
      </div>

      <SectionDivider label="Konsequenzen" />

      <FieldGroup>
        <FieldLabel hint="Was passiert wenn nicht gelöst?">Auswirkung bei Nicht-Erfüllung</FieldLabel>
        <FieldTextarea fieldKey="impact" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was passiert, wenn die Abhängigkeit nicht gelöst wird?" rows={2} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Wer löst die Abhängigkeit?">Verantwortlicher</FieldLabel>
        <FieldInput fieldKey="owner" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Wer löst die Abhängigkeit?" />
      </FieldGroup>
    </div>
  );
}

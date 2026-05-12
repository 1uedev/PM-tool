import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function EpicFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was umfasst dieses Epic?">Beschreibung</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Was umfasst dieses Epic?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was soll erreicht werden?">Ziele</FieldLabel>
        <FieldTextarea fieldKey="goals" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Was soll mit diesem Epic erreicht werden?" rows={3} />
      </FieldGroup>

      <SectionDivider label="Abgrenzung" />

      <FieldGroup>
        <FieldLabel hint="Was ist enthalten, was nicht?">Scope</FieldLabel>
        <FieldTextarea fieldKey="scope" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Was ist enthalten, was nicht?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Wann gilt das Epic als abgeschlossen?">Erfolgskriterien</FieldLabel>
        <FieldTextarea fieldKey="successCriteria" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Wann gilt das Epic als abgeschlossen?" rows={3} />
      </FieldGroup>
    </div>
  );
}

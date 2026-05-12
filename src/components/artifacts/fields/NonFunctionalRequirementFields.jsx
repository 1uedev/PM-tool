import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function NonFunctionalRequirementFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Welche nicht-funktionale Eigenschaft ist gefordert?">Beschreibung</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Welche nicht-funktionale Eigenschaft ist gefordert?" rows={3} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Performance, Sicherheit, Zuverlässigkeit…">Kategorie</FieldLabel>
          <FieldInput fieldKey="category" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Performance / Sicherheit / Zuverlässigkeit / Skalierbarkeit / Usability…" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Konkret und messbar">Messbare Metrik</FieldLabel>
          <FieldInput fieldKey="metric" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. Antwortzeit < 200 ms bei 1000 gleichzeitigen Nutzern" />
        </FieldGroup>
      </div>

      <SectionDivider label="Akzeptanz" />

      <FieldGroup>
        <FieldLabel hint="Wann gilt die Anforderung als erfüllt?">Akzeptanzkriterien</FieldLabel>
        <FieldTextarea fieldKey="acceptanceCriteria" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Wann gilt die Anforderung als erfüllt?" rows={3} />
      </FieldGroup>
    </div>
  );
}

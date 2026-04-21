import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function ReleaseFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="z. B. 1.0.0, v2.3">Version</FieldLabel>
          <FieldInput fieldKey="version" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. 1.0.0, v2.3" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="z. B. 15. März 2025">Zieldatum</FieldLabel>
          <FieldInput fieldKey="targetDate" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. 15. März 2025" />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="Was wird ausgeliefert?">Beschreibung</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was wird in diesem Release ausgeliefert?" rows={3} />
      </FieldGroup>

      <SectionDivider label="Inhalte" />

      <FieldGroup>
        <FieldLabel hint="Was ist enthalten?">Scope / Enthaltene Features</FieldLabel>
        <FieldTextarea fieldKey="scope" fields={fields} onChange={onChange} disabled={disabled}
          placeholder={"- Feature A\n- Feature B\n…"} rows={4} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was ändert sich für den Nutzer?">Release Notes</FieldLabel>
        <FieldTextarea fieldKey="releaseNotes" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was ändert sich für den Nutzer?" rows={4} />
      </FieldGroup>
    </div>
  );
}

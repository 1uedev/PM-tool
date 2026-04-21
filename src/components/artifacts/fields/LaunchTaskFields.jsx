import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function LaunchTaskFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was muss für den Launch erledigt werden?">Aufgabenbeschreibung</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was muss für den Launch erledigt werden?" rows={3} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Wer ist zuständig?">Verantwortlicher</FieldLabel>
          <FieldInput fieldKey="owner" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wer ist zuständig?" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="z. B. 1 Woche vor Launch">Fälligkeitsdatum</FieldLabel>
          <FieldInput fieldKey="dueDate" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. 1 Woche vor Launch" />
        </FieldGroup>
      </div>

      <SectionDivider label="Checkliste" />

      <FieldGroup>
        <FieldLabel hint="Einzelne Schritte abhaken">Checkliste</FieldLabel>
        <FieldTextarea fieldKey="checklist" fields={fields} onChange={onChange} disabled={disabled}
          placeholder={"- [ ] Schritt 1\n- [ ] Schritt 2\n- [ ] Schritt 3\n…"} rows={4} />
      </FieldGroup>
    </div>
  );
}

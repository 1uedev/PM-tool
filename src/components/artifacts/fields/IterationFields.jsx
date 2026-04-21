import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function IterationFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was war Gegenstand dieser Iteration?">Beschreibung der Iteration</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was war Gegenstand dieser Iteration?" rows={2} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was haben wir gelernt?">Learnings</FieldLabel>
        <FieldTextarea fieldKey="learnings" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was haben wir gelernt?" rows={4} />
      </FieldGroup>

      <SectionDivider label="Nächste Schritte" />

      <FieldGroup>
        <FieldLabel hint="Was ändern wir konkret?">Verbesserungsmaßnahmen</FieldLabel>
        <FieldTextarea fieldKey="improvements" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was ändern wir konkret?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was machen wir als nächstes?">Nächste Schritte</FieldLabel>
        <FieldTextarea fieldKey="nextSteps" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was machen wir als nächstes?" rows={3} />
      </FieldGroup>
    </div>
  );
}

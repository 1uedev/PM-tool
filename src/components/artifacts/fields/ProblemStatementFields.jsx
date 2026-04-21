import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function ProblemStatementFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Klar und präzise formuliert">Das Problem</FieldLabel>
        <FieldTextarea fieldKey="problem" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welches konkrete Problem existiert? Wer hat es?" rows={3} />
      </FieldGroup>

      <SectionDivider label="Hintergrund" />

      <FieldGroup>
        <FieldLabel hint="Situation, Trigger, Umfeld">Kontext</FieldLabel>
        <FieldTextarea fieldKey="context" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="In welchem Kontext tritt das Problem auf? Wann und wo?" rows={2} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Nutzer & Business">Auswirkung</FieldLabel>
          <FieldTextarea fieldKey="impact" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wie stark betrifft das Problem Nutzer oder Business? Was passiert ohne Lösung?" rows={3} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Workaround oder Status quo">Aktuelle Lösung</FieldLabel>
          <FieldTextarea fieldKey="currentSolution" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wie wird das Problem heute gelöst (oder nicht)?" rows={3} />
        </FieldGroup>
      </div>
    </div>
  );
}

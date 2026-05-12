import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function ProblemHypothesisFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was ist das eigentliche Problem?">Problem</FieldLabel>
        <FieldTextarea
          fieldKey="problem"
          fields={fields}
          onChange={onChange}
          placeholder="Beschreibe das Problem so konkret wie möglich…"
          rows={4}
          rich
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Wen betrifft dieses Problem?">Zielgruppe</FieldLabel>
        <FieldInput
          fieldKey="targetAudience"
          fields={fields}
          onChange={onChange}
          placeholder="z. B. Technikaffine Hausbesitzer mit mehreren Smart-Home-Geräten"
          disabled={disabled}
        />
      </FieldGroup>

      <SectionDivider label="Hypothese" />

      <FieldGroup>
        <FieldLabel hint="Was nehmen wir an?">Annahme</FieldLabel>
        <FieldTextarea
          fieldKey="assumption"
          fields={fields}
          onChange={onChange}
          placeholder="Wir glauben, dass… / Eine einheitliche Lösung würde…"
          rows={3}
          rich
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Wie prüfen wir diese Annahme?">Validierungsansatz</FieldLabel>
        <FieldTextarea
          fieldKey="validation"
          fields={fields}
          onChange={onChange}
          placeholder="Nutzerinterviews, A/B-Tests, Prototyp-Tests…"
          rows={3}
          rich
          disabled={disabled}
        />
      </FieldGroup>
    </div>
  );
}

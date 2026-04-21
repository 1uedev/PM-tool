import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function UserJourneyFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Wer durchläuft die Journey?">Akteur / Persona</FieldLabel>
          <FieldInput fieldKey="actor" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. Max Müller, IT-Einkäufer" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="In welcher Situation?">Szenario</FieldLabel>
          <FieldTextarea fieldKey="scenario" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="In welcher Situation befinden wir uns?" rows={2} />
        </FieldGroup>
      </div>

      <SectionDivider label="Journey" />

      <FieldGroup>
        <FieldLabel hint="Aktion — Gedanken — Gefühl pro Schritt">Journey-Schritte</FieldLabel>
        <FieldTextarea fieldKey="steps" fields={fields} onChange={onChange} disabled={disabled}
          placeholder={"1. Schritt: Aktion — Gedanken — Gefühl\n2. Schritt: …\n3. Schritt: …"} rows={8} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Wo entstehen Reibung oder Frustration?">Pain Points</FieldLabel>
          <FieldTextarea fieldKey="painPoints" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wo hakt es in der Journey?" rows={3} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Wo können wir besser werden?">Verbesserungspotenziale</FieldLabel>
          <FieldTextarea fieldKey="opportunities" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wo können wir die Erfahrung verbessern?" rows={3} />
        </FieldGroup>
      </div>
    </div>
  );
}

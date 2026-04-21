import { FieldGroup, FieldLabel, FieldInput, FieldTextarea } from "./FieldHelpers.jsx";

export default function OpportunityFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was ist die Chance?">Beschreibung der Opportunity</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welche Chance haben wir? Was ermöglicht sich hier?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Nutzer, Segment, Markt">Zielgruppe</FieldLabel>
        <FieldInput fieldKey="targetAudience" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Wer profitiert von der Lösung dieser Opportunity?" />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Revenue, Effizienz, NPS…">Potenzieller Wert</FieldLabel>
          <FieldTextarea fieldKey="potentialValue" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Welchen Business- oder Nutzerwert hat das?" rows={3} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Now / Next / Later oder Quartal">Zeitliche Einschätzung</FieldLabel>
          <FieldInput fieldKey="timeToMarket" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wann ist die Gelegenheit relevant?" />
        </FieldGroup>
      </div>
    </div>
  );
}

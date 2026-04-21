import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function CompetitorFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel>Name des Wettbewerbers</FieldLabel>
        <FieldInput fieldKey="name" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="z. B. Acme Corp, Google Home, Amazon Alexa" />
      </FieldGroup>

      <SectionDivider label="SWOT" />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Was macht er gut?">Stärken</FieldLabel>
          <FieldTextarea fieldKey="strengths" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="- Stärke 1&#10;- Stärke 2…" rows={4} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Wo hat er Defizite?">Schwächen</FieldLabel>
          <FieldTextarea fieldKey="weaknesses" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="- Schwäche 1&#10;- Schwäche 2…" rows={4} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="Segment, Preis, Messaging">Marktpositionierung</FieldLabel>
        <FieldTextarea fieldKey="positioning" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Wie positioniert er sich im Markt?" rows={2} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Unser Vorteil gegenüber diesem Wettbewerber">Unser Differenzierungsmerkmal</FieldLabel>
        <FieldTextarea fieldKey="differentiator" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Womit unterscheiden wir uns klar von diesem Wettbewerber?" rows={2} />
      </FieldGroup>
    </div>
  );
}

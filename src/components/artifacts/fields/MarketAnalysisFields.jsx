import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function MarketAnalysisFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Überblick in 2–3 Sätzen">Zusammenfassung</FieldLabel>
        <FieldTextarea fieldKey="summary" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Überblick über den Markt und die wichtigsten Erkenntnisse…" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="TAM / SAM / SOM">Marktgröße</FieldLabel>
        <FieldInput fieldKey="marketSize" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="z. B. TAM: 5 Mrd. €, SAM: 500 Mio. €, SOM: 50 Mio. €" />
      </FieldGroup>

      <SectionDivider label="Analyse" />

      <FieldGroup>
        <FieldLabel hint="Technologie, Regulierung, Nachfrage…">Wichtige Trends</FieldLabel>
        <FieldTextarea fieldKey="trends" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welche Trends prägen den Markt? Was verändert sich?" rows={4} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Studien, Berichte, Daten">Quellen</FieldLabel>
        <FieldTextarea fieldKey="sources" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Studien, Berichte, Daten…" rows={2} />
      </FieldGroup>
    </div>
  );
}

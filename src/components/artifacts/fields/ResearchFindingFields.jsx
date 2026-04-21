import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function ResearchFindingFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Die wichtigste Erkenntnis in 1–2 Sätzen">Kernaussage / Insight</FieldLabel>
        <FieldTextarea fieldKey="insight" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was haben wir herausgefunden? Was ist die zentrale Erkenntnis?" rows={3} />
      </FieldGroup>

      <SectionDivider label="Methode" />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="z. B. Interview, Survey, Test">Forschungsmethode</FieldLabel>
          <FieldInput fieldKey="method" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. Nutzerinterview, Usability-Test, Survey" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Anzahl, Segment">Teilnehmer / Sample</FieldLabel>
          <FieldInput fieldKey="participants" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. 12 Interviews, B2B-Segment, 18–35 J." />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="Was ändert sich im Produkt oder in der Strategie?">Implikationen fürs Produkt</FieldLabel>
        <FieldTextarea fieldKey="implications" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was bedeutet dieses Finding für uns? Was sollten wir tun oder nicht tun?" rows={3} />
      </FieldGroup>
    </div>
  );
}

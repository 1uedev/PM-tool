import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function BuyerPersonaFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Archetyp-Name">Name der Buyer Persona</FieldLabel>
          <FieldInput fieldKey="name" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. IT-Einkäufer Mittelstand" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Funktion, Titel">Rolle / Position</FieldLabel>
          <FieldInput fieldKey="role" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. CTO, Einkaufsleiter, Head of IT" />
        </FieldGroup>
      </div>

      <SectionDivider label="Profil" />

      <FieldGroup>
        <FieldLabel hint="Was will er/sie im Unternehmen erreichen?">Geschäftliche Ziele</FieldLabel>
        <FieldTextarea fieldKey="goals" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welche Ergebnisse und Ziele treibt diese Person an?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was hindert oder frustriert sie im Berufsalltag?">Pain Points</FieldLabel>
        <FieldTextarea fieldKey="painPoints" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welche Herausforderungen, Risiken oder Frustrationen hat diese Persona?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Preis, ROI, Support, Compliance…">Kaufkriterien</FieldLabel>
        <FieldTextarea fieldKey="buyingCriteria" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Worauf legt er/sie beim Kauf Wert? Was sind Dealbreaker?" rows={3} />
      </FieldGroup>
    </div>
  );
}

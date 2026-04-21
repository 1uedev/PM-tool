import { FieldGroup, FieldLabel, FieldTextarea } from "./FieldHelpers.jsx";

export default function BusinessModelFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Abo, Lizenz, Transaktion, Werbung…">Einnahmequellen</FieldLabel>
          <FieldTextarea fieldKey="revenueStreams" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wie verdienen wir Geld?&#10;- Abo: …&#10;- Lizenz: …" rows={4} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Entwicklung, Support, Infra…">Kostenstruktur</FieldLabel>
          <FieldTextarea fieldKey="costStructure" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Hauptkostentreiber:&#10;- …&#10;- …" rows={4} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Direktvertrieb, PLG, Partner…">Vertriebskanäle</FieldLabel>
          <FieldTextarea fieldKey="channels" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wie erreichen wir Kunden?&#10;- …" rows={3} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Technologie, Vertrieb, Daten…">Wichtige Partner</FieldLabel>
          <FieldTextarea fieldKey="keyPartners" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wer sind unsere Schlüsselpartner?&#10;- …" rows={3} />
        </FieldGroup>
      </div>
    </div>
  );
}

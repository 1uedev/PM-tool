import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function ValuePropositionFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Highlighted statement box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-500">
          Value Proposition Statement
        </p>
        <textarea
          value={fields.statement ?? ""}
          onChange={(e) => onChange("statement", e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Wir helfen [Zielgruppe] dabei, [Problem] zu lösen, indem wir [Lösung] anbieten — anders als [Alternative]."
          className="w-full bg-transparent text-sm text-blue-900 placeholder-blue-300 outline-none resize-y
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <SectionDivider label="Details" />

      <FieldGroup>
        <FieldLabel hint="Hauptkunde, Segment">Zielkunde</FieldLabel>
        <FieldInput fieldKey="targetCustomer" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Wer ist der primäre Zielkunde?" />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Was ist der wichtigste Vorteil?">Hauptnutzen</FieldLabel>
          <FieldTextarea fieldKey="keyBenefit" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Was ist der eine Kernnutzen, der alles andere überwiegt?" rows={3} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Gegenüber Wettbewerbern oder Status quo">Differenzierungsmerkmal</FieldLabel>
          <FieldTextarea fieldKey="differentiator" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Was unterscheidet uns klar von Alternativen?" rows={3} />
        </FieldGroup>
      </div>
    </div>
  );
}

import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function AcceptanceCriteriaFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Given / When / Then card */}
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-500">
          Given / When / Then
        </p>
        <textarea
          value={fields.scenario ?? ""}
          onChange={(e) => onChange("scenario", e.target.value)}
          disabled={disabled}
          rows={5}
          placeholder={"Given [Voraussetzung / Ausgangszustand]\nWhen [Aktion des Nutzers oder Systems]\nThen [Erwartetes Ergebnis]"}
          className="w-full bg-transparent text-sm text-teal-900 placeholder-teal-300 outline-none resize-y
            disabled:opacity-60 disabled:cursor-not-allowed font-mono"
        />
      </div>

      <SectionDivider label="Details" />

      <FieldGroup>
        <FieldLabel hint="Was muss vor dem Test erfüllt sein?">Vorbedingungen</FieldLabel>
        <FieldTextarea fieldKey="preconditions" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was muss vor dem Test erfüllt sein?" rows={2} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was soll nach der Aktion passieren?">Erwartetes Ergebnis</FieldLabel>
        <FieldTextarea fieldKey="expectedResult" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was soll nach der Aktion passieren?" rows={3} />
      </FieldGroup>
    </div>
  );
}

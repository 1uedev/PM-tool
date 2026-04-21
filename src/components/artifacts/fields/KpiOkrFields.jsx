import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function KpiOkrFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Objective highlight box */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-500">
          Objective
        </p>
        <textarea
          value={fields.objective ?? ""}
          onChange={(e) => onChange("objective", e.target.value)}
          disabled={disabled}
          rows={2}
          placeholder="Was wollen wir erreichen? — qualitatives, inspirierendes Ziel"
          className="w-full bg-transparent text-sm text-amber-900 placeholder-amber-300 outline-none resize-y
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <FieldGroup>
        <FieldLabel hint="Messbare, zeitgebundene Ergebnisse">Key Results</FieldLabel>
        <FieldTextarea fieldKey="keyResults" fields={fields} onChange={onChange} disabled={disabled}
          placeholder={"KR1: …\nKR2: …\nKR3: …"} rows={4} />
      </FieldGroup>

      <SectionDivider label="Kontext" />

      <FieldGroup>
        <FieldLabel hint="Welche Zahlen beobachten wir?">Metriken / KPIs</FieldLabel>
        <FieldTextarea fieldKey="metrics" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welche Kennzahlen messen wir?" rows={3} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="z. B. Q1 2025">Zeitraum</FieldLabel>
          <FieldInput fieldKey="timeframe" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="z. B. Q1 2025" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Team oder Person">Verantwortlicher</FieldLabel>
          <FieldInput fieldKey="owner" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Wer ist für dieses OKR zuständig?" />
        </FieldGroup>
      </div>
    </div>
  );
}

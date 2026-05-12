import { FieldGroup, FieldLabel, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function DecisionFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Warum musste eine Entscheidung getroffen werden?">Kontext / Hintergrund</FieldLabel>
        <FieldTextarea fieldKey="context" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Warum musste eine Entscheidung getroffen werden?" rows={3} />
      </FieldGroup>

      {/* Decision highlight */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
          Getroffene Entscheidung
        </p>
        <textarea
          value={fields.decision ?? ""}
          onChange={(e) => onChange("decision", e.target.value)}
          disabled={disabled}
          rows={2}
          placeholder="Was wurde entschieden?"
          className="w-full bg-transparent text-sm text-indigo-900 placeholder-indigo-300 outline-none resize-y
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <FieldGroup>
        <FieldLabel hint="Warum wurde so entschieden?">Begründung</FieldLabel>
        <FieldTextarea fieldKey="rationale" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Warum wurde so entschieden?" rows={3} />
      </FieldGroup>

      <SectionDivider label="Alternativen & Konsequenzen" />

      <FieldGroup>
        <FieldLabel hint="Welche Optionen wurden verworfen?">Verworfene Alternativen</FieldLabel>
        <FieldTextarea fieldKey="alternatives" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Welche Optionen wurden nicht gewählt und warum?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was ändert sich durch diese Entscheidung?">Konsequenzen</FieldLabel>
        <FieldTextarea fieldKey="consequences" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Welche Auswirkungen hat die Entscheidung?" rows={2} />
      </FieldGroup>
    </div>
  );
}

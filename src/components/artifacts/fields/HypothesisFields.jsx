import { FieldTextarea } from "./FieldHelpers.jsx";

function HypothesisRow({ prefix, hint, fieldKey, fields, onChange, disabled, placeholder, rows = 2 }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 pt-2 w-24 text-right">
        <span className="text-sm font-semibold text-emerald-600">{prefix}</span>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">
        <FieldTextarea fieldKey={fieldKey} fields={fields} onChange={onChange}
          placeholder={placeholder} rows={rows} disabled={disabled} />
      </div>
    </div>
  );
}

export default function HypothesisFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-500">
        Hypothesen-Format
      </p>

      <HypothesisRow
        prefix="Wir glauben,"
        hint="Annahme"
        fieldKey="assumption"
        fields={fields}
        onChange={onChange}
        disabled={disabled}
        placeholder="dass [Nutzergruppe] [Problem hat / Verhalten zeigt / Bedürfnis hat]…"
        rows={2}
      />

      <div className="my-1 ml-28 border-l-2 border-emerald-100 pl-3">
        <span className="text-xs text-emerald-300">↓</span>
      </div>

      <HypothesisRow
        prefix="weil"
        hint="Begründung"
        fieldKey="rationale"
        fields={fields}
        onChange={onChange}
        disabled={disabled}
        placeholder="[Warum wir das glauben — Beobachtung, Daten, Erfahrung]…"
        rows={2}
      />

      <div className="my-1 ml-28 border-l-2 border-emerald-100 pl-3">
        <span className="text-xs text-emerald-300">↓</span>
      </div>

      <HypothesisRow
        prefix="Test:"
        hint="Methode"
        fieldKey="testMethod"
        fields={fields}
        onChange={onChange}
        disabled={disabled}
        placeholder="[Wie testen wir die Annahme? — Experiment, Interview, A/B-Test…]"
        rows={2}
      />

      <div className="my-1 ml-28 border-l-2 border-emerald-100 pl-3">
        <span className="text-xs text-emerald-300">↓</span>
      </div>

      <HypothesisRow
        prefix="Bestätigt,"
        hint="Erfolgskriterium"
        fieldKey="successCriteria"
        fields={fields}
        onChange={onChange}
        disabled={disabled}
        placeholder="wenn [messbares Ergebnis, das die Annahme beweist]…"
        rows={2}
      />
    </div>
  );
}

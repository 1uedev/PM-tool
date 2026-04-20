import { FieldGroup, FieldLabel, FieldTextarea } from "./FieldHelpers.jsx";

export default function ProductVisionFields({ fields, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      {/* One-liner prominent */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <FieldGroup>
          <FieldLabel hint="Das Produkt in einem Satz">Einzeiler / Elevator Pitch</FieldLabel>
          <textarea
            value={fields.oneLiner ?? ""}
            onChange={(e) => onChange("oneLiner", e.target.value)}
            placeholder="Für [Zielgruppe], die [Problem], ist [Produkt] ein [Kategorie], das [Nutzen]. Im Gegensatz zu [Alternative] bietet es [Differenzierung]."
            rows={3}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium outline-none transition-colors
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="Für wen wird das Produkt gebaut?">Zielnutzer</FieldLabel>
        <FieldTextarea
          fieldKey="targetUsers"
          fields={fields}
          onChange={onChange}
          placeholder="Beschreibe die primären Nutzergruppen…"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Welchen konkreten Mehrwert bietet das Produkt?">Nutzenversprechen</FieldLabel>
        <FieldTextarea
          fieldKey="valueProposition"
          fields={fields}
          onChange={onChange}
          placeholder="Das Produkt ermöglicht… / Nutzer profitieren von…"
          rows={4}
        />
      </FieldGroup>
    </div>
  );
}

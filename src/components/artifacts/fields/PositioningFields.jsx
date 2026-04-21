import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function PositioningFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Positioning statement box */}
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">
          Positionierungsaussage
        </p>
        <p className="mb-2 text-xs text-violet-400">
          Für [Zielgruppe], die [Bedürfnis], ist [Produkt] die [Kategorie], die [Nutzen] — anders als [Alternative].
        </p>
        <textarea
          value={fields.statement ?? ""}
          onChange={(e) => onChange("statement", e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Füge hier deine Positionierungsaussage ein…"
          className="w-full bg-transparent text-sm text-violet-900 placeholder-violet-300 outline-none resize-y
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <SectionDivider label="Details" />

      <FieldGroup>
        <FieldLabel hint="Segment, Zielmarkt">Zielsegment</FieldLabel>
        <FieldInput fieldKey="targetSegment" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welches Marktsegment addressieren wir primär?" />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Nachhaltig, schwer kopierbar">Wettbewerbsvorteil</FieldLabel>
        <FieldTextarea fieldKey="competitiveAdvantage" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Unser nachhaltiger Vorteil gegenüber Wettbewerbern — was können nur wir?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was bleibt nach dem ersten Kontakt hängen?">Kernbotschaft</FieldLabel>
        <FieldInput fieldKey="keyMessage" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Die eine Botschaft, die hängen bleibt" />
      </FieldGroup>
    </div>
  );
}

import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";
import ArtifactRefField from "./ArtifactRefField.jsx";

export default function PositioningFields({ fields, onChange, disabled, projectId, artifactId }) {
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
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <SectionDivider label="Details" />

      <ArtifactRefField
        projectId={projectId}
        artifactId={artifactId}
        targetTypes={["USER_PERSONA", "BUYER_PERSONA"]}
        relationType="RELATES_TO"
        label="Zielsegment"
        hint="Verknüpfte Personas"
        disabled={disabled}
      />

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

import { FieldGroup, FieldLabel } from "./FieldHelpers.jsx";
import ArtifactRefField from "./ArtifactRefField.jsx";

export default function ProductVisionFields({ fields, onChange, disabled, projectId, artifactId }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <FieldGroup>
          <FieldLabel hint="Das Produkt in einem Satz">Einzeiler / Elevator Pitch</FieldLabel>
          <textarea
            value={fields.oneLiner ?? ""}
            onChange={(e) => onChange("oneLiner", e.target.value)}
            placeholder="Für [Zielgruppe], die [Problem], ist [Produkt] eine [Kategorie], die [Nutzen] — anders als [Alternative]."
            rows={3}
            disabled={disabled}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium outline-none transition-colors
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
          />
        </FieldGroup>
      </div>

      <ArtifactRefField
        projectId={projectId}
        artifactId={artifactId}
        targetTypes={["USER_PERSONA", "BUYER_PERSONA"]}
        relationType="RELATES_TO"
        label="Zielnutzer"
        hint="Verknüpfte Personas"
        disabled={disabled}
      />

      <ArtifactRefField
        projectId={projectId}
        artifactId={artifactId}
        targetTypes={["VALUE_PROPOSITION"]}
        relationType="RELATES_TO"
        label="Wertversprechen"
        hint="Verknüpfte Value Propositions"
        disabled={disabled}
      />
    </div>
  );
}

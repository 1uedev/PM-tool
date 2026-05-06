import { FieldGroup, FieldLabel, FieldInput, FieldTextarea } from "./FieldHelpers.jsx";
import ArtifactRefField from "./ArtifactRefField.jsx";

export default function UseCaseFields({ fields, onChange, disabled, projectId, artifactId }) {
  return (
    <div className="flex flex-col gap-5">
      <ArtifactRefField
        projectId={projectId}
        artifactId={artifactId}
        targetTypes={["USER_PERSONA", "BUYER_PERSONA"]}
        relationType="RELATES_TO"
        label="Akteur"
        hint="Wer führt die Aktion aus?"
        disabled={disabled}
      />

      <FieldGroup>
        <FieldLabel hint="Was möchte der Akteur erreichen?">Ziel</FieldLabel>
        <FieldInput
          fieldKey="goal"
          fields={fields}
          onChange={onChange}
          placeholder="z. B. Gerät per Sprache steuern"
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was muss vorher erfüllt sein?">Vorbedingungen</FieldLabel>
        <FieldTextarea
          fieldKey="preconditions"
          fields={fields}
          onChange={onChange}
          placeholder="z. B. Nutzer ist eingeloggt. Gerät ist mit der App verbunden."
          rows={2}
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Schritt für Schritt">Ablauf</FieldLabel>
        <FieldTextarea
          fieldKey="flow"
          fields={fields}
          onChange={onChange}
          placeholder={"1. Nutzer öffnet die App\n2. Nutzer navigiert zu Geräten\n3. System zeigt verbundene Geräte\n4. …"}
          rows={7}
          className="font-mono text-xs"
          disabled={disabled}
        />
      </FieldGroup>
    </div>
  );
}

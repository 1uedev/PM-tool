import { FieldGroup, FieldLabel, FieldInput, FieldTextarea } from "./FieldHelpers.jsx";

export default function UseCaseFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Actor + Goal side by side */}
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Wer führt die Aktion aus?">Akteur</FieldLabel>
          <FieldInput
            fieldKey="actor"
            fields={fields}
            onChange={onChange}
            placeholder="z. B. Hausbesitzer"
            disabled={disabled}
          />
        </FieldGroup>
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
      </div>

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

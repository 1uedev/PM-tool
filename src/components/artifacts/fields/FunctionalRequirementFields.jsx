import { FieldGroup, FieldLabel, FieldTextarea } from "./FieldHelpers.jsx";

export default function FunctionalRequirementFields({ fields, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was muss das System tun?">Beschreibung</FieldLabel>
        <FieldTextarea
          fieldKey="description"
          fields={fields}
          onChange={onChange}
          placeholder="Das System muss… / Die Anwendung soll…"
          rows={4}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Wann gilt die Anforderung als erfüllt?">
          Akzeptanzkriterien
        </FieldLabel>
        <FieldTextarea
          fieldKey="acceptanceCriteria"
          fields={fields}
          onChange={onChange}
          placeholder={"- Kriterium 1 (messbar, konkret)\n- Kriterium 2\n- Kriterium 3\n…"}
          rows={6}
          className="font-mono text-xs"
        />
        <p className="text-xs text-gray-400">
          Tipp: Ein Kriterium pro Zeile, beginnend mit „-". Jedes Kriterium sollte messbar und testbar sein.
        </p>
      </FieldGroup>
    </div>
  );
}

import { FieldTextarea } from "./FieldHelpers.jsx";

function StoryRow({ prefix, fieldKey, fields, onChange, placeholder, rows = 2, disabled }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 pt-2 w-20 text-right">
        <span className="text-sm font-semibold text-blue-600">{prefix}</span>
      </div>
      <div className="flex-1">
        <FieldTextarea
          fieldKey={fieldKey}
          fields={fields}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default function UserStoryFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Story-Format
      </p>

      <StoryRow
        prefix="Als"
        fieldKey="role"
        fields={fields}
        onChange={onChange}
        placeholder="Rolle / Nutzertyp (z. B. Hausbesitzer, Administrator…)"
        rows={1}
        disabled={disabled}
      />

      <div className="my-1 ml-24 border-l-2 border-blue-100 pl-3">
        <span className="text-xs text-gray-300">↓</span>
      </div>

      <StoryRow
        prefix="möchte ich"
        fieldKey="action"
        fields={fields}
        onChange={onChange}
        placeholder="Aktion / Funktion (z. B. die Helligkeit per Schieberegler anpassen…)"
        rows={2}
        disabled={disabled}
      />

      <div className="my-1 ml-24 border-l-2 border-blue-100 pl-3">
        <span className="text-xs text-gray-300">↓</span>
      </div>

      <StoryRow
        prefix="damit"
        fieldKey="benefit"
        fields={fields}
        onChange={onChange}
        placeholder="Nutzen / Mehrwert (z. B. ich schnell die richtige Lichtatmosphäre einstellen kann…)"
        rows={2}
        disabled={disabled}
      />
    </div>
  );
}

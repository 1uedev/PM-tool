import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

const INVOLVEMENT_OPTIONS = ["Responsible", "Accountable", "Consulted", "Informed"];

export default function StakeholderFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldInput
            label="Name"
            value={fields.name}
            onChange={(v) => onChange("name", v)}
            disabled={disabled}
            placeholder="Full name"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldInput
            label="Role / Title"
            value={fields.role}
            onChange={(v) => onChange("role", v)}
            disabled={disabled}
            placeholder="e.g. Engineering Lead, Legal Counsel"
          />
        </FieldGroup>
      </div>

      <SectionDivider label="Involvement" />

      <FieldGroup>
        <FieldLabel>RACI — Level of involvement</FieldLabel>
        <div className="grid grid-cols-4 gap-2">
          {INVOLVEMENT_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors
                ${fields.involvement === opt
                  ? "border-slate-500 bg-slate-50 text-slate-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="involvement"
                value={opt}
                checked={fields.involvement === opt}
                onChange={() => onChange("involvement", opt)}
                disabled={disabled}
                className="sr-only"
              />
              <span className="text-sm font-semibold">{opt[0]}</span>
              <span className="text-xs">{opt}</span>
            </label>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup>
        <FieldTextarea
          label="Responsibility"
          value={fields.responsibility}
          onChange={(v) => onChange("responsibility", v)}
          disabled={disabled}
          placeholder="What does this person own or decide? What are they accountable for?"
          rows={3}
          rich
        />
      </FieldGroup>

      <FieldGroup>
        <FieldInput
          label="Contact / Team"
          value={fields.contact}
          onChange={(v) => onChange("contact", v)}
          disabled={disabled}
          placeholder="Email, Slack handle, or team name"
        />
      </FieldGroup>
    </div>
  );
}

import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

const MILESTONE_STATUSES = ["Not started", "In progress", "At risk", "Completed"];

export default function MilestoneFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <FieldTextarea
          label="Description"
          value={fields.description}
          onChange={(v) => onChange("description", v)}
          disabled={disabled}
          placeholder="What does reaching this milestone mean? What state will the project be in?"
          rows={3}
          rich
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldInput
            label="Target date"
            value={fields.targetDate}
            onChange={(v) => onChange("targetDate", v)}
            disabled={disabled}
            placeholder="e.g. 2026-06-30"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldInput
            label="Owner"
            value={fields.owner}
            onChange={(v) => onChange("owner", v)}
            disabled={disabled}
            placeholder="Who is accountable for this milestone?"
          />
        </FieldGroup>
      </div>

      <SectionDivider label="Completion" />

      <FieldGroup>
        <FieldTextarea
          label="Success criteria"
          value={fields.criteria}
          onChange={(v) => onChange("criteria", v)}
          disabled={disabled}
          placeholder="What must be true for this milestone to be considered complete? List measurable conditions."
          rows={3}
          rich
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Status</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {MILESTONE_STATUSES.map((s) => (
            <label
              key={s}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors
                ${fields.status === s
                  ? "border-orange-400 bg-orange-50 font-medium text-orange-800"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="milestoneStatus"
                value={s}
                checked={fields.status === s}
                onChange={() => onChange("status", s)}
                disabled={disabled}
                className="sr-only"
              />
              {s}
            </label>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

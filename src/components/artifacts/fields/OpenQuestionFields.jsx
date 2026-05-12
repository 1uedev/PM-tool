import { FieldGroup, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function OpenQuestionFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">Open Question</p>
        <FieldTextarea
          label="Question"
          value={fields.question}
          onChange={(v) => onChange("question", v)}
          disabled={disabled}
          placeholder="What is the unresolved question? Be specific about what needs to be decided or clarified."
          rows={3}
          rich
        />
      </div>

      <FieldGroup>
        <FieldTextarea
          label="Context"
          value={fields.context}
          onChange={(v) => onChange("context", v)}
          disabled={disabled}
          placeholder="Why is this question important? What depends on its answer? What do we know so far?"
          rows={3}
          rich
        />
      </FieldGroup>

      <SectionDivider label="Resolution" />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldInput
            label="Owner"
            value={fields.owner}
            onChange={(v) => onChange("owner", v)}
            disabled={disabled}
            placeholder="Who is responsible for answering this?"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldInput
            label="Due date"
            value={fields.dueDate}
            onChange={(v) => onChange("dueDate", v)}
            disabled={disabled}
            placeholder="e.g. 2026-05-15"
          />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldTextarea
          label="Resolution"
          value={fields.resolution}
          onChange={(v) => onChange("resolution", v)}
          disabled={disabled}
          placeholder="How was this question answered? (fill in once resolved)"
          rows={3}
          rich
        />
      </FieldGroup>
    </div>
  );
}

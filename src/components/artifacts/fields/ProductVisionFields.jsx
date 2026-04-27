import { FieldGroup, FieldLabel, FieldTextarea } from "./FieldHelpers.jsx";

export default function ProductVisionFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <FieldGroup>
          <FieldLabel hint="The product in one sentence">One-liner / Elevator pitch</FieldLabel>
          <textarea
            value={fields.oneLiner ?? ""}
            onChange={(e) => onChange("oneLiner", e.target.value)}
            placeholder="For [target audience] who [problem], [product] is a [category] that [benefit]. Unlike [alternative], it [key differentiator]."
            rows={3}
            disabled={disabled}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium outline-none transition-colors
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none
              disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
          />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="Who is the product being built for?">Target users</FieldLabel>
        <FieldTextarea
          fieldKey="targetUsers"
          fields={fields}
          onChange={onChange}
          placeholder="Describe the primary user groups…"
          rows={3}
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="What concrete value does the product deliver?">Value proposition</FieldLabel>
        <FieldTextarea
          fieldKey="valueProposition"
          fields={fields}
          onChange={onChange}
          placeholder="The product enables… / Users benefit from…"
          rows={4}
          disabled={disabled}
        />
      </FieldGroup>
    </div>
  );
}

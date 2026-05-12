import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function FeatureFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="What does this feature do?">Description</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="What does this feature do?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Why does the user need this?">User value</FieldLabel>
        <FieldTextarea fieldKey="userValue" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="What value does this deliver to the user?" rows={2} />
      </FieldGroup>

      <SectionDivider label="Scope" />

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Explicitly included">In scope</FieldLabel>
          <FieldTextarea fieldKey="inScope" fields={fields} onChange={onChange} rich disabled={disabled}
            placeholder="What is explicitly included?" rows={3} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Explicitly excluded">Out of scope</FieldLabel>
          <FieldTextarea fieldKey="outOfScope" fields={fields} onChange={onChange} rich disabled={disabled}
            placeholder="What is explicitly excluded?" rows={3} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="High / Medium / Low">Priority</FieldLabel>
        <FieldInput fieldKey="priority" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="High / Medium / Low — reason" />
      </FieldGroup>
    </div>
  );
}

import { FieldGroup, FieldLabel, FieldInput, FieldTextarea } from "./FieldHelpers.jsx";

export default function UserPersonaFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel>Name</FieldLabel>
        <FieldInput
          fieldKey="name"
          fields={fields}
          onChange={onChange}
          placeholder="e.g. Sarah Chen"
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="What does this person want to achieve?">Goals</FieldLabel>
        <FieldTextarea
          fieldKey="goals"
          fields={fields}
          onChange={onChange}
          placeholder="Describe the key goals and motivations of this persona…"
          rows={4}
          rich
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="What frustrates or blocks them?">Pain points</FieldLabel>
        <FieldTextarea
          fieldKey="painPoints"
          fields={fields}
          onChange={onChange}
          placeholder="What problems, obstacles, or frustrations does this persona face?…"
          rows={4}
          rich
          disabled={disabled}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Job, age, situation, environment">Context / Background</FieldLabel>
        <FieldTextarea
          fieldKey="context"
          fields={fields}
          onChange={onChange}
          placeholder="Describe the life and work context of this persona…"
          rows={3}
          rich
          disabled={disabled}
        />
      </FieldGroup>
    </div>
  );
}

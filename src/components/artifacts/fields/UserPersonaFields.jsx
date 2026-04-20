import { FieldGroup, FieldLabel, FieldInput, FieldTextarea } from "./FieldHelpers.jsx";

export default function UserPersonaFields({ fields, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel>Name der Persona</FieldLabel>
        <FieldInput
          fieldKey="name"
          fields={fields}
          onChange={onChange}
          placeholder="z. B. Max Müller"
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was möchte die Person erreichen?">Ziele</FieldLabel>
        <FieldTextarea
          fieldKey="goals"
          fields={fields}
          onChange={onChange}
          placeholder="Beschreibe die wichtigsten Ziele und Motivationen dieser Persona…"
          rows={4}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Was hindert oder frustriert sie?">Pain Points</FieldLabel>
        <FieldTextarea
          fieldKey="painPoints"
          fields={fields}
          onChange={onChange}
          placeholder="Welche Probleme, Hindernisse oder Frustrationen hat diese Persona?…"
          rows={4}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Beruf, Alter, Situation, Umfeld">Kontext / Hintergrund</FieldLabel>
        <FieldTextarea
          fieldKey="context"
          fields={fields}
          onChange={onChange}
          placeholder="Beschreibe den Lebens- und Arbeitskontext dieser Persona…"
          rows={3}
        />
      </FieldGroup>
    </div>
  );
}

import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function FeedbackItemFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <FieldLabel hint="Nutzer-Interview / Support-Ticket / NPS / Analytics…">Quelle</FieldLabel>
          <FieldInput fieldKey="source" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Nutzer-Interview / Support-Ticket / NPS / Analytics…" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel hint="Positiv / Negativ / Neutral">Bewertung / Sentiment</FieldLabel>
          <FieldInput fieldKey="sentiment" fields={fields} onChange={onChange} disabled={disabled}
            placeholder="Positiv / Negativ / Neutral" />
        </FieldGroup>
      </div>

      <FieldGroup>
        <FieldLabel hint="Was wurde gesagt oder beobachtet?">Feedback-Inhalt</FieldLabel>
        <FieldTextarea fieldKey="content" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was wurde gesagt oder beobachtet?" rows={4} />
      </FieldGroup>

      <SectionDivider label="Maßnahmen" />

      <FieldGroup>
        <FieldLabel hint="Was leiten wir daraus ab?">Maßnahmen</FieldLabel>
        <FieldTextarea fieldKey="actionItems" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Was leiten wir daraus ab?" rows={3} />
      </FieldGroup>
    </div>
  );
}

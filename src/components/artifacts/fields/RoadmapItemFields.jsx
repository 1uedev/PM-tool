import { FieldGroup, FieldLabel, FieldInput, FieldTextarea, SectionDivider } from "./FieldHelpers.jsx";

export default function RoadmapItemFields({ fields, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <FieldLabel hint="Was ist geplant?">Beschreibung</FieldLabel>
        <FieldTextarea fieldKey="description" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Was ist geplant?" rows={3} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="z. B. Q2 2025, H2 2025, Now / Next / Later">Zeitraum / Quartal</FieldLabel>
        <FieldInput fieldKey="timeframe" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="z. B. Q2 2025, H2 2025, Now/Next/Later" />
      </FieldGroup>

      <SectionDivider label="Kontext" />

      <FieldGroup>
        <FieldLabel hint="Welche Features oder Epics sind Teil davon?">Verknüpfte Features / Epics</FieldLabel>
        <FieldTextarea fieldKey="relatedFeatures" fields={fields} onChange={onChange} disabled={disabled}
          placeholder="Welche Features sind Teil dieses Roadmap-Eintrags?" rows={2} />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel hint="Warum jetzt auf der Roadmap?">Begründung / strategische Relevanz</FieldLabel>
        <FieldTextarea fieldKey="rationale" fields={fields} onChange={onChange} rich disabled={disabled}
          placeholder="Warum ist das jetzt auf der Roadmap?" rows={2} />
      </FieldGroup>
    </div>
  );
}

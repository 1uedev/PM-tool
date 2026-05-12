// Shared field primitives used by all type-specific field components.
//
// Two calling conventions are supported:
//
// A) Key-based (original types):
//    <FieldTextarea fieldKey="problem" fields={fields} onChange={onChange} />
//    onChange: (key: string, value: string) => void
//
// B) Value-based (new types, inline label):
//    <FieldTextarea label="Problem" value={fields.problem} onChange={(v) => onChange("problem", v)} />
//    onChange: (value: string) => void
//
// Pass rich={true} on prose/narrative fields to render a Tiptap rich-text editor instead.

import dynamic from "next/dynamic";

const RichTextarea = dynamic(() => import("@/components/ui/RichTextarea"), { ssr: false });

export function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-baseline gap-2">
      <label className="text-sm font-medium text-gray-700">{children}</label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}

export function FieldTextarea({
  // Convention A
  fieldKey, fields,
  // Convention B
  label, value,
  // Shared
  onChange, placeholder, rows = 3, className = "", disabled = false, rich = false,
}) {
  const isKeyBased = fieldKey !== undefined;
  const resolvedValue = isKeyBased ? (fields?.[fieldKey] ?? "") : (value ?? "");
  const handleChange = rich
    ? (html) => {
        if (isKeyBased) onChange(fieldKey, html);
        else onChange(html);
      }
    : (e) => {
        if (isKeyBased) onChange(fieldKey, e.target.value);
        else onChange(e.target.value);
      };

  return (
    <div className="flex flex-col gap-1">
      {label && <FieldLabel>{label}</FieldLabel>}
      {rich ? (
        <RichTextarea
          value={resolvedValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
      ) : (
        <textarea
          value={resolvedValue}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50 ${className}`}
        />
      )}
    </div>
  );
}

export function FieldInput({
  // Convention A
  fieldKey, fields,
  // Convention B
  label, value,
  // Shared
  onChange, placeholder, className = "", disabled = false,
}) {
  const isKeyBased = fieldKey !== undefined;
  const resolvedValue = isKeyBased ? (fields?.[fieldKey] ?? "") : (value ?? "");
  const handleChange = (e) => {
    if (isKeyBased) onChange(fieldKey, e.target.value);
    else onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        type="text"
        value={resolvedValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200
          disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50 ${className}`}
      />
    </div>
  );
}

export function FieldGroup({ children }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <div className="flex-1 border-t border-gray-100" />
    </div>
  );
}

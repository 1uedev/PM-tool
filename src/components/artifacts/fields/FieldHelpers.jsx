// Shared field primitives used by all type-specific field components.
// Each component receives: { fields, onChange, disabled }
// onChange: (key: string, value: string) => void

export function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-baseline gap-2">
      <label className="text-sm font-medium text-gray-700">{children}</label>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}

export function FieldTextarea({ fieldKey, fields, onChange, placeholder, rows = 3, className = "", disabled = false }) {
  return (
    <textarea
      value={fields[fieldKey] ?? ""}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y
        disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50 ${className}`}
    />
  );
}

export function FieldInput({ fieldKey, fields, onChange, placeholder, className = "", disabled = false }) {
  return (
    <input
      type="text"
      value={fields[fieldKey] ?? ""}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200
        disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50 ${className}`}
    />
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

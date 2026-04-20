export default function SectionLabel({ text }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1 mb-4">
      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="text-xs font-semibold text-primary-light uppercase tracking-wider">
        {text}
      </span>
    </div>
  );
}

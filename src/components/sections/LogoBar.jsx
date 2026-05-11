const groups = [
  "Foundations",
  "Research",
  "Audience",
  "Strategy",
  "Discovery & Design",
  "Delivery",
  "Planning & Release",
  "Feedback & Iteration",
];

export default function LogoBar() {
  return (
    <section className="bg-dark-muted py-10 px-6 border-y border-white/5">
      <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">
        35 artifact types across 8 domain groups
      </p>
      <div className="flex justify-center gap-8 flex-wrap opacity-50">
        {groups.map((name) => (
          <span
            key={name}
            className="text-sm font-semibold text-white tracking-tight"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

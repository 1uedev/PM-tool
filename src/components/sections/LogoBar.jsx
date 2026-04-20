export default function LogoBar() {
  const logos = ["Stripe", "Vercel", "Linear", "Notion", "Figma"];

  return (
    <section className="bg-dark-muted py-10 px-6 border-y border-white/5">
      <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-6">
        Trusted by teams at
      </p>
      <div className="flex justify-center gap-12 flex-wrap opacity-40">
        {logos.map((name) => (
          <span
            key={name}
            className="text-lg font-bold text-white tracking-tight"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

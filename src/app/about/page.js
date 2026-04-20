import SectionLabel from "@/components/ui/SectionLabel";

const stats = [
  { value: "12,000+", label: "Developers" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "140+", label: "Countries" },
  { value: "$18M", label: "Series A" },
];

const team = [
  { name: "Alex Kim", role: "CEO & Co-founder", avatar: "AK" },
  { name: "Jordan Lee", role: "CTO & Co-founder", avatar: "JL" },
  { name: "Emma Schulz", role: "Head of Design", avatar: "ES" },
  { name: "David Okafor", role: "Head of Engineering", avatar: "DO" },
];

export default function AboutPage() {
  return (
    <div className="bg-dark pt-28 pb-20 px-6">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionLabel text="About" />
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-5">
            Built by developers,
            <br />
            for developers
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-[600px] mx-auto">
            We started Launchpad because we were tired of stitching together
            dozens of tools just to ship a product. Our mission is to give every
            team the same infrastructure that powers the world&apos;s best
            companies.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-dark-muted rounded-2xl py-7 px-5 text-center border border-white/5"
            >
              <div className="text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-1">
                {s.value}
              </div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Our Team</h2>
          <p className="text-slate-400">The people behind the platform</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map((t) => (
            <div
              key={t.name}
              className="bg-dark-muted rounded-2xl p-7 text-center border border-white/5"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                {t.avatar}
              </div>
              <h4 className="text-white text-base font-semibold mb-1">
                {t.name}
              </h4>
              <p className="text-slate-500 text-sm m-0">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

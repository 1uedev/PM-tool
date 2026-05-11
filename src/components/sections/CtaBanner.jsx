import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="bg-dark py-20 px-6">
      <div className="max-w-[640px] mx-auto text-center bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl py-14 px-10 border border-primary/15">
        <h2 className="text-3xl font-bold text-white mb-3">
          Start structuring your product today
        </h2>
        <p className="text-slate-400 text-base mb-8">
          Free and self-hosted. No credit card. No usage limits.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/login"
            className="inline-block bg-primary text-white no-underline rounded-lg px-8 py-3 text-base font-semibold hover:bg-primary-dark transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/features"
            className="inline-block bg-transparent text-white border border-white/20 no-underline rounded-lg px-8 py-3 text-base font-semibold hover:bg-white/5 transition-colors"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}

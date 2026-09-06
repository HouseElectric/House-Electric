export default function BlogCTA({
  title = "Ready to Make Your Space Safer?",
  desc = "Book a service, request an AMC, or get a free consultation from our team today.",
}) {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-wrap px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#1a1a1a] to-[#3a2c0d] p-9 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] md:p-14">
          <div className="pointer-events-none absolute -right-14 -top-14 h-64 w-64 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-16 left-[28%] h-48 w-48 rounded-full bg-white/[0.04]" />

          <div className="relative z-[1] flex flex-wrap items-center justify-between gap-8">
            <div>
              <h2 className="mb-3 max-w-[18ch] text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold leading-tight text-white">
                {title}
              </h2>
              <p className="max-w-[46ch] text-[15px] leading-relaxed text-white/80">{desc}</p>
            </div>
            <div className="flex flex-none flex-wrap gap-3">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-yellow px-6 py-3.5 text-sm font-extrabold text-ink shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-yellow-dark"
              >
                Contact Us
              </a>
              <a
                href="/services"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                View Services
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

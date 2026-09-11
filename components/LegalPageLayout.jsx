import PageHero from "@/components/PageHero";
import { MailIcon, PhoneIcon } from "@/components/icons";

export default function LegalPageLayout({ eyebrow = "Legal", title, lastUpdated, sections, contact }) {
  return (
    <main>
      <PageHero eyebrow={eyebrow} title={title} subtitle={`Last updated: ${lastUpdated}`} />

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr] lg:gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-line/80 bg-cream/50 p-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-body">On This Page</p>
                <nav className="flex flex-col gap-0.5">
                  {sections.map((s, i) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
                    >
                      <span className="grid h-5 w-5 flex-none place-items-center rounded-md bg-yellow/15 text-[10px] font-extrabold text-yellow-dark">
                        {i + 1}
                      </span>
                      <span className="truncate">{s.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-sm sm:p-8 md:p-10">
              {sections.map((s, i) => (
                <div
                  key={s.id}
                  id={s.id}
                  className={`scroll-mt-28 ${i > 0 ? "mt-9 border-t border-line/60 pt-9" : ""}`}
                >
                  <div className="mb-3.5 flex items-center gap-3">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-yellow/15 text-[13px] font-extrabold text-yellow-dark">
                      {i + 1}
                    </span>
                    <h2 className="text-[17px] font-extrabold text-ink sm:text-[18px]">{s.title}</h2>
                  </div>
                  <div className="prose-content pl-[44px] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {s.body}
                  </div>
                </div>
              ))}

              {contact && (
                <div className="mt-9 flex flex-col gap-3 rounded-2xl border border-line bg-cream/50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <p className="text-[14px] font-extrabold text-ink">Questions about this policy?</p>
                    <p className="text-[13px] text-body">We're happy to clarify anything here.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-[13px] font-bold text-ink hover:border-ink"
                    >
                      <MailIcon className="h-4 w-4" />
                      Email Us
                    </a>
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-md bg-yellow px-4 py-2.5 text-[13px] font-extrabold text-ink hover:bg-yellow-dark"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      Call {contact.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

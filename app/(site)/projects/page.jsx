import Image from "next/image";
import CTA from "@/components/CTA";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Our Projects — House Electric",
  description:
    "A look at House Electric's recent electrical repair, installation, health check and maintenance work across homes and businesses.",
};

export const revalidate = 60;

const SEED_PROJECTS = [
  { img: "/service-repair.png", title: "Fault Finding & Repair", tag: "Repair", local: true },
  { img: "/process-electrician.png", title: "Consumer Unit Inspection", tag: "Health Check", local: true },
  { img: "/service-installation.png", title: "Pendant Lighting Installation", tag: "Installation", local: true },
  { img: "/service-maintenance.png", title: "Distribution Board Servicing", tag: "Maintenance", local: true },
  { img: "/healthcheck-ceiling.png", title: "Ceiling Light Fitting", tag: "Installation", local: true },
  { img: "/service-healthcheck.png", title: "Electrical Inspection Report", tag: "Health Check", local: true },
  { img: "/service-amc.png", title: "AMC Sign-Up", tag: "AMC", local: true },
  { img: "/customer-residential.png", title: "Residential Site Visit", tag: "Residential", local: true },
  { img: "/customer-commercial.png", title: "Office Electrical Fit-Out", tag: "Commercial", local: true },
];

async function getProjects() {
  if (!supabase) return SEED_PROJECTS;
  const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  const uploaded = (data ?? []).map((p) => ({ img: p.image_url, title: p.title, tag: p.category, local: false }));
  return uploaded.length > 0 ? uploaded : SEED_PROJECTS;
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main>
      <PageHero
        eyebrow="Our Work"
        title="Projects We've Completed"
        subtitle="A look at our recent electrical repair, installation, health check and maintenance work for homes and businesses."
        primaryCta={{ label: "Book a Service", href: "/contact" }}
      />

      <section className="py-16 md:py-[74px]">
        <div className="mx-auto max-w-wrap px-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal
                key={`${p.title}-${i}`}
                delay={(i % 6) * 0.06}
                className="card-hover group overflow-hidden rounded-[10px] border border-line bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {p.local ? (
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={p.img}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {p.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11.5px] font-bold text-ink">
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="px-4 py-3.5">
                  <b className="text-[15px] font-extrabold text-ink">{p.title}</b>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}

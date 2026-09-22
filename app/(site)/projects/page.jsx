import Link from "next/link";
import CTA from "@/components/CTA";
import Reveal from "@/components/Reveal";
import ProjectsBrowser from "@/components/ProjectsBrowser";
import { SparklesIcon } from "@/components/icons";
import { getAllProjects } from "@/lib/projectsData";

export const metadata = {
  title: "Projects & Work Portfolio — House Electric",
  description:
    "Explore our portfolio of completed electrical projects across homes, luxury villas, and commercial buildings. Browse photo albums, installation milestones, and safety audits.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Electrical Projects & Case Studies — House Electric",
    description:
      "A look at House Electric's recent electrical repair, installation, health check and maintenance albums across homes and businesses.",
    url: "/projects",
    type: "website",
  },
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <main>
      {/* Executive Hero Banner with Breadcrumbs & Title Ornament */}
      <section className="relative overflow-hidden bg-cream py-14 sm:py-16 md:py-20 border-b border-line/70">
        {/* Subtle radial dot matrix & ambient lighting glow */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #141414 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-yellow/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative z-[1] mx-auto max-w-wrap px-6 text-center">
          <Reveal>
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold text-muted">
              <Link href="/" className="hover:text-yellow-dark transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-amber-800 font-black">Projects</span>
            </div>

            {/* Utopia-style Title Ornament */}
            <div className="mb-3.5 inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-4 py-1 text-xs font-black uppercase tracking-widest text-amber-900 shadow-2xs">
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
              <span>Project Work &amp; Portfolio Albums</span>
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
            </div>

            <h1 className="text-[clamp(2.1rem,4vw,3.4rem)] font-black tracking-tight leading-tight text-ink">
              Projects We Have{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow to-amber-600 bg-clip-text text-transparent">
                Done
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-body">
              Browse our portfolio of residential, commercial, and industrial electrical installations.
              Open any project folder to see its full photo gallery.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Project Folders */}
      <section className="py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-wrap px-6">
          <ProjectsBrowser initialProjects={projects} />
        </div>
      </section>

      <CTA />
    </main>
  );
}

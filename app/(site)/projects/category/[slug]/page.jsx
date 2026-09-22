import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CTA from "@/components/CTA";
import Reveal from "@/components/Reveal";
import ProjectsBrowser from "@/components/ProjectsBrowser";
import { SparklesIcon } from "@/components/icons";
import { getProjectCategoryCards, getProjectsByCategorySlug } from "@/lib/projectsData";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const categories = await getProjectCategoryCards();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return { title: "Category Not Found — House Electric" };
  return {
    title: `${category.name} Projects — House Electric`,
    description: `Completed ${category.name.toLowerCase()} electrical project albums by House Electric.`,
    alternates: { canonical: `/projects/category/${params.slug}` },
  };
}

export async function generateStaticParams() {
  const categories = await getProjectCategoryCards();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function ProjectCategoryPage({ params }) {
  const [categories, projects] = await Promise.all([
    getProjectCategoryCards(),
    getProjectsByCategorySlug(params.slug),
  ]);
  const category = categories.find((c) => c.slug === params.slug);

  if (!category || projects.length === 0) notFound();

  // Only one album in this category — skip the pointless intermediate list
  // page and take the visitor straight to that album's own detail page.
  if (projects.length === 1) {
    redirect(`/projects/${projects[0].slug || projects[0].id}`);
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-cream py-14 sm:py-16 md:py-20 border-b border-line/70">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #141414 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-yellow/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative z-[1] mx-auto max-w-wrap px-6 text-center">
          <Reveal>
            <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold text-muted">
              <Link href="/" className="hover:text-yellow-dark transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/projects" className="hover:text-yellow-dark transition-colors">
                Projects
              </Link>
              <span>/</span>
              <span className="text-amber-800 font-black">{category.name}</span>
            </div>

            <div className="mb-3.5 inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-4 py-1 text-xs font-black uppercase tracking-widest text-amber-900 shadow-2xs">
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
              <span>{category.name} Albums</span>
              <SparklesIcon className="h-3.5 w-3.5 text-yellow-dark" />
            </div>

            <h1 className="text-[clamp(2.1rem,4vw,3.4rem)] font-black tracking-tight leading-tight text-ink">
              {category.name}{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow to-amber-600 bg-clip-text text-transparent">
                Projects
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-body">
              {projects.length} completed {category.name.toLowerCase()} project{projects.length === 1 ? "" : "s"}.
              Click any album below to see the full photo gallery.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-wrap px-6">
          <ProjectsBrowser initialProjects={projects} />
        </div>
      </section>

      <CTA />
    </main>
  );
}

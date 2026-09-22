import { notFound } from "next/navigation";
import CTA from "@/components/CTA";
import ProjectGalleryView from "@/components/ProjectGalleryView";
import { getAllProjects, getProjectByIdOrSlug } from "@/lib/projectsData";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const project = await getProjectByIdOrSlug(params.id);
  if (!project) {
    return { title: "Project Not Found — House Electric" };
  }
  return {
    title: `${project.title} — Projects | House Electric`,
    description: project.description,
    openGraph: {
      title: `${project.title} — House Electric`,
      description: project.description,
      images: [{ url: project.cover_image }],
    },
  };
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  const paramsList = [];
  for (const p of projects) {
    if (p.id) paramsList.push({ id: String(p.id) });
    if (p.slug) paramsList.push({ id: String(p.slug) });
  }
  return paramsList;
}

export default async function ProjectDetailPage({ params }) {
  const [project, allProjects] = await Promise.all([
    getProjectByIdOrSlug(params.id),
    getAllProjects(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <main className="bg-cream/40 min-h-screen">
      <section className="py-10 sm:py-14 md:py-16">
        <div className="mx-auto max-w-wrap px-6">
          <ProjectGalleryView project={project} allProjects={allProjects} />
        </div>
      </section>

      <CTA />
    </main>
  );
}

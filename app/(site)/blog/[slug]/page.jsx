import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard, { readTime } from "@/components/BlogCard";
import BlogCTA from "@/components/BlogCTA";
import ReadingProgress from "@/components/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";
import { ArrowLeftIcon, CalendarIcon, ChevronRightIcon, ClockIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

const SITE_URL = "https://houseelectric.in";

const fmtLong = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

async function getPost(slug) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data;
}

async function getRelated(category, slug) {
  if (!supabase || !category) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, category, cover_image, cover_image_alt, content, published_at, created_at")
    .eq("status", "published")
    .eq("category", category)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post Not Found — House Electric" };

  const title = post.seo_title || `${post.title} — House Electric`;
  const description = post.seo_description || post.excerpt;

  return {
    title,
    description,
    keywords: post.tags?.length > 0 ? post.tags.join(", ") : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${post.slug}`,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.cover_image_alt || post.title }] : undefined,
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await getRelated(post.category, post.slug);
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo_description || post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { "@type": "Organization", name: post.author || "House Electric Team" },
    publisher: { "@type": "Organization", name: "House Electric" },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      {/* Dark gradient hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink via-[#1a1a1a] to-[#3a2c0d] py-12 text-center md:py-20">
        <div className="glow-blob left-[15%] top-[-30%] h-[260px] w-[260px] bg-yellow/15" />
        <div className="relative z-[1] mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="mb-6 flex items-center justify-center gap-1.5 text-[12.5px] text-white/60">
            <Link href="/" className="font-semibold text-white/80 hover:text-white">
              Home
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 text-white/40" />
            <Link href="/blog" className="font-semibold text-white/80 hover:text-white">
              Blog
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 text-white/40" />
            <span className="max-w-[200px] truncate font-bold text-white">{post.title}</span>
          </nav>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
              <CalendarIcon className="h-3.5 w-3.5" />
              {fmtLong(post.published_at || post.created_at)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
              <ClockIcon className="h-3.5 w-3.5" />
              {readTime(post.content)} min read
            </span>
          </div>

          <h1 className="mx-auto max-w-[56ch] text-[clamp(1.6rem,3.8vw,2.6rem)] font-extrabold leading-tight text-white">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Content card */}
      <article className="relative z-[2] mx-auto -mt-8 max-w-4xl px-3 sm:px-6 pb-8 md:-mt-12 w-full min-w-0">
        <div className="w-full max-w-full overflow-hidden rounded-2xl md:rounded-3xl bg-white p-5 sm:p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.18)] border border-line/80">
          {post.cover_image && (
            <div className="mb-8 mx-auto w-full overflow-hidden rounded-xl md:rounded-2xl bg-cream aspect-[16/9] max-h-[420px] shadow-sm">
              <img
                src={post.cover_image}
                alt={post.cover_image_alt || post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
            <span className="text-[13.5px] font-bold text-ink">By {post.author || "House Electric Team"}</span>
            <ShareButtons url={postUrl} title={post.title} />
          </div>

          {post.excerpt && (
            <p className="mb-8 border-l-4 border-yellow pl-5 py-1 text-[16.5px] sm:text-[17.5px] font-semibold leading-relaxed text-ink/90 bg-amber-50/40 rounded-r-xl break-words">
              {post.excerpt}
            </p>
          )}

          <div
            className="prose-content w-full max-w-full text-[15.5px] sm:text-[16.5px] leading-relaxed text-charcoal/90 break-words [overflow-wrap:anywhere] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 border-t border-line/80 pt-6">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[14px] font-extrabold text-ink hover:text-yellow-dark transition-colors">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-cream/60 py-16 md:py-20">
          <div className="mx-auto max-w-wrap px-6">
            <h2 className="mb-10 text-center text-[clamp(1.4rem,2.6vw,1.9rem)] font-extrabold text-ink">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r.slug} post={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <BlogCTA />
    </main>
  );
}

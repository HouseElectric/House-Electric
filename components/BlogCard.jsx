import Link from "next/link";
import { CalendarIcon, ClockIcon } from "./icons";

const readTime = (html) => {
  const words = (html || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function BlogCard({ post }) {
  return (
    <article className="card-hover group relative flex flex-col overflow-hidden rounded-[18px] border border-black/[0.06] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <span className="absolute inset-x-0 top-0 z-[3] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-yellow-dark to-yellow transition-transform duration-300 group-hover:scale-x-100" />

      <Link href={`/blog/${post.slug}`} className="relative block h-[210px] overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.cover_image_alt || post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.09]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-cream text-body">No image</div>
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {post.category && (
          <span className="absolute bottom-4 left-4 z-[2] rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow">
            {post.category}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-body/70">
          <CalendarIcon className="h-3 w-3" />
          {fmt(post.published_at || post.created_at)}
          <span className="text-line">•</span>
          <ClockIcon className="h-3 w-3" />
          {readTime(post.content)} min read
        </div>
        <h3 className="mb-2.5 min-h-[3.2rem] text-[18px] font-extrabold leading-tight text-ink transition-colors group-hover:text-yellow-dark">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p className="mb-5 line-clamp-2 min-h-[2.9em] text-[14px] leading-relaxed text-body">{post.excerpt}</p>
        )}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-md bg-gradient-to-r from-yellow-dark to-yellow px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-wide text-ink shadow-[0_4px_10px_rgba(242,176,30,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(242,176,30,0.45)]"
        >
          Read Article
        </Link>
      </div>
    </article>
  );
}

export { readTime, fmt };

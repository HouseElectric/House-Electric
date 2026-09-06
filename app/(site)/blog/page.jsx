import BlogCTA from "@/components/BlogCTA";
import BlogGrid from "@/components/BlogGrid";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Electrical Safety Tips — House Electric Blog",
  description:
    "Practical electrical safety and maintenance tips from House Electric — for homeowners, shop owners and facility managers.",
};

export const revalidate = 60;

const FALLBACK_POSTS = [
  {
    slug: null,
    title: "5 Warning Signs Your Wiring Needs Attention",
    category: "Safety",
    excerpt:
      "Flickering lights, warm switch plates, a burning smell near sockets, MCBs that trip often, or discoloured plug points are all signs your wiring may be under stress.",
  },
  {
    slug: null,
    title: "Why Your MCB Keeps Tripping (And When to Worry)",
    category: "Troubleshooting",
    excerpt:
      "Occasional trips from running too many heavy appliances at once are usually harmless. Frequent, unexplained trips usually mean a fault worth inspecting.",
  },
  {
    slug: null,
    title: "What Is Earthing, and Why Does It Matter?",
    category: "Basics",
    excerpt:
      "Earthing gives electricity a safe path to the ground if something goes wrong, protecting people from shocks and equipment from damage.",
  },
];

async function getPosts() {
  if (!supabase) return FALLBACK_POSTS;
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, category, cover_image, cover_image_alt, content, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data && data.length > 0 ? data : FALLBACK_POSTS;
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main>
      {/* Dark gradient hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink via-[#1a1a1a] to-[#3a2c0d] py-20 text-center md:py-28">
        <div className="glow-blob left-[10%] top-[-20%] h-[300px] w-[300px] bg-yellow/15" />
        <div className="glow-blob right-[5%] bottom-[-25%] h-[280px] w-[280px] bg-yellow/10" />
        <div className="relative z-[1] mx-auto max-w-3xl px-6">
          <span className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-wider text-white backdrop-blur">
            Electrical Tips
          </span>
          <h1 className="mb-4 text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-tight text-white">
            Electrical Safety &amp; Maintenance Tips
          </h1>
          <p className="mx-auto max-w-[56ch] text-[16px] leading-relaxed text-white/75">
            Practical, no-nonsense guidance from our technicians — for homeowners, shop owners and facility managers.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-wrap px-6">
          <BlogGrid posts={posts} />
        </div>
      </section>

      <BlogCTA />
    </main>
  );
}

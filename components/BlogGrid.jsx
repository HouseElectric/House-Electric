"use client";

import { useMemo, useState } from "react";
import BlogCard from "./BlogCard";

export default function BlogGrid({ posts }) {
  const [activeCat, setActiveCat] = useState("all");

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))],
    [posts]
  );

  const filtered = activeCat === "all" ? posts : posts.filter((p) => p.category === activeCat);

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat("all")}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
              activeCat === "all" ? "border-ink bg-ink text-white" : "border-line bg-white text-body hover:border-ink"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                activeCat === cat ? "border-ink bg-ink text-white" : "border-line bg-white text-body hover:border-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
}

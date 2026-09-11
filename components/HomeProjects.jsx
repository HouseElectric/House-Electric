"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";
import { ImageIcon } from "./icons";

export default function HomeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(6);
      setProjects(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (!loading && projects.length === 0) return null;

  return (
    <section className="py-16 md:py-[80px]">
      <div className="mx-auto max-w-wrap px-6">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[60ch]">
            <p className="eyebrow">Recent Work</p>
            <h2 className="text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold leading-tight">
              A Look At Our <span className="text-yellow">Recent Projects</span>
            </h2>
          </div>
          <a
            href="/projects"
            className="whitespace-nowrap text-[13.5px] font-extrabold text-ink underline decoration-line underline-offset-4 hover:text-yellow-dark hover:decoration-yellow-dark"
          >
            View All Projects
          </a>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-cream" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06}>
                <div className="group relative aspect-square overflow-hidden rounded-2xl border border-line/80 bg-cream shadow-sm">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title || "House Electric project"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-body/30">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/0 to-black/0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div>
                      {p.category && (
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-yellow">{p.category}</span>
                      )}
                      {p.title && <span className="block text-[12.5px] font-bold text-white">{p.title}</span>}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

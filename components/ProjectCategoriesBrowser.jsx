"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, BuildingIcon, CameraIcon, HomeIcon, WrenchIcon } from "@/components/icons";

export default function ProjectCategoriesBrowser({ categories = [] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
        <p className="text-base font-extrabold text-ink">No project albums published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
      {categories.map((c, index) => (
        <motion.div
          key={c.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
        >
          <Link
            href={`/projects/category/${c.slug}`}
            className="group relative block overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-500 hover:-translate-y-2 hover:border-amber-400 hover:shadow-2xl"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              {c.cover_image ? (
                <img
                  src={c.cover_image}
                  alt={c.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-slate-400">
                  <CameraIcon className="h-10 w-10" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 group-hover:opacity-95" />

              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-500/90 px-3 py-1 text-[11px] font-black text-white shadow-md backdrop-blur-md">
                  <CameraIcon className="h-3.5 w-3.5" />
                  <span>
                    {c.count} {c.count === 1 ? "Album" : "Albums"}
                  </span>
                </span>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col justify-end">
                <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/90 backdrop-blur-xs">
                  {c.name === "Commercial" ? (
                    <BuildingIcon className="h-3 w-3" />
                  ) : c.name === "Residential" ? (
                    <HomeIcon className="h-3 w-3" />
                  ) : (
                    <WrenchIcon className="h-3 w-3" />
                  )}
                  <span>Category</span>
                </span>

                <h3 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-sm group-hover:text-yellow transition-colors">
                  {c.name}
                </h3>

                <div className="mt-2.5 pt-2.5 border-t border-white/15 flex items-center justify-end text-xs text-slate-200">
                  <span className="inline-flex items-center gap-1 font-black text-yellow group-hover:translate-x-1 transition-transform">
                    <span>Browse Albums</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

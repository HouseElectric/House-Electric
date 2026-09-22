"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  BuildingIcon,
  CameraIcon,
  CheckCircle,
  HomeIcon,
  PinIcon,
  SparklesIcon,
  WrenchIcon,
} from "@/components/icons";

export default function ProjectsBrowser({ initialProjects = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  // Dynamically derive categories from actual database projects — ZERO hardcoding!
  const categories = useMemo(() => {
    const cats = new Set(
      initialProjects.map((p) => p.category?.trim()).filter(Boolean)
    );
    return ["All", ...Array.from(cats)];
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return initialProjects;
    return initialProjects.filter(
      (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [initialProjects, activeCategory]);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Category Filter Pills (Derived 100% from DB) */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`group inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-2.5 text-xs sm:text-[13px] font-black transition-all duration-200 ${
                  isActive
                    ? "bg-yellow text-ink shadow-md shadow-yellow/20 scale-[1.03]"
                    : "bg-white border border-slate-200/90 text-slate-700 shadow-2xs hover:border-ink hover:text-ink hover:bg-slate-50"
                }`}
              >
                <span>{cat === "All" ? "All Projects" : cat}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold transition-colors ${
                    isActive
                      ? "bg-black/15 text-ink"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {cat === "All"
                    ? initialProjects.length
                    : initialProjects.filter(
                        (p) => p.category?.toLowerCase() === cat.toLowerCase()
                      ).length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Project Folders Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p, index) => {
            const cover = p.cover_image || p.images[0]?.url || "";
            const isLocal = cover.startsWith("/");
            const photoCount = p.images?.length || 1;

            return (
              <motion.div
                layout
                key={p.id || p.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
              >
                <Link
                  href={`/projects/${p.slug || p.id}`}
                  className="group relative block overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all duration-500 hover:-translate-y-2 hover:border-amber-400 hover:shadow-2xl"
                >
                  {/* Folder Cover Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {cover ? (
                      isLocal ? (
                        <Image
                          src={cover}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />
                      ) : (
                        <img
                          src={cover}
                          alt={p.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />
                      )
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-400">
                        <CameraIcon className="h-10 w-10" />
                      </div>
                    )}

                    {/* Dark Vignette Gradient Overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 group-hover:opacity-95" />

                    {/* Top Badges Bar: Category + Folder Photo Counter */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/95 px-3 py-1 text-[11px] font-black text-ink shadow-sm backdrop-blur-md">
                        {p.category === "Commercial" ? (
                          <BuildingIcon className="h-3.5 w-3.5 text-amber-600" />
                        ) : p.category === "Residential" ? (
                          <HomeIcon className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <WrenchIcon className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        <span>{p.category}</span>
                      </span>

                      {/* Photo Album Folder Pill */}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-500/90 px-3 py-1 text-[11px] font-black text-white shadow-md backdrop-blur-md">
                        <CameraIcon className="h-3.5 w-3.5" />
                        <span>{photoCount} {photoCount === 1 ? "Photo" : "Photos"}</span>
                      </span>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col justify-end">
                      {/* Status Chip (like Utopia Decors) */}
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-200 backdrop-blur-xs">
                          <CheckCircle className="h-3 w-3 text-amber-300" />
                          <span>{p.status || "Completed"}</span>
                        </span>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-sm group-hover:text-yellow transition-colors line-clamp-2">
                        {p.title}
                      </h3>

                      {/* Location & Open Album Link */}
                      <div className="mt-2.5 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-slate-200">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-300 truncate max-w-[65%]">
                          <PinIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{p.location || "Delhi NCR"}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 font-black text-yellow group-hover:translate-x-1 transition-transform">
                          <span>View Album</span>
                          <ArrowRightIcon className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <p className="text-base font-extrabold text-ink">
            {initialProjects.length === 0
              ? "No project albums published yet."
              : "No projects found in this category."}
          </p>
          {activeCategory !== "All" && (
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className="mt-3 text-xs font-black text-amber-700 underline underline-offset-4 hover:text-amber-900"
            >
              Show all projects
            </button>
          )}
        </div>
      )}
    </div>
  );
}

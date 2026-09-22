"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, CameraIcon, CheckCircle, PinIcon } from "@/components/icons";

export default function ProjectsBrowser({ initialProjects = [] }) {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Project Folders Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
      >
        <AnimatePresence mode="popLayout">
          {initialProjects.map((p, index) => {
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

                    {/* Photo Album Folder Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-500/90 px-3 py-1 text-[11px] font-black text-white shadow-md backdrop-blur-md">
                        <CameraIcon className="h-3.5 w-3.5" />
                        <span>{photoCount} {photoCount === 1 ? "Photo" : "Photos"}</span>
                      </span>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col justify-end">
                      {/* Status / Phase Chip */}
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

      {initialProjects.length === 0 && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
          <p className="text-base font-extrabold text-ink">No project albums published yet.</p>
        </div>
      )}
    </div>
  );
}

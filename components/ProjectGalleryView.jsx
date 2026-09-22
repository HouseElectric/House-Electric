"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
  PhoneIcon,
  PinIcon,
  SparklesIcon,
  XIcon,
} from "@/components/icons";

export default function ProjectGalleryView({ project, allProjects = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = project.images || [
    { url: project.cover_image, caption: project.title },
  ];

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = useCallback(() => {
    setLightboxIndex((curr) => (curr > 0 ? curr - 1 : images.length - 1));
  }, [images.length]);

  const nextImage = useCallback(() => {
    setLightboxIndex((curr) => (curr < images.length - 1 ? curr + 1 : 0));
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, prevImage, nextImage]);

  // Lock body scroll while the lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  const otherProjects = allProjects
    .filter((p) => String(p.id) !== String(project.id) && p.slug !== project.slug)
    .slice(0, 3);

  const whatsappMessage = encodeURIComponent(
    `Hello House Electric! I was viewing your project "${project.title}" (${project.category}) on your website and would like a consultation for similar work.`
  );

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/70 pb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] font-bold text-muted">
          <Link href="/" className="text-ink hover:text-yellow-dark transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/projects" className="text-ink hover:text-yellow-dark transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-amber-800 truncate max-w-[200px] sm:max-w-md font-black">
            {project.title}
          </span>
        </div>

        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-black text-ink shadow-2xs hover:border-ink hover:bg-slate-50 transition-all w-fit"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Projects</span>
        </Link>
      </div>

      {/* Project Overview Card — title, location, description only */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink tracking-tight leading-tight">
          {project.title}
        </h1>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/70 px-3 py-1 text-xs font-black text-amber-900 shadow-2xs">
          <PinIcon className="h-3.5 w-3.5 text-yellow-dark" />
          <span>{project.location || "Delhi NCR"}</span>
        </span>

        <p className="text-sm sm:text-base leading-relaxed text-body pt-1">
          {project.description}
        </p>
      </div>

      {/* Album Photos Section ("Uss project se related images") */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-line/70 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 mb-1">
              <CameraIcon className="h-4 w-4" />
              <span>Project Photo Gallery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-ink">
              All Photos for this Project ({images.length})
            </h2>
          </div>
          <p className="text-xs text-muted font-bold">
            Click any photo to open full-screen lightbox
          </p>
        </div>

        {/* Gallery Grid: Feature photo + secondary photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {images.map((img, idx) => {
            const isLocal = img.url?.startsWith("/");
            return (
              <div
                key={idx}
                onClick={() => openLightbox(idx)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-100 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {isLocal ? (
                    <Image
                      src={img.url}
                      alt={img.caption || project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={img.url}
                      alt={img.caption || project.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Dark gradient on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />

                  {/* Top Zoom Tag */}
                  <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur-xs">
                      <CameraIcon className="h-4 w-4" />
                    </span>
                  </div>

                  {/* Bottom Caption Pill */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-sm line-clamp-2">
                      {img.caption || `Project View #${idx + 1}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consultation Banner (Utopia Decors Style) */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-yellow/15 to-amber-500/10 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
              <SparklesIcon className="h-4 w-4 text-yellow-dark" />
              <span>Transform Your Space</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-ink">
              Planning a Similar Electrical Project?
            </h3>
            <p className="text-xs sm:text-sm text-body leading-relaxed">
              Consult with our certified electrical engineers for site inspection, load feasibility, and transparent upfront quotations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href="tel:+919899312588"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300/90 bg-white px-5 py-3 text-xs sm:text-sm font-black text-ink shadow-2xs hover:border-ink hover:shadow-xs transition-all w-full sm:w-auto"
            >
              <PhoneIcon className="h-4 w-4 text-amber-600" />
              <span>Call Studio</span>
            </a>

            <a
              href={`https://wa.me/919899312588?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-sm hover:bg-emerald-700 transition-all w-full sm:w-auto"
            >
              <span>WhatsApp Us</span>
              <ArrowRightIcon className="h-4 w-4" />
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow px-6 py-3 text-xs sm:text-sm font-black text-ink shadow-sm hover:bg-yellow-dark transition-all w-full sm:w-auto"
            >
              <span>Book Site Visit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Explore More Project Albums */}
      {otherProjects.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-line/70">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-ink">
              Explore More Project Albums
            </h3>
            <Link
              href="/projects"
              className="text-xs font-black text-amber-700 hover:text-amber-900 underline underline-offset-4"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {otherProjects.map((op) => (
              <Link
                key={op.id || op.slug}
                href={`/projects/${op.slug || op.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {op.cover_image?.startsWith("/") ? (
                    <Image
                      src={op.cover_image}
                      alt={op.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={op.cover_image}
                      alt={op.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3.5 flex flex-col justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow">
                      {op.category} · {op.images?.length || 1} Photos
                    </span>
                    <b className="text-xs sm:text-sm font-extrabold text-white truncate drop-shadow-xs mt-0.5">
                      {op.title}
                    </b>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Full-Screen Lightbox Modal — portaled to <body> so the page's
          framer-motion page-transition wrapper (which sets a transform, creating a new
          containing block) can't clip this fixed-position overlay or offset it from the
          true viewport. */}
      {typeof document !== "undefined" && createPortal(
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Top Toolbar */}
            <div
              className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-xs font-bold backdrop-blur-xs">
                  Photo {lightboxIndex + 1} of {images.length}
                </span>
                <span className="hidden sm:inline text-xs text-slate-300 font-bold truncate max-w-xs">
                  {project.title}
                </span>
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 hover:scale-110"
                aria-label="Close Lightbox"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Prev Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 sm:left-6 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-all hover:bg-white/30 hover:scale-110"
              aria-label="Previous Photo"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 sm:right-6 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur-xs transition-all hover:bg-white/30 hover:scale-110"
              aria-label="Next Photo"
            >
              <ArrowRightIcon className="h-6 w-6" />
            </button>

            {/* Centered Image View */}
            <div
              className="relative max-h-[80vh] max-w-[90vw] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightboxIndex].url}
                alt={images[lightboxIndex].caption || project.title}
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
              />
              {images[lightboxIndex].caption && (
                <p className="mt-4 text-center text-xs sm:text-sm font-bold text-slate-200 max-w-xl bg-black/50 px-4 py-2 rounded-xl backdrop-blur-xs">
                  {images[lightboxIndex].caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}

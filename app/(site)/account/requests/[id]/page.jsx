"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import { STATUS_META, STEPS } from "@/lib/serviceRequestMeta";
import {
  ArrowLeftIcon,
  WrenchIcon,
  CalendarIcon,
  PinIcon,
  UsersIcon,
  CheckCircle,
  StarIcon,
  XIcon,
} from "@/components/icons";

function ReviewForm({ request, onSubmitted }) {
  const { user, profile } = useCustomerAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await supabase.from("testimonials").insert([
      {
        customer_id: user.id,
        service_request_id: request.id,
        name: profile?.name || "House Electric Customer",
        role: request.service_type,
        text: text.trim(),
        rating,
        source: "customer",
        published: false,
      },
    ]);
    setSubmitting(false);
    toast.success("Thanks for your review!");
    onSubmitted();
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-amber-50/30 p-5">
      <p className="mb-2 text-sm font-extrabold text-ink">Rate &amp; Review Your Experience</p>
      <div className="mb-3 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-125"
            aria-label={`${n} star`}
          >
            <StarIcon className={`h-7 w-7 ${n <= (hoverRating || rating) ? "fill-yellow text-yellow-dark" : "fill-none text-slate-300"}`} />
          </button>
        ))}
      </div>
      <textarea
        required
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How was our electrician's service? Share your experience…"
        className="mb-3 w-full rounded-xl border border-line bg-white p-3 text-sm outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-yellow px-5 py-2.5 text-xs font-black text-ink shadow-sm hover:bg-yellow-dark disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
}

export default function ServiceRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useCustomerAuth();
  const [request, setRequest] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const fetchAll = async () => {
    if (!user) return;
    const [{ data: reqData }, { data: reviewData }] = await Promise.all([
      supabase.from("service_requests").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle(),
      supabase
        .from("testimonials")
        .select("rating, text, created_at")
        .eq("service_request_id", id)
        .eq("customer_id", user.id)
        .maybeSingle(),
    ]);
    setRequest(reqData);
    setReview(reviewData || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (loading) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Loading service request…</div>;
  }
  if (!request) {
    return <div className="rounded-3xl border border-line/80 bg-white p-12 text-center text-sm font-medium text-body">Service request not found.</div>;
  }

  const meta = STATUS_META[request.status] ?? STATUS_META.requested;
  const stepIndex = request.status === "cancelled" ? -1 : STEPS.findIndex((s) => s.id === request.status);
  const photos =
    Array.isArray(request.photo_urls) && request.photo_urls.length > 0
      ? request.photo_urls
      : request.photo_url
      ? [request.photo_url]
      : [];

  return (
    <div className="space-y-5">
      <button
        onClick={() => router.push("/account/requests")}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink transition-colors hover:text-yellow-dark"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Service Requests
      </button>

      <Reveal y={12}>
        <div className="overflow-hidden rounded-3xl border border-line/80 bg-white shadow-sm">
          {/* Status strip */}
          <div className={`flex items-center justify-between border-b px-6 py-3.5 sm:px-8 ${meta.cls}`}>
            <span className="flex items-center gap-2 text-[11.5px] font-black uppercase tracking-wider">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              Request Status
            </span>
            <span className="text-[11.5px] font-black uppercase tracking-wider">{meta.label}</span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/70 pb-5">
              <div className="flex items-center gap-3.5">
                <span className={`grid h-13 w-13 flex-none place-items-center rounded-2xl font-bold shadow-sm ring-4 ring-white ${meta.iconCls}`}>
                  <WrenchIcon className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <b className="text-lg font-extrabold text-ink">{request.service_type}</b>
                    <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 font-mono text-[11px] font-extrabold tracking-wide text-slate-600 shadow-2xs">
                      {request.ticket_number}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-body">
                    Created on {new Date(request.created_at || Date.now()).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div className="mt-5">
                <p className="mb-1.5 text-[11px] font-bold uppercase text-muted">Problem Details</p>
                <p className="text-sm font-medium text-body leading-relaxed">{request.description}</p>
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="mt-5">
                <p className="mb-1.5 text-[11px] font-bold uppercase text-muted">
                  Attached Photo{photos.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {photos.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setLightboxUrl(url)}
                      className="group/photo relative block overflow-hidden rounded-2xl border border-line shadow-2xs transition-all hover:shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Attached photo ${i + 1}`}
                        className="h-28 w-28 object-cover transition-transform duration-300 group-hover/photo:scale-110"
                      />
                      <span className="absolute inset-0 bg-black/0 transition-colors group-hover/photo:bg-black/10" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            {stepIndex >= 0 && (
              <div className="mt-6 border-t border-line/70 pt-5">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-muted">Service Progress</p>
                <div className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-5">
                  {STEPS.map((s, i) => {
                    const isDone = i <= stepIndex;
                    const isCurrent = request.status !== "completed" && i === stepIndex;
                    return (
                      <div key={s.id} className="space-y-1.5">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          {isDone && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                              className={`h-full rounded-full ${isCurrent ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`}
                            />
                          )}
                        </div>
                        <span className={`flex items-start gap-1 text-[10px] font-extrabold leading-tight sm:text-[10.5px] ${isDone ? "text-ink" : "text-muted"}`}>
                          {isDone && !isCurrent && <CheckCircle className="h-3 w-3 flex-none translate-y-px text-emerald-600" />}
                          <span>{s.label}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-line/70 pt-5">
              {request.location && (
                <span className="flex items-center gap-1.5 rounded-full border border-line bg-slate-50 px-3.5 py-1.5 text-[11.5px] font-semibold text-body">
                  <PinIcon className="h-3.5 w-3.5 text-muted" />
                  {request.location}
                </span>
              )}
              {request.preferred_date && (
                <span className="flex items-center gap-1.5 rounded-full border border-line bg-slate-50 px-3.5 py-1.5 text-[11.5px] font-semibold text-body">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted" />
                  {request.preferred_date} {request.preferred_time ? `· ${request.preferred_time}` : ""}
                </span>
              )}
              {request.technician_name && (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11.5px] font-extrabold text-amber-800">
                  <UsersIcon className="h-3.5 w-3.5 text-amber-600" />
                  {request.technician_name}
                </span>
              )}
            </div>

            {request.admin_notes && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="mb-1 text-[11px] font-bold uppercase text-blue-700">Note from House Electric</p>
                <p className="text-sm font-medium text-blue-900">{request.admin_notes}</p>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Review section */}
      {request.status === "completed" && (
        <Reveal delay={0.1}>
          {review ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6">
              <div className="mb-2 flex items-center gap-2 text-emerald-800">
                <CheckCircle className="h-4 w-4" />
                <b className="text-sm font-extrabold">Your Review</b>
              </div>
              <div className="mb-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon
                    key={n}
                    className={`h-5 w-5 ${n <= review.rating ? "fill-yellow text-yellow-dark" : "fill-none text-slate-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-ink leading-relaxed">{review.text}</p>
              <p className="mt-2 text-[11px] font-semibold text-emerald-700/70">
                Submitted on {new Date(review.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ) : (
            <ReviewForm request={request} onSubmitted={fetchAll} />
          )}
        </Reveal>
      )}

      {/* Photo Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <button
              onClick={() => setLightboxUrl(null)}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              src={lightboxUrl}
              alt="Attached photo — full size"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

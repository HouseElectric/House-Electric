"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { STATUS_META, STEPS, stepIndexFor, stepTimestamps } from "@/lib/serviceRequestMeta";
import {
  ArrowLeftIcon,
  WrenchIcon,
  CalendarIcon,
  PinIcon,
  CheckCircle,
  StarIcon,
  AlertIcon,
  ReportIcon,
  PhoneIcon,
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
    if (request.technician_id) {
      await supabase.from("notifications").insert([
        {
          technician_id: request.technician_id,
          title: `New review: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}`,
          message: `${profile?.name || "A customer"} rated your work on ${request.ticket_number}${text.trim() ? ` — "${text.trim()}"` : ""}`,
        },
      ]);
    }
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
  const [quotation, setQuotation] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const fetchAll = async () => {
    if (!user) return;
    const [{ data: reqData }, { data: reviewData }, { data: historyData }] = await Promise.all([
      supabase.from("service_requests").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle(),
      supabase
        .from("testimonials")
        .select("rating, text, created_at")
        .eq("service_request_id", id)
        .eq("customer_id", user.id)
        .maybeSingle(),
      supabase
        .from("service_request_status_history")
        .select("status, changed_at")
        .eq("service_request_id", id)
        .order("changed_at", { ascending: true }),
    ]);
    setRequest(reqData);
    setReview(reviewData || null);
    setStatusHistory(historyData ?? []);
    if (reqData) {
      const { data: qs } = await supabase
        .from("quotations")
        .select("id, quotation_number, status, total")
        .eq("service_request_id", id)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      setQuotation(qs?.[0] || null);
    }
    setLoading(false);
  };

  const confirmCompletion = async () => {
    setConfirming(true);
    await supabase
      .from("service_requests")
      .update({ status: "confirmed", customer_confirmed: true, customer_confirmed_at: new Date().toISOString() })
      .eq("id", id);
    setConfirming(false);
    toast.success("Thanks for confirming!");
    fetchAll();
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
  const stepIndex = stepIndexFor(request.status);
  const exactStepTimes = stepTimestamps(statusHistory);
  const formatStamp = (iso) =>
    iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : null;
  // Step 1 always has a real timestamp (the request's own creation time). Every other step
  // only gets one if it was actually logged individually — older requests that jumped several
  // steps at once (before this history table existed) simply don't have that data, and showing
  // a borrowed/duplicate time for those would be misleading rather than helpful.
  const stepTimeFor = (i) => (i === 0 ? request.created_at : exactStepTimes[STEPS[i].id]);
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
          <div className={`flex items-center justify-between border-b px-4 py-3 sm:px-8 sm:py-3.5 ${meta.cls}`}>
            <span className="flex items-center gap-2 text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              Request Status
            </span>
            <span className="text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider">{meta.label}</span>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/70 pb-5">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <span className={`grid h-10 w-10 sm:h-13 sm:w-13 shrink-0 place-items-center rounded-xl sm:rounded-2xl font-bold shadow-sm ring-2 sm:ring-4 ring-white ${meta.iconCls}`}>
                  <WrenchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
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
                      className="group/photo relative block max-w-[220px] overflow-hidden rounded-2xl border border-line bg-slate-50 shadow-2xs transition-all hover:shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Attached photo ${i + 1}`}
                        className="h-32 w-auto max-w-[220px] object-contain transition-transform duration-300 group-hover/photo:scale-105"
                      />
                      <span className="absolute inset-0 bg-black/0 transition-colors group-hover/photo:bg-black/10" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {Array.isArray(request.video_urls) && request.video_urls.length > 0 && (
              <div className="mt-5">
                <p className="mb-1.5 text-[11px] font-bold uppercase text-muted">
                  Attached Video{request.video_urls.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {request.video_urls.map((url, i) => (
                    <video
                      key={url + i}
                      src={url}
                      controls
                      className="h-48 w-auto max-w-full rounded-2xl border border-line bg-black object-contain shadow-2xs"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            {stepIndex >= 0 && (
              <div className="mt-6 border-t border-line/70 pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Service Progress</p>
                  <span className="text-[11px] font-bold text-body">
                    Step {Math.min(stepIndex + 1, STEPS.length)} of {STEPS.length}
                  </span>
                </div>
                <div className="rounded-2xl border border-line/70 bg-gradient-to-br from-slate-50 via-white to-white p-4 sm:p-5">
                  <div className="grid grid-cols-3 gap-x-1 gap-y-5 sm:grid-cols-5 sm:gap-x-2">
                    {STEPS.map((s, i) => {
                      const isDone = i <= stepIndex;
                      const isCurrent = request.status !== "completed" && i === stepIndex;
                      return (
                        <div key={s.id} className="flex flex-col items-center text-center">
                          <div className="relative flex w-full items-center">
                            <div className={`h-[3px] w-1/2 rounded-full ${i === 0 ? "invisible" : isDone ? "bg-emerald-400" : "bg-slate-200"}`} />
                            <div className="relative flex-none">
                              {isCurrent && <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/60" />}
                              <span
                                className={`relative grid h-7 w-7 flex-none place-items-center rounded-full border-2 text-[11px] font-extrabold shadow-sm ${
                                  isCurrent
                                    ? "border-amber-500 bg-amber-400 text-white"
                                    : isDone
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-slate-200 bg-white text-muted"
                                }`}
                              >
                                {isDone && !isCurrent ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                              </span>
                            </div>
                            <div className={`h-[3px] w-1/2 rounded-full ${i === STEPS.length - 1 ? "invisible" : i < stepIndex ? "bg-emerald-400" : "bg-slate-200"}`} />
                          </div>
                          <span className={`mt-2 text-[10px] font-extrabold leading-tight sm:text-[10.5px] ${isCurrent ? "text-amber-700" : isDone ? "text-ink" : "text-muted"}`}>
                            {s.label}
                          </span>
                          {isDone && stepTimeFor(i) && (
                            <span className="mt-0.5 text-[9px] font-semibold leading-tight text-muted/80">{formatStamp(stepTimeFor(i))}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Technician */}
            {request.technician_name && (
              <div className="mt-6 flex flex-col gap-3.5 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-white to-white p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4">
                  {request.technician_photo ? (
                    <img
                      src={request.technician_photo}
                      alt={request.technician_name}
                      className="h-12 w-12 flex-none rounded-full border-2 border-white object-cover shadow-sm sm:h-14 sm:w-14"
                    />
                  ) : (
                    <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[16px] font-extrabold text-white shadow-sm sm:h-14 sm:w-14 sm:text-[18px]">
                      {request.technician_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-amber-700">Assigned Technician</p>
                    <p className="text-[15px] font-extrabold leading-snug text-ink break-words">{request.technician_name}</p>
                  </div>
                </div>
                {request.technician_phone && (
                  <a
                    href={`tel:${request.technician_phone.replace(/\s+/g, "")}`}
                    className="flex flex-none items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span className="sm:hidden">Call {request.technician_phone}</span>
                    <span className="hidden sm:inline">{request.technician_phone}</span>
                  </a>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line/70 pt-5">
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
              {request.scheduled_date && (
                <span className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1.5 text-[11.5px] font-extrabold text-cyan-800">
                  <CalendarIcon className="h-3.5 w-3.5 text-cyan-600" />
                  Visit: {request.scheduled_date} {request.scheduled_time ? `· ${request.scheduled_time}` : ""}
                </span>
              )}
            </div>

            {request.admin_notes && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="mb-1 text-[11px] font-bold uppercase text-blue-700">Note from House Electric</p>
                <p className="text-sm font-medium text-blue-900">{request.admin_notes}</p>
              </div>
            )}

            {/* Additional material/work approval banner */}
            {(request.status === "material_required" || request.status === "customer_approval_pending") && (
              <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertIcon className="mt-0.5 h-4 w-4 flex-none text-orange-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-orange-900">
                      {quotation ? "Approval needed for additional material/work" : "Additional material or work may be required"}
                    </p>
                    <p className="mt-1 text-[13px] text-orange-800">
                      {quotation
                        ? `A quote (${quotation.quotation_number}) for ₹${Number(quotation.total).toLocaleString("en-IN")} is ready — please review and approve so we can proceed.`
                        : "Our technician found this needs material or work outside your AMC coverage. We'll send you a quote shortly for approval — nothing is charged automatically."}
                    </p>
                    {quotation && (
                      <Link
                        href={`/account/quotations/${quotation.id}`}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-orange-700"
                      >
                        <ReportIcon className="h-3.5 w-3.5" />
                        Review Quote
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Service report */}
            {(request.diagnosis || request.work_performed || request.material_used || request.before_photos?.length > 0 || request.after_photos?.length > 0) && (
              <div className="mt-5 rounded-2xl border border-line/70 bg-slate-50/60 p-4">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-muted">Service Report</p>
                <div className="space-y-2.5 text-[13.5px] text-ink">
                  {request.diagnosis && (
                    <p>
                      <b className="font-bold">Diagnosis:</b> {request.diagnosis}
                    </p>
                  )}
                  {request.work_performed && (
                    <p>
                      <b className="font-bold">Work Performed:</b> {request.work_performed}
                    </p>
                  )}
                  {request.material_used && (
                    <p>
                      <b className="font-bold">Material Used:</b> {request.material_used}
                    </p>
                  )}
                </div>
                {(request.before_photos?.length > 0 || request.after_photos?.length > 0) && (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {request.before_photos?.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-bold text-muted">Before</p>
                        <div className="flex flex-wrap gap-2">
                          {request.before_photos.map((url, i) => (
                            <button key={url + i} type="button" onClick={() => setLightboxUrl(url)}>
                              <img src={url} alt="Before" className="h-16 w-16 rounded-lg border border-line object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {request.after_photos?.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-bold text-muted">After</p>
                        <div className="flex flex-wrap gap-2">
                          {request.after_photos.map((url, i) => (
                            <button key={url + i} type="button" onClick={() => setLightboxUrl(url)}>
                              <img src={url} alt="After" className="h-16 w-16 rounded-lg border border-line object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Confirm completion */}
            {request.status === "completed" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-[13.5px] font-bold text-emerald-900">Is everything working as expected?</p>
                <button
                  onClick={confirmCompletion}
                  disabled={confirming}
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-5 py-2.5 text-[12.5px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {confirming ? "Confirming…" : "Confirm Completion"}
                </button>
              </div>
            )}
            {["confirmed", "closed"].includes(request.status) && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50/60 p-4 text-[13.5px] font-bold text-teal-900">
                <CheckCircle className="h-4 w-4 flex-none" />
                You confirmed this request was completed to your satisfaction.
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Review section */}
      {["completed", "confirmed", "closed"].includes(request.status) && (
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

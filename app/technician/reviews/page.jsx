"use client";

import { useEffect, useMemo, useState } from "react";
import TechnicianGuard from "@/components/TechnicianGuard";
import TechnicianLayout from "@/components/TechnicianLayout";
import { useTechnicianAuth } from "@/contexts/TechnicianAuthContext";
import { supabase } from "@/lib/supabase";
import { StarIcon, UserIcon } from "@/components/icons";

function StarRow({ rating, size = "h-4 w-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`${size} ${n <= rating ? "fill-yellow text-yellow-dark" : "fill-none text-slate-300"}`} />
      ))}
    </div>
  );
}

const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "highest", label: "Highest rated" },
  { key: "lowest", label: "Lowest rated" },
];

function ReviewsContent() {
  const { technician } = useTechnicianAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    if (!technician) return;
    (async () => {
      const { data: requests } = await supabase.from("service_requests").select("id, ticket_number, service_type").eq("technician_id", technician.id);
      const requestIds = (requests ?? []).map((j) => j.id);
      if (requestIds.length === 0) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("testimonials")
        .select("rating, text, name, created_at, service_request_id")
        .in("service_request_id", requestIds)
        .not("rating", "is", null)
        .order("created_at", { ascending: false });
      const jobById = new Map((requests ?? []).map((j) => [j.id, j]));
      setReviews((data ?? []).map((r) => ({ ...r, job: jobById.get(r.service_request_id) })));
      setLoading(false);
    })();
  }, [technician]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg = count ? reviews.reduce((s, r) => s + Number(r.rating), 0) / count : null;
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => Number(r.rating) === star).length,
    }));
    return { count, avg: avg ? avg.toFixed(1) : null, breakdown };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = ratingFilter === "all" ? reviews : reviews.filter((r) => Number(r.rating) === Number(ratingFilter));
    list = [...list].sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sort === "highest") return b.rating - a.rating;
      if (sort === "lowest") return a.rating - b.rating;
      return 0;
    });
    return list;
  }, [reviews, ratingFilter, sort]);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[24px] font-extrabold text-ink sm:text-[28px]">My Reviews</h1>
        <p className="mt-1.5 text-[14.5px] text-body">Feedback customers have left on your completed jobs.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-[14px] text-body">Loading reviews…</div>
      ) : stats.count === 0 ? (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-white p-14 text-center text-[14px] text-body">
          <StarIcon className="h-8 w-8 text-body/40" />
          <p className="text-[15px] font-bold text-ink">No reviews yet</p>
          <p className="max-w-[44ch] text-[13.5px] text-body/70">
            A review shows up here once a customer marks one of your jobs completed and rates the experience.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-7 max-w-3xl rounded-2xl border border-line bg-white p-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center justify-center gap-1.5 sm:border-r sm:border-line sm:pr-8">
                <p className="text-[48px] font-black leading-none text-ink">{stats.avg}</p>
                <StarRow rating={Math.round(Number(stats.avg))} size="h-5 w-5" />
                <p className="mt-1.5 text-[13.5px] font-semibold text-body">{stats.count} review{stats.count === 1 ? "" : "s"}</p>
              </div>
              <div className="flex flex-col justify-center gap-2.5">
                {stats.breakdown.map((b) => (
                  <div key={b.star} className="flex items-center gap-3.5">
                    <span className="w-10 flex-none text-[13px] font-bold text-body">{b.star} ★</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                      <div
                        className="h-full rounded-full bg-yellow"
                        style={{ width: stats.count ? `${(b.count / stats.count) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="w-6 flex-none text-right text-[13px] font-semibold text-body">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["all", 5, 4, 3, 2, 1].map((key) => (
                <button
                  key={key}
                  onClick={() => setRatingFilter(key)}
                  className={`rounded-xl px-4 py-2.5 text-[13.5px] font-extrabold transition-all ${
                    ratingFilter === key ? "bg-ink text-white" : "border border-line bg-white text-body hover:text-ink"
                  }`}
                >
                  {key === "all" ? "All" : `${key} ★`}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-ink outline-none focus:border-ink sm:w-auto"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center text-[14px] text-body">No reviews match this filter.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r) => (
                <div key={`${r.service_request_id}-${r.created_at}`} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <StarRow rating={r.rating} />
                      <p className="mt-2 flex items-center gap-2 text-[15px] font-bold text-ink">
                        <UserIcon className="h-4 w-4 text-body/50" />
                        {r.name || "Customer"}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[12.5px] font-semibold text-muted">{r.job?.ticket_number || "—"}</p>
                      <p className="text-[12.5px] text-body/70">{r.job?.service_type || ""}</p>
                      <p className="mt-0.5 text-[11.5px] text-body/50">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  {r.text && <p className="mt-3 text-[14.5px] leading-relaxed text-body">{r.text}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TechnicianReviewsPage() {
  return (
    <TechnicianGuard>
      <TechnicianLayout title="My Reviews">
        <ReviewsContent />
      </TechnicianLayout>
    </TechnicianGuard>
  );
}

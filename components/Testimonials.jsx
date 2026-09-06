"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import { supabase } from "@/lib/supabase";

const FALLBACK = [
  {
    text: "Excellent service and very professional team. They identified issues we didn't even know about. Highly recommended.",
    name: "Rohit Sharma",
    role: "Homeowner",
    img: "https://i.pravatar.cc/100?img=12",
  },
  {
    text: "We have taken AMC for our office and the service has been outstanding. Prompt response and great support.",
    name: "Priya Mehta",
    role: "Office Manager",
    img: "https://i.pravatar.cc/100?img=45",
  },
  {
    text: "Quick and reliable service during an emergency. Highly professional and courteous staff.",
    name: "Aman Verma",
    role: "Business Owner",
    img: "https://i.pravatar.cc/100?img=33",
  },
  {
    text: "The electrical health check caught a wiring fault before it became a serious problem. Very thorough report.",
    name: "Sunita Rao",
    role: "Property Manager",
    img: "https://i.pravatar.cc/100?img=20",
  },
  {
    text: "Professional, punctual and transparent about pricing. Our go-to team for anything electrical now.",
    name: "Vikram Nair",
    role: "Shop Owner",
    img: "https://i.pravatar.cc/100?img=51",
  },
  {
    text: "Great experience getting our AMC set up for the factory. Peace of mind knowing they're a call away.",
    name: "Meera Iyer",
    role: "Facility Head",
    img: "https://i.pravatar.cc/100?img=47",
  },
];

const PAGE = 3;

export default function Testimonials() {
  const [all, setAll] = useState(FALLBACK);
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setAll(
          data.map((t, i) => ({
            text: t.text,
            name: t.name,
            role: t.role,
            img: t.avatar_url || `https://i.pravatar.cc/100?img=${(i % 70) + 1}`,
          }))
        );
      }
    })();
  }, []);

  const pages = Math.ceil(all.length / PAGE);
  const items = all.slice(page * PAGE, page * PAGE + PAGE);

  const go = (dir) => setPage((p) => (p + dir + pages) % pages);

  // Auto-swipe effect every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setPage((p) => (p + 1) % pages);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, pages]);

  return (
    <section className="pb-16 md:pb-[74px]" id="testimonials">
      <div className="mx-auto max-w-wrap px-6">
        <div className="mb-8 flex items-end justify-between gap-5">
          <Reveal>
            <p className="eyebrow">Testimonials</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Real people. Real experiences.
            </p>
          </Reveal>
          <div className="flex gap-2.5">
            <button
              onClick={() => go(-1)}
              aria-label="Previous testimonials"
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white shadow-sm transition-all hover:bg-yellow hover:border-yellow active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2.4" className="h-4 w-4">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next testimonials"
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white shadow-sm transition-all hover:bg-yellow hover:border-yellow active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2.4" className="h-4 w-4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative min-h-[260px]"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {items.map((q, i) => (
                <motion.article
                  key={q.name + page}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col justify-between rounded-2xl border border-line/80 border-t-2 border-t-yellow/40 bg-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:border-t-yellow hover:border-yellow/50 hover:shadow-xl"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow/15 text-[22px] font-serif font-black text-ink group-hover:bg-yellow transition-colors">
                        &ldquo;
                      </span>
                      <span className="rounded-full bg-yellow/10 px-2.5 py-1 text-[12px] font-bold tracking-wider text-yellow-dark">
                        ★★★★★
                      </span>
                    </div>
                    <p className="mb-6 min-h-[72px] text-[14.5px] leading-relaxed text-ink-soft">
                      {q.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 border-t border-line/60 pt-4">
                    <img
                      src={q.img}
                      alt={q.name}
                      width={42}
                      height={42}
                      className="h-[42px] w-[42px] rounded-full object-cover ring-2 ring-yellow/40 shadow-sm"
                    />
                    <div>
                      <b className="block text-[14.5px] font-extrabold text-ink">
                        {q.name}
                      </b>
                      <span className="text-[12.5px] font-medium text-ink-soft">
                        {q.role}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to testimonial page ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === page
                    ? "w-8 bg-yellow shadow-sm"
                    : "w-2.5 bg-line hover:bg-yellow/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

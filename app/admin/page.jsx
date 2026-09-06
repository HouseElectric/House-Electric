"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import {
  ArticleIcon,
  HomeIcon,
  ImageIcon,
  InboxIcon,
  MapIcon,
  SlidersIcon,
  StarIcon,
  WrenchIcon,
} from "@/components/icons";

const STATUS_META = {
  new: { label: "New", cls: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700" },
  closed: { label: "Closed", cls: "bg-emerald-50 text-emerald-700" },
};

const TYPE_LABELS = { booking: "Booking", amc: "AMC", corporate: "Corporate" };

const fmt = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const QUICK_ACTIONS = [
  { label: "Add Service", href: "/admin/services", icon: WrenchIcon },
  { label: "Write Blog Post", href: "/admin/blog/new", icon: ArticleIcon },
  { label: "Add Testimonial", href: "/admin/testimonials", icon: StarIcon },
  { label: "Add Project Photo", href: "/admin/projects", icon: ImageIcon },
  { label: "Edit Home Page", href: "/admin/home", icon: HomeIcon },
  { label: "Service Areas", href: "/admin/service-areas", icon: MapIcon },
  { label: "Contact Settings", href: "/admin/settings", icon: SlidersIcon },
];

function StatCard({ label, value, href, icon: Icon }) {
  return (
    <Link
      href={href}
      className="card-hover rounded-2xl border border-line bg-white p-6 transition-colors hover:border-yellow/50"
    >
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-cream text-ink">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-[13px] font-semibold text-body">{label}</div>
      <div className="mt-1 text-[32px] font-extrabold text-ink">{value}</div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ newEnquiries: 0, totalEnquiries: 0, posts: 0, testimonials: 0, projects: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [enquiries, newEnquiries, posts, testimonials, projects, recent] = await Promise.all([
        supabase.from("enquiries").select("id", { count: "exact", head: true }),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("read", false),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        totalEnquiries: enquiries.count ?? 0,
        newEnquiries: newEnquiries.count ?? 0,
        posts: posts.count ?? 0,
        testimonials: testimonials.count ?? 0,
        projects: projects.count ?? 0,
      });
      setRecentEnquiries(recent.data ?? []);
      setLoadingRecent(false);
    })();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        <p className="mb-6 max-w-[65ch] text-[13.5px] text-body">
          A quick snapshot of activity across the site. Click any card to jump straight to that section.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="New Enquiries" value={stats.newEnquiries} href="/admin/enquiries" icon={InboxIcon} />
          <StatCard label="Total Enquiries" value={stats.totalEnquiries} href="/admin/enquiries" icon={InboxIcon} />
          <StatCard label="Blog Posts" value={stats.posts} href="/admin/blog" icon={ArticleIcon} />
          <StatCard label="Testimonials" value={stats.testimonials} href="/admin/testimonials" icon={StarIcon} />
          <StatCard label="Project Photos" value={stats.projects} href="/admin/projects" icon={ImageIcon} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-3">
              <span className="text-[12px] font-bold uppercase tracking-wide text-body">Recent Enquiries</span>
              <Link href="/admin/enquiries" className="text-[12.5px] font-semibold text-ink underline underline-offset-2">
                View all
              </Link>
            </div>
            {loadingRecent ? (
              <div className="p-10 text-center text-[13.5px] text-body">Loading...</div>
            ) : recentEnquiries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-[13.5px] text-body">
                <InboxIcon className="h-6 w-6 text-body/40" />
                No enquiries yet.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {recentEnquiries.map((e) => {
                  const meta = STATUS_META[e.status] ?? STATUS_META.new;
                  return (
                    <Link
                      key={e.id}
                      href="/admin/enquiries"
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-cream/30"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="text-[13.5px] text-ink">{e.name || e.contact_person || "—"}</b>
                          <span className="rounded-full bg-cream px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-body">
                            {TYPE_LABELS[e.type] ?? e.type}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[12.5px] text-body">{e.mobile || e.email || "—"}</p>
                      </div>
                      <div className="flex flex-none items-center gap-3">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                          {meta.label}
                        </span>
                        <span className="whitespace-nowrap text-[11.5px] text-body">{fmt(e.created_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-body">Quick Actions</h2>
            <div className="flex flex-col gap-1">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:bg-cream"
                >
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-cream text-ink">
                    <a.icon className="h-4 w-4" />
                  </span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

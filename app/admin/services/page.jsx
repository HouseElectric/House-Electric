"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { BoltBadge, CheckCircle, EditIcon, ExternalLinkIcon, PlusIcon, TrashIcon, WrenchIcon } from "@/components/icons";
import { ICON_MAP } from "@/components/admin/ServiceEditor";

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // The AMC row's real hero image lives in site_settings (edited from AMC Management →
  // Public Page Content), not in services.image_url — fetch it so this list's thumbnail
  // for that row matches what's actually live instead of the row's stale placeholder image.
  const [amcHeroImage, setAmcHeroImage] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    const [{ data }, { data: amcSettings }] = await Promise.all([
      supabase.from("services").select("*").order("display_order", { ascending: true }),
      supabase.from("site_settings").select("data").eq("key", "amc_plans_page").maybeSingle(),
    ]);
    setItems(data ?? []);
    setAmcHeroImage(amcSettings?.data?.image_url || "");
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this service? It will disappear from the website (and its page, if auto-generated).")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Service deleted");
    fetchItems();
  };

  const toggleActive = async (item) => {
    await supabase.from("services").update({ active: !item.active }).eq("id", item.id);
    toast.success(item.active ? "Service hidden" : "Service activated");
    fetchItems();
  };

  return (
    <AdminGuard>
      <AdminLayout title="Services & Pricing">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[65ch] text-[13.5px] leading-relaxed text-body">
            Add, edit or remove services shown on the homepage and the{" "}
            <a href="/services" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">
              Services page
            </a>
            . Leave <b className="text-ink">Custom Link</b> blank and a dedicated page is created automatically.
          </p>
          <Link
            href="/admin/services/new"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-6 py-3 text-[14px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            Add Service
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Total Services", value: items.length, icon: WrenchIcon, cls: "bg-ink text-yellow" },
            { label: "Live", value: items.filter((i) => i.active).length, icon: CheckCircle, cls: "bg-emerald-50 text-emerald-600" },
            { label: "Hidden", value: items.filter((i) => !i.active).length, icon: EditIcon, cls: "bg-gray-100 text-gray-500" },
          ].map((c, i) => (
            <div key={c.label} style={{ animationDelay: `${i * 0.06}s` }} className="card-hover rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up">
              <div className={`mb-2.5 grid h-9 w-9 place-items-center rounded-lg ${c.cls}`}>
                <c.icon className="h-4 w-4" />
              </div>
              <div className="text-[11.5px] font-semibold text-body">{c.label}</div>
              <div className="mt-0.5 text-[16px] font-extrabold tabular-nums text-ink sm:text-[22px]">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
              <WrenchIcon className="h-3.5 w-3.5 text-yellow-dark" />
              {items.length} Service{items.length === 1 ? "" : "s"}
            </span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-[13.5px] text-body">
              No services yet —{" "}
              <Link href="/admin/services/new" className="font-semibold text-ink underline">
                add your first one
              </Link>
              .
            </div>
          ) : (
            <div className="divide-y divide-line">
              {items.map((item) => {
                const link = item.href || `/services/${item.slug}`;
                const isAutoPage = !item.href || item.href === `/services/${item.slug}`;
                const Icon = ICON_MAP[item.icon_key] || BoltBadge;
                const checklistCount = item.checklist_items?.length || 0;
                // The AMC row has its own dedicated, richer editor (hero content lives in
                // site_settings, not here) — send admins there instead of opening a second,
                // partially-overlapping editor for the same row.
                const isAmc = item.slug === "annual-maintenance-contract-amc";
                const thumbnail = isAmc ? amcHeroImage || item.image_url : item.image_url;
                return (
                  <div key={item.id} className="group flex flex-col gap-4 p-5 transition-colors hover:bg-cream/30 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-28 flex-none">
                      <div className="h-full w-full overflow-hidden rounded-lg border border-line bg-cream/30">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-body/40">
                            <Icon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-yellow text-ink shadow-sm transition-transform duration-200 group-hover:scale-110">
                        <Icon className="h-3 w-3" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <b className="text-[15px] text-ink">{item.title}</b>
                        {item.price_label && (
                          <span className="whitespace-nowrap rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-ink">
                            {item.price_label}
                          </span>
                        )}
                        {checklistCount > 0 && (
                          <span className="whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                            {checklistCount} checklist item{checklistCount === 1 ? "" : "s"}
                          </span>
                        )}
                        {isAmc && (
                          <span className="whitespace-nowrap rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                            Managed in AMC Management
                          </span>
                        )}
                        <button
                          onClick={() => toggleActive(item)}
                          className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
                            item.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-cream text-body hover:bg-line"
                          }`}
                        >
                          {item.active ? "Live" : "Hidden"}
                        </button>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[12.5px] text-body">{item.description}</p>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
                      >
                        {isAutoPage ? "Auto-generated page" : "Custom page"}: {link}
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="flex flex-none items-center gap-4">
                      <Link
                        href={isAmc ? "/admin/amc?tab=page" : `/admin/services/${item.id}`}
                        className="flex items-center gap-1 text-[13px] font-semibold text-ink hover:underline"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        {isAmc ? "Edit in AMC Management" : "Edit"}
                      </Link>
                      <button onClick={() => remove(item.id)} className="flex items-center gap-1 text-[13px] font-semibold text-red-400 hover:text-red-600">
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

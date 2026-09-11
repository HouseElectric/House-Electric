"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { MapIcon, PlusIcon, PinIcon } from "@/components/icons";

export default function AdminServiceAreasPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchAreas = async () => {
    setLoading(true);
    const { data } = await supabase.from("service_areas").select("*").order("display_order", { ascending: true });
    setAreas(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const addArea = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const nextOrder = areas.length > 0 ? Math.max(...areas.map((a) => a.display_order)) + 1 : 1;
    const { error } = await supabase.from("service_areas").insert([{ name: newName.trim(), display_order: nextOrder }]);
    setAdding(false);
    if (error) toast.error(error.message);
    else {
      setNewName("");
      toast.success("Service area added");
      fetchAreas();
    }
  };

  const remove = async (id) => {
    setDeleting(id);
    await supabase.from("service_areas").delete().eq("id", id);
    setAreas((prev) => prev.filter((a) => a.id !== id));
    toast.success("Service area removed");
    setDeleting(null);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Service Areas">
        <p className="mb-6 max-w-[65ch] text-[13.5px] text-body">
          These localities appear on the public{" "}
          <a href="/service-areas" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">
            Service Areas
          </a>{" "}
          page. Add a new area whenever you expand coverage.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card-hover rounded-2xl border border-line bg-white p-4 opacity-0 animate-fade-up">
            <div className="mb-2.5 grid h-9 w-9 place-items-center rounded-lg bg-ink text-yellow">
              <MapIcon className="h-4 w-4" />
            </div>
            <div className="text-[11.5px] font-semibold text-body">Total Areas</div>
            <div className="mt-0.5 text-[22px] font-extrabold tabular-nums text-ink">{areas.length}</div>
          </div>
        </div>

        <form
          onSubmit={addArea}
          className="card-hover group relative mb-6 overflow-hidden rounded-2xl border border-line bg-white p-5"
        >
          <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-yellow/0 via-yellow to-yellow/0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label className="mb-1 block text-[12px] font-semibold text-body">New Area Name</label>
              <div className="relative">
                <PinIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body/40" />
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ranital"
                  className="w-full rounded-md border border-line py-2.5 pl-10 pr-3.5 text-[14px] outline-none transition-all focus:border-ink focus:ring-2 focus:ring-yellow/20"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-5 py-2.5 text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-yellow-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-60"
            >
              <PlusIcon className="h-4 w-4" />
              {adding ? "Adding…" : "Add Area"}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_0_rgba(20,20,20,0.02)]">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-body">
              <MapIcon className="h-3.5 w-3.5 text-yellow-dark" />
              {areas.length} Area{areas.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="p-8 text-center text-[13.5px] text-body">Loading...</div>
            ) : areas.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center text-[13.5px] text-body">
                <MapIcon className="h-6 w-6 text-body/40" />
                No areas yet — add one above.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {areas.map((a, i) => (
                  <span
                    key={a.id}
                    style={{ animationDelay: `${Math.min(i, 12) * 0.03}s` }}
                    className="group flex items-center gap-2 rounded-full border border-line bg-gradient-to-b from-white to-cream/50 py-1.5 pl-3.5 pr-2 text-[13.5px] font-semibold text-ink opacity-0 shadow-sm animate-fade-up transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow/50 hover:shadow-md"
                  >
                    <PinIcon className="h-3.5 w-3.5 text-yellow-dark" />
                    {a.name}
                    <button
                      onClick={() => remove(a.id)}
                      disabled={deleting === a.id}
                      aria-label={`Remove ${a.name}`}
                      className="grid h-5 w-5 place-items-center rounded-full text-body transition-colors hover:bg-red-100 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { MapIcon, PlusIcon } from "@/components/icons";

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
    if (error) alert(error.message);
    else {
      setNewName("");
      fetchAreas();
    }
  };

  const remove = async (id) => {
    setDeleting(id);
    await supabase.from("service_areas").delete().eq("id", id);
    setAreas((prev) => prev.filter((a) => a.id !== id));
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

        <form onSubmit={addArea} className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-5">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-[12px] font-semibold text-body">New Area Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Ranital"
              className="w-full rounded-md border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-ink"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-yellow px-5 py-2.5 text-[13.5px] font-bold text-ink hover:bg-yellow-dark disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
            {adding ? "Adding…" : "Add Area"}
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
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
                {areas.map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-2 rounded-full border border-line bg-cream/40 py-1.5 pl-3.5 pr-2 text-[13.5px] font-semibold text-ink"
                  >
                    {a.name}
                    <button
                      onClick={() => remove(a.id)}
                      disabled={deleting === a.id}
                      aria-label={`Remove ${a.name}`}
                      className="grid h-5 w-5 place-items-center rounded-full text-body hover:bg-red-100 hover:text-red-500"
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

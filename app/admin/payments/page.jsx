"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { AmcBadge, DownloadIcon, ReportIcon, SearchIcon, SparklesIcon, WalletIcon, XIcon } from "@/components/icons";

function CountUp({ value, format = (v) => v }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let frame;
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return typeof value === "number" ? format(display) : value;
}
import { avatarGradient } from "@/components/admin/CustomerPicker";

const STATUS_META = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  partially_paid: { label: "Partially Paid", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  failed: { label: "Failed", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  refunded: { label: "Refunded", cls: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | invoice | amc
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  useEffect(() => {
    (async () => {
      const [{ data: invoices }, { data: subs }] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, customer_name, total_amount, paid_amount, payment_status, payment_reference, cashfree_payment_id, updated_at, created_at")
          .gt("paid_amount", 0),
        supabase
          .from("amc_subscriptions")
          .select("id, amc_number, plan_name_snapshot, amount_paid, cashfree_payment_id, created_at, profiles(name, email)")
          .not("amount_paid", "is", null),
      ]);

      const invoiceRows = (invoices ?? []).map((inv) => ({
        id: `inv-${inv.id}`,
        rawId: inv.id,
        type: "invoice",
        reference: inv.invoice_number,
        customer: inv.customer_name,
        amount: inv.paid_amount,
        status: inv.payment_status,
        paymentRef: inv.cashfree_payment_id || inv.payment_reference,
        date: inv.updated_at || inv.created_at,
      }));

      const amcRows = (subs ?? []).map((s) => ({
        id: `amc-${s.id}`,
        type: "amc",
        reference: s.amc_number,
        customer: s.profiles?.name || s.profiles?.email,
        amount: s.amount_paid,
        status: "paid",
        paymentRef: s.cashfree_payment_id,
        date: s.created_at,
      }));

      const merged = [...invoiceRows, ...amcRows].sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(merged);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    let rows = transactions.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (q) {
        const haystack = `${t.customer || ""} ${t.reference || ""} ${t.paymentRef || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      const d = new Date(t.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const mult = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "amount") return (Number(a.amount) - Number(b.amount)) * mult;
      return (new Date(a.date) - new Date(b.date)) * mult;
    });

    return rows;
  }, [transactions, filter, search, dateFrom, dateTo, sort]);

  const totalCollected = filtered.filter((t) => t.status === "paid").reduce((s, t) => s + Number(t.amount), 0);
  const hasActiveFilters = filter !== "all" || search.trim() || dateFrom || dateTo;

  const clearFilters = () => {
    setFilter("all");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  const goToRecord = (t) => {
    if (t.type === "invoice") router.push(`/admin/invoices/${t.rawId}`);
    else router.push("/admin/amc?tab=subscriptions");
  };

  const exportCsv = () => {
    const header = ["Type", "Reference", "Customer", "Amount", "Status", "Payment Ref", "Date"];
    const rows = filtered.map((t) => [
      t.type === "invoice" ? "Invoice" : "AMC",
      t.reference || "",
      t.customer || "",
      t.amount,
      STATUS_META[t.status]?.label ?? t.status,
      t.paymentRef || "",
      new Date(t.date).toLocaleDateString("en-GB"),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Payments">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-8 sm:py-8">
          <span className="glow-blob -right-14 -top-20 h-56 w-56 bg-yellow/25" />
          <span className="glow-blob -bottom-24 -left-10 h-48 w-48 bg-yellow/10" style={{ animationDelay: "2.2s" }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-yellow">
              <SparklesIcon className="h-3 w-3" /> Billing
            </span>
            <h2 className="mt-3 text-[21px] font-extrabold text-white sm:text-[25px]">Payments</h2>
            <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-white/55">
              A combined view of every payment received — from invoices and AMC purchases/renewals — in one place.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            style={{ animationDelay: "0s" }}
            className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-5 opacity-0 animate-fade-up"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-emerald-400 to-teal-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-body">Total Collected</p>
                <b className="mt-1 block text-[19px] font-black leading-none tabular-nums text-ink sm:text-[28px]">
                  <CountUp value={totalCollected} format={(v) => `₹${v.toLocaleString("en-IN")}`} />
                </b>
              </div>
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <WalletIcon className="h-5 w-5" />
              </span>
            </div>
          </div>
          <div
            style={{ animationDelay: "0.06s" }}
            className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-5 opacity-0 animate-fade-up"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-blue-400 to-indigo-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-400 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-body">Invoice Payments</p>
                <b className="mt-1 block text-[19px] font-black leading-none tabular-nums text-ink sm:text-[28px]">
                  <CountUp value={transactions.filter((t) => t.type === "invoice").length} />
                </b>
              </div>
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ReportIcon className="h-5 w-5" />
              </span>
            </div>
          </div>
          <div
            style={{ animationDelay: "0.12s" }}
            className="card-hover group relative isolate overflow-hidden rounded-2xl border border-line bg-white p-5 opacity-0 animate-fade-up"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-yellow to-amber-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-body">AMC Payments</p>
                <b className="mt-1 block text-[19px] font-black leading-none tabular-nums text-ink sm:text-[28px]">
                  <CountUp value={transactions.filter((t) => t.type === "amc").length} />
                </b>
              </div>
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-yellow/15 text-yellow-dark shadow-sm ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <AmcBadge className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex w-fit gap-1 rounded-xl border border-line bg-white p-1">
            {[
              { key: "all", label: "All" },
              { key: "invoice", label: "Invoices" },
              { key: "amc", label: "AMC" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-4 py-2 text-[13px] font-bold transition-colors ${
                  filter === f.key ? "bg-ink text-white shadow-sm" : "text-body hover:bg-cream"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-body/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, reference, payment ref…"
              className="w-64 rounded-xl border border-line bg-white py-2 pl-8 pr-3 text-[13px] outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-ink/5"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-2 py-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg px-1.5 py-1 text-[12.5px] text-ink outline-none"
            />
            <span className="text-[12px] text-body/50">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg px-1.5 py-1 text-[12.5px] text-ink outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[12.5px] font-bold text-body transition-colors hover:text-ink"
            >
              <XIcon className="h-3 w-3" />
              Clear filters
            </button>
          )}

          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-sm disabled:pointer-events-none disabled:opacity-40"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line bg-cream/40 px-5 py-3">
            <span className="text-[12px] font-bold uppercase tracking-wide text-body">
              {filtered.length} Payment{filtered.length === 1 ? "" : "s"}
              {hasActiveFilters && transactions.length !== filtered.length ? ` of ${transactions.length}` : ""}
            </span>
            {filtered.length > 0 && (
              <span className="text-[12px] font-bold text-ink">
                Total: ₹{filtered.reduce((s, t) => s + Number(t.amount), 0).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {loading ? (
            <div className="p-12 text-center text-[13.5px] text-body">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-[13.5px] text-body">
              <ReportIcon className="h-6 w-6 text-body/40" />
              {hasActiveFilters ? "No payments match these filters." : "No payments recorded yet."}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[12.5px] font-bold text-ink underline underline-offset-2">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-cream/40">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">Type</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">Reference</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">Customer</th>
                    <th
                      onClick={() => toggleSort("amount")}
                      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body hover:text-ink"
                    >
                      Amount {sort.key === "amount" ? (sort.dir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body">Payment Ref</th>
                    <th
                      onClick={() => toggleSort("date")}
                      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-[12px] font-bold text-body hover:text-ink"
                    >
                      Date {sort.key === "date" ? (sort.dir === "asc" ? "↑" : "↓") : ""}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const meta = STATUS_META[t.status] ?? STATUS_META.pending;
                    const name = t.customer || "—";
                    return (
                      <tr
                        key={t.id}
                        onClick={() => goToRecord(t)}
                        className="cursor-pointer border-t border-line transition-colors hover:bg-cream/30"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.type === "invoice" ? "bg-blue-50 text-blue-700" : "bg-yellow/15 text-yellow-dark"}`}>
                            {t.type === "invoice" ? "Invoice" : "AMC"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-ink">{t.reference}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white shadow-sm ${avatarGradient(name)}`}>
                              {name.charAt(0).toUpperCase()}
                            </span>
                            {name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-ink">₹{Number(t.amount).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {t.paymentRef ? (
                            <span className="rounded-md bg-cream px-2 py-1 font-mono text-[11.5px] text-body">{t.paymentRef}</span>
                          ) : (
                            <span className="text-body/50">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[12px] text-body">
                          {new Date(t.date).toLocaleDateString("en-GB")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

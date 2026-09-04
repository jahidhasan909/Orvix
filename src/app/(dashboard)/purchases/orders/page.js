"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/Components/Procurement/forms";

export default function Page() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    fetch(`/api/ngo/procurement/orders${params.toString() ? `?${params}` : ""}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load purchase orders.");
        setItems(data.items ?? []);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Purchase Orders</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Orders with persisted line items. Receive against them on Receiving.</p>
        </div>
        <Link href="/purchases/orders/new" className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]">
          New purchase order
        </Link>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={(event) => { event.preventDefault(); load(); }} className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search supplier or notes…"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20"
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="partial">Partially received</option>
          <option value="received">Fully received</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Filter</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Purchase orders</p>
          <p className="text-xs text-slate-400">{loading ? "Loading…" : `${items.length} total`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Received</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">
                    No purchase orders yet. Create one against a supplier and inventory items.
                  </td>
                </tr>
              ) : items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-4 text-slate-600">{row.date ? new Date(row.date).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4">
                    <Link href={`/purchases/orders/${row.id}`} className="font-medium text-slate-900 hover:text-[#2075fe]">{row.supplierName}</Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{row.lines?.length ?? 0}</td>
                  <td className="px-5 py-4 font-medium">{Number(row.total).toFixed(2)}</td>
                  <td className="px-5 py-4 text-slate-600">{row.receivedQty}/{row.orderedQty}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

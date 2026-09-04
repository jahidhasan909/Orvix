"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    api(`/ngo/inventory/transactions?${params}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load transactions.");
        setItems(data.items ?? []);
      })
      .catch((loadError) => setError(loadError.message));
  }, [q, type]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Stock Transactions</h2>
        <p className="mt-1 text-sm text-slate-500">History is read-only so stock calculations stay intact.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search item, SKU, reference" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All types</option>
          {["opening", "received", "issue", "distribution", "adjustment", "return", "transfer"].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Qty</th>
              <th className="px-4 py-3 font-semibold">Before</th>
              <th className="px-4 py-3 font-semibold">After</th>
              <th className="px-4 py-3 font-semibold">Ref</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-600">{new Date(row.date).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{row.itemName}<span className="block text-xs text-slate-400">{row.sku}</span></td>
                <td className="px-4 py-3 text-slate-600">{row.typeLabel}</td>
                <td className="px-4 py-3 text-slate-600">{row.quantity}</td>
                <td className="px-4 py-3 text-slate-600">{row.quantityBefore}</td>
                <td className="px-4 py-3 text-slate-600">{row.quantityAfter}</td>
                <td className="px-4 py-3 text-slate-500">{row.reference || row.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

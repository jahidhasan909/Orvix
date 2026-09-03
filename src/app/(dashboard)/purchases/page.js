"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ngo/inventory/receive")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load purchases.");
        setItems(data.items ?? []);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const spend = items.reduce((sum, row) => sum + (row.totalCost || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Purchases</h2>
        <p className="mt-1 text-sm text-slate-500">Posted receipts for this NGO. Total recorded cost: {spend.toFixed(2)}</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">Supplier</th>
              <th className="px-5 py-3 font-semibold">Cost</th>
              <th className="px-5 py-3 font-semibold">Ref</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No purchases yet.</td></tr>
            ) : items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-medium">{row.itemName}</td>
                <td className="px-5 py-3">{row.quantity}</td>
                <td className="px-5 py-3">{row.supplierName || "—"}</td>
                <td className="px-5 py-3">{row.totalCost ?? "—"}</td>
                <td className="px-5 py-3 text-slate-500">{row.reference || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

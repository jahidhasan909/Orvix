"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/distribution/me")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load issued resources.");
        setItems(data.items ?? []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Issued Resources</h2>
        <p className="mt-1 text-sm text-slate-500">Items issued to you. Stock was deducted only at issue time.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">Reason</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400"><span className="inline-flex items-center justify-center gap-2"><span className="orvix-spinner" />Loading…</span></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400">Nothing has been issued to you yet.</td></tr>
            ) : items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">{row.date ? new Date(row.date).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 font-medium">{row.itemName}</td>
                <td className="px-5 py-3">{row.quantity}</td>
                <td className="px-5 py-3 text-slate-600">{row.reason || "—"}</td>
                <td className="px-5 py-3">{row.status || "issued"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

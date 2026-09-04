"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      api("/ngo/inventory/items").then(async (response) => (await response.json()).items ?? []),
      api("/ngo/assignments").then(async (response) => (await response.json()).sites ?? []),
      api("/ngo/inventory/transfers").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load transfers.");
        return data.items ?? [];
      }),
    ])
      .then(([catalog, siteRows, rows]) => { setItems(catalog); setSites(siteRows); setList(rows); })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await api("/ngo/inventory/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: form.get("itemId"),
        quantity: form.get("quantity"),
        fromSiteId: form.get("fromSiteId"),
        toSiteId: form.get("toSiteId"),
        notes: form.get("notes"),
        date: form.get("date"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not record transfer.");
      return;
    }
    event.currentTarget.reset();
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Stock Transfers</h2>
        <p className="mt-1 text-sm text-slate-500">Moves stock between this NGO’s sites. Total quantity stays the same.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Item</span>
          <select name="itemId" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select item</option>
            {items.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.quantity})</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Quantity</span>
          <input name="quantity" type="number" min="1" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">From site</span>
          <select name="fromSiteId" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select site</option>
            {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">To site</span>
          <select name="toSiteId" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select site</option>
            {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Notes</span>
          <input name="notes" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Record transfer"}</button>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">From</th>
              <th className="px-5 py-3 font-semibold">To</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-medium">{row.itemName}</td>
                <td className="px-5 py-3">{row.quantity}</td>
                <td className="px-5 py-3">{row.from}</td>
                <td className="px-5 py-3">{row.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

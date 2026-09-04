"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [stock, setStock] = useState([]);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      api("/ngo/inventory/items").then(async (response) => (await response.json()).items ?? []),
      api("/ngo/inventory/adjustments").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load adjustments.");
        return data.items ?? [];
      }),
    ])
      .then(([catalog, rows]) => { setItems(catalog); setList(rows); })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await api("/ngo/inventory/adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: form.get("itemId"),
        direction: form.get("direction"),
        quantity: form.get("quantity"),
        reason: form.get("reason"),
        date: form.get("date"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save adjustment.");
      return;
    }
    event.currentTarget.reset();
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Stock Adjustments</h2>
        <p className="mt-1 text-sm text-slate-500">Corrections update current stock and write a history row. Stock cannot go negative.</p>
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
          <span className="text-sm font-medium">Direction</span>
          <select name="direction" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Quantity</span>
          <input name="quantity" type="number" min="1" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Date</span>
          <input name="date" type="date" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Reason</span>
          <input name="reason" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Save adjustment"}</button>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">After</th>
              <th className="px-5 py-3 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-medium">{row.itemName}</td>
                <td className="px-5 py-3">{row.quantity}</td>
                <td className="px-5 py-3">{row.quantityAfter}</td>
                <td className="px-5 py-3 text-slate-500">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

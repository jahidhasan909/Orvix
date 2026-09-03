"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StockBadge } from "@/Components/Inventory/InventoryForms";

export default function Page() {
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/ngo/inventory/overview").then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Could not load overview.");
        return json;
      }),
      fetch("/api/ngo/inventory/items").then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Could not load items.");
        return json.items ?? [];
      }),
    ])
      .then(([overview, list]) => {
        setData(overview);
        setItems(list);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const totals = data?.totals ?? { items: 0, available: 0, low: 0, out: 0 };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Live stock for this NGO only.</p>
        </div>
        <Link href="/inventory/items" className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">
          Manage items
        </Link>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Items", value: totals.items },
          { label: "Available stock", value: totals.available },
          { label: "Low stock", value: totals.low },
          { label: "Out of stock", value: totals.out },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3"><p className="text-sm font-medium text-slate-700">Current stock</p></div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">SKU</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No items yet.</td></tr>
            ) : items.slice(0, 12).map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-5 py-3 text-slate-600">{item.sku}</td>
                <td className="px-5 py-3 text-slate-600">{item.quantity} {item.unit}</td>
                <td className="px-5 py-3"><StockBadge status={item.stockStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <Recent title="Recent transactions" rows={(data?.recentTransactions ?? []).map((row) => `${row.typeLabel}: ${row.itemName} (${row.quantity})`)} />
        <Recent title="Recent receipts" rows={(data?.recentReceipts ?? []).map((row) => `${row.itemName} +${row.quantity}`)} />
        <Recent title="Recent issues" rows={(data?.recentIssues ?? []).map((row) => `${row.itemName} −${row.quantity}`)} />
      </div>
    </div>
  );
}

function Recent({ title, rows }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {rows.length ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {rows.map((row, index) => <li key={`${row}-${index}`}>{row}</li>)}
        </ul>
      ) : <p className="mt-3 text-sm text-slate-400">None yet.</p>}
    </section>
  );
}

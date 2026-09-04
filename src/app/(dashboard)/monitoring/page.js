"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ngo/monitoring")
      .then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Could not load monitoring.");
        setData(json);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Pending leave", value: data?.pendingLeave ?? 0, href: "/leave" },
    { label: "Pending requests", value: data?.pendingRequests ?? 0, href: "/resource-requests" },
    { label: "Open purchase orders", value: data?.openOrders ?? 0, href: "/purchases/orders" },
    { label: "Low stock items", value: data?.lowStockCount ?? 0, href: "/inventory" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Monitoring</h2>
        <p className="mt-1 text-sm text-slate-500">Live operational follow-up for this NGO only.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {loading ? <p className="flex items-center gap-2 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-[#2075fe]/30">
            <p className="text-xs uppercase text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Low stock</p>
          {(data?.lowStock ?? []).length === 0 ? <p className="mt-3 text-sm text-slate-400">No low-stock items.</p> : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {data.lowStock.map((row) => (
                <li key={row.name} className="flex justify-between py-2"><span>{row.name}</span><span>{row.quantity}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Pending leave</p>
          {(data?.leave ?? []).length === 0 ? <p className="mt-3 text-sm text-slate-400">No pending leave.</p> : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {data.leave.map((row) => (
                <li key={row.id} className="flex justify-between py-2"><span>{row.worker}</span><span>{row.days}d {row.type}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Recent requests</p>
          {(data?.requests ?? []).length === 0 ? <p className="mt-3 text-sm text-slate-400">No requests.</p> : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {data.requests.map((row) => (
                <li key={row.id} className="flex justify-between py-2"><span>{row.item} × {row.quantity}</span><span>{row.status}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Recent stock movement</p>
          {(data?.transactions ?? []).length === 0 ? <p className="mt-3 text-sm text-slate-400">No transactions.</p> : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {data.transactions.map((row) => (
                <li key={row.id} className="flex justify-between py-2">
                  <span>{row.itemName} · {row.type}</span>
                  <span>{row.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

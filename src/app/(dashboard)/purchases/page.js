"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/Components/Procurement/forms";

export default function Page() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (supplierId) params.set("supplierId", supplierId);
    if (orderId) params.set("orderId", orderId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/ngo/procurement/purchases${params.toString() ? `?${params}` : ""}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load purchases.");
        setItems(data.items ?? []);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/ngo/inventory/suppliers").then(async (response) => (await response.json()).items ?? []),
      fetch("/api/ngo/procurement/orders").then(async (response) => (await response.json()).items ?? []),
    ])
      .then(([vendorRows, orderRows]) => {
        setSuppliers(vendorRows);
        setOrders(orderRows);
      })
      .catch(() => {});
    load();
  }, []);

  const spend = items.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Purchases</h2>
        <p className="mt-1 text-sm text-slate-500">Posted purchases created when goods are received against a purchase order. Total: {spend.toFixed(2)}</p>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={(event) => { event.preventDefault(); load(); }} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search supplier…" className="rounded-lg border border-slate-200 px-3 py-2 text-sm lg:col-span-2" />
        <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All suppliers</option>
          {suppliers.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
        <select value={orderId} onChange={(event) => setOrderId(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All purchase orders</option>
          {orders.map((row) => <option key={row.id} value={row.id}>{row.supplierName} · {row.date ? new Date(row.date).toLocaleDateString() : row.id.slice(-6)}</option>)}
        </select>
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-6 w-fit">Apply filters</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Purchase order</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">
                    No purchases yet. Confirm receiving against a purchase order.
                  </td>
                </tr>
              ) : items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-4 text-slate-600">{row.date ? new Date(row.date).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4">
                    <Link href={`/purchases/${row.id}`} className="font-medium text-slate-900 hover:text-[#2075fe]">{row.supplierName || "Purchase"}</Link>
                  </td>
                  <td className="px-5 py-4">
                    {row.orderId ? <Link href={`/purchases/orders/${row.orderId}`} className="text-[#2075fe]">{row.orderStatusLabel || "View PO"}</Link> : "—"}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={row.status} labels={{ posted: "Posted" }} /></td>
                  <td className="px-5 py-4 font-medium">{Number(row.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/Components/Procurement/forms";

export default function Page() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/ngo/procurement/purchases/${id}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load purchase.");
        setItem(data.item);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="flex items-center gap-2 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading purchase…</p>;
  if (!item) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link href="/purchases" className="text-sm font-medium text-[#2075fe]">← Purchases</Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Purchase not found."}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/purchases" className="text-sm font-medium text-[#2075fe]">← Purchases</Link>
        <div className="mt-2 flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{item.supplierName || "Purchase"}</h2>
          <StatusBadge status={item.status} labels={{ posted: "Posted" }} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {item.date ? new Date(item.date).toLocaleDateString() : ""} · Total {Number(item.amount).toFixed(2)}
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Supplier</dt>
            <dd className="mt-1 font-medium">
              {item.supplierId ? <Link href={`/suppliers/${item.supplierId}`} className="text-[#2075fe]">{item.supplierName}</Link> : item.supplierName || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Purchase order</dt>
            <dd className="mt-1 font-medium">
              {item.orderId ? <Link href={`/purchases/orders/${item.orderId}`} className="text-[#2075fe]">{item.orderStatusLabel || "View order"}</Link> : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Items received</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Item</th>
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2 font-semibold">Unit price</th>
                <th className="px-3 py-2 font-semibold">Line total</th>
              </tr>
            </thead>
            <tbody>
              {(item.items ?? []).length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-400">No line items on this purchase.</td></tr>
              ) : item.items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-medium">{row.itemName}</td>
                  <td className="px-3 py-3">{row.quantity}</td>
                  <td className="px-3 py-3">{row.unitCost != null ? Number(row.unitCost).toFixed(2) : "—"}</td>
                  <td className="px-3 py-3 font-medium">{row.totalCost != null ? Number(row.totalCost).toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-right text-sm text-slate-500">Total <span className="ml-2 font-semibold text-slate-900">{Number(item.amount).toFixed(2)}</span></p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Receiving history</p>
        {(item.receiving ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No receiving records linked to this purchase.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {item.receiving.map((row) => (
              <li key={row.id} className="flex justify-between py-2">
                <span>{new Date(row.date).toLocaleString()} · {row.itemName} × {row.quantity}</span>
                <span className="text-slate-500">{row.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

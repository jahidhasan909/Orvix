"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { StockBadge } from "@/Components/Inventory/InventoryForms";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/ngo/inventory/reports")
      .then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Could not load report.");
        setData(json);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory Report</h2>
        <p className="mt-1 text-sm text-slate-500">On-hand stock versus receipts and issues for this NGO.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Received</p>
          <p className="mt-2 text-2xl font-semibold">{data?.receivedQty ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Issued</p>
          <p className="mt-2 text-2xl font-semibold">{data?.issuedQty ?? 0}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">SKU</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">Min</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{item.name}</td>
                <td className="px-5 py-3">{item.sku}</td>
                <td className="px-5 py-3">{item.quantity} {item.unit}</td>
                <td className="px-5 py-3">{item.minLevel}</td>
                <td className="px-5 py-3">
                  <StockBadge status={item.quantity <= 0 ? "out" : item.minLevel > 0 && item.quantity <= item.minLevel ? "low" : "ok"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StatusBadge, inputClass, labelClass } from "@/Components/Procurement/forms";

function ReceivingPage() {
  const searchParams = useSearchParams();
  const presetOrderId = searchParams.get("orderId") || "";
  const [orders, setOrders] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [orderId, setOrderId] = useState(presetOrderId);
  const [qtys, setQtys] = useState({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(() => orders.find((row) => row.id === orderId) || null, [orders, orderId]);

  const load = (keepOrderId = orderId) => {
    setLoading(true);
    fetch("/api/ngo/procurement/receiving")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load receiving.");
        setOrders(data.orders ?? []);
        setReceipts(data.receipts ?? []);
        const nextId = keepOrderId && (data.orders ?? []).some((row) => row.id === keepOrderId)
          ? keepOrderId
          : (data.orders?.[0]?.id || "");
        setOrderId(nextId);
        const next = (data.orders ?? []).find((row) => row.id === nextId);
        const nextQtys = {};
        (next?.lines ?? []).forEach((line) => { nextQtys[line.id] = ""; });
        setQtys(nextQtys);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(presetOrderId); }, []);

  const onSelectOrder = (id) => {
    setOrderId(id);
    const next = orders.find((row) => row.id === id);
    const nextQtys = {};
    (next?.lines ?? []).forEach((line) => { nextQtys[line.id] = ""; });
    setQtys(nextQtys);
    setSuccess("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    setSuccess("");
    const lines = (selected.lines ?? [])
      .map((line) => ({ lineId: line.id, quantity: Number(qtys[line.id] || 0) }))
      .filter((line) => line.quantity > 0);
    const response = await fetch("/api/ngo/procurement/receiving", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selected.id, lines, notes }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not confirm receiving.");
      return;
    }
    setSuccess(`Received successfully. Purchase ${data.purchase?.id ? "posted" : "saved"}. PO is now ${data.order?.statusLabel || data.order?.status}.`);
    setNotes("");
    load(data.order?.remainingQty > 0 ? selected.id : "");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Receiving</h2>
        <p className="mt-1 text-sm text-slate-500">Receive against an open purchase order. Stock increases and a purchase is posted for each confirmation.</p>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      {loading ? <p className="text-sm text-slate-400">Loading eligible purchase orders…</p> : null}

      {!loading && orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          No open purchase orders to receive. <Link href="/purchases/orders/new" className="font-semibold text-[#2075fe]">Create a purchase order</Link>.
        </div>
      ) : null}

      {selected ? (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label>
            <span className={labelClass}>Purchase order</span>
            <select value={orderId} onChange={(event) => onSelectOrder(event.target.value)} className={inputClass}>
              {orders.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.supplierName} · remaining {row.remainingQty} · {row.statusLabel}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <StatusBadge status={selected.status} />
            <Link href={`/purchases/orders/${selected.id}`} className="text-[#2075fe]">View order</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Item</th>
                  <th className="px-3 py-2 font-semibold">Ordered</th>
                  <th className="px-3 py-2 font-semibold">Received</th>
                  <th className="px-3 py-2 font-semibold">Remaining</th>
                  <th className="px-3 py-2 font-semibold">Receive now</th>
                </tr>
              </thead>
              <tbody>
                {selected.lines.map((line) => (
                  <tr key={line.id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-medium">{line.itemName}</td>
                    <td className="px-3 py-3">{line.quantity}</td>
                    <td className="px-3 py-3">{line.receivedQty}</td>
                    <td className="px-3 py-3">{line.remaining}</td>
                    <td className="px-3 py-3 w-36">
                      <input
                        type="number"
                        min="0"
                        max={line.remaining}
                        value={qtys[line.id] ?? ""}
                        onChange={(event) => setQtys((current) => ({ ...current, [line.id]: event.target.value }))}
                        className={inputClass}
                        disabled={line.remaining <= 0}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label>
            <span className={labelClass}>Notes</span>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} className={inputClass} />
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? "Confirming…" : "Confirm receiving"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Recent receiving</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Item</th>
                <th className="px-5 py-3 font-semibold">Qty</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Purchase</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No PO receiving yet.</td></tr>
              ) : receipts.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-600">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 font-medium">{row.itemName}</td>
                  <td className="px-5 py-3">{row.quantity}</td>
                  <td className="px-5 py-3">{row.supplierName || "—"}</td>
                  <td className="px-5 py-3">
                    {row.purchaseId ? <Link href={`/purchases/${row.purchaseId}`} className="text-[#2075fe]">View</Link> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="px-1 py-8 text-sm text-slate-400">Loading receiving…</p>}>
      <ReceivingPage />
    </Suspense>
  );
}

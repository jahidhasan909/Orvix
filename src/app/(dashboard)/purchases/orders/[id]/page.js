"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PurchaseOrderForm, StatusBadge } from "@/Components/Procurement/forms";

export default function Page() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      fetch(`/api/ngo/procurement/orders/${id}`).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load purchase order.");
        return data.item;
      }),
      fetch("/api/ngo/inventory/suppliers").then(async (response) => (await response.json()).items ?? []),
      fetch("/api/ngo/inventory/items").then(async (response) => (await response.json()).items ?? []),
    ])
      .then(([item, vendorRows, catalog]) => {
        setOrder(item);
        setSuppliers(vendorRows);
        setItems(catalog);
        setLines((item.lines ?? []).map((line) => ({
          key: line.id,
          id: line.id,
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })));
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const onSubmit = async (body) => {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/ngo/procurement/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not update the purchase order.");
      return;
    }
    setOrder(data.item);
    setEditing(false);
    load();
  };

  const cancelOrder = async () => {
    if (!window.confirm("Cancel this purchase order? Receiving will no longer be allowed.")) return;
    setSaving(true);
    const response = await fetch(`/api/ngo/procurement/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not cancel the purchase order.");
      return;
    }
    setOrder(data.item);
  };

  if (loading) return <p className="px-1 py-8 text-sm text-slate-400">Loading purchase order…</p>;
  if (!order) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href="/purchases/orders" className="text-sm font-medium text-[#2075fe]">← Purchase orders</Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Purchase order not found."}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/purchases/orders" className="text-sm font-medium text-[#2075fe]">← Purchase orders</Link>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{order.supplierName}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {order.date ? new Date(order.date).toLocaleDateString() : ""} · Received {order.receivedQty}/{order.orderedQty}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.canReceive ? (
            <Link href={`/purchases/receiving?orderId=${order.id}`} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">
              Receive
            </Link>
          ) : null}
          {order.canEdit && !editing ? (
            <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
              Edit
            </button>
          ) : null}
          {order.canCancel ? (
            <button type="button" onClick={cancelOrder} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
              Cancel order
            </button>
          ) : null}
        </div>
      </div>

      {error && !editing ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {editing ? (
        <PurchaseOrderForm
          mode="edit"
          order={order}
          suppliers={suppliers}
          items={items}
          lines={lines}
          onLinesChange={setLines}
          saving={saving}
          error={error}
          onSubmit={onSubmit}
          onCancel={() => { setEditing(false); setError(""); }}
        />
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Line items</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Item</th>
                    <th className="px-3 py-2 font-semibold">Ordered</th>
                    <th className="px-3 py-2 font-semibold">Received</th>
                    <th className="px-3 py-2 font-semibold">Remaining</th>
                    <th className="px-3 py-2 font-semibold">Unit price</th>
                    <th className="px-3 py-2 font-semibold">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.lines ?? []).map((line) => (
                    <tr key={line.id} className="border-t border-slate-100">
                      <td className="px-3 py-3 font-medium">{line.itemName} <span className="text-slate-400">({line.sku})</span></td>
                      <td className="px-3 py-3">{line.quantity}</td>
                      <td className="px-3 py-3">{line.receivedQty}</td>
                      <td className="px-3 py-3">{line.remaining}</td>
                      <td className="px-3 py-3">{Number(line.unitPrice).toFixed(2)}</td>
                      <td className="px-3 py-3 font-medium">{Number(line.lineTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-8 text-sm">
              <p className="text-slate-500">Subtotal <span className="ml-2 font-semibold text-slate-900">{Number(order.subtotal).toFixed(2)}</span></p>
              <p className="text-slate-500">Total <span className="ml-2 font-semibold text-slate-900">{Number(order.total).toFixed(2)}</span></p>
            </div>
            {order.notes ? <p className="mt-4 text-sm text-slate-600">{order.notes}</p> : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Receiving history</p>
            {(order.receipts ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No receiving yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {order.receipts.map((row) => (
                  <li key={row.id} className="flex justify-between gap-3 py-2">
                    <span>{new Date(row.date).toLocaleDateString()} · {row.itemName} × {row.quantity}</span>
                    {row.purchaseId ? (
                      <Link href={`/purchases/${row.purchaseId}`} className="text-[#2075fe]">Purchase</Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

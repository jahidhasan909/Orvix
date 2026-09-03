"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      fetch("/api/ngo/inventory/items").then(async (response) => (await response.json()).items ?? []),
      fetch("/api/ngo/inventory/suppliers").then(async (response) => (await response.json()).items ?? []),
      fetch("/api/ngo/assignments").then(async (response) => response.json()),
      fetch("/api/ngo/inventory/receive").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load receipts.");
        return data.items ?? [];
      }),
    ])
      .then(([catalog, vendorRows, assignments, rows]) => {
        setItems(catalog);
        setSuppliers(vendorRows);
        setProjects(assignments.projects ?? []);
        setSites(assignments.sites ?? []);
        setList(rows);
      })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/ngo/inventory/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: form.get("itemId"),
        quantity: form.get("quantity"),
        supplierId: form.get("supplierId"),
        reference: form.get("reference"),
        unitCost: form.get("unitCost"),
        date: form.get("date"),
        projectId: form.get("projectId"),
        siteId: form.get("siteId"),
        notes: form.get("notes"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not receive stock.");
      return;
    }
    event.currentTarget.reset();
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Stock Receiving</h2>
        <p className="mt-1 text-sm text-slate-500">Receipts increase on-hand quantity and write a stock transaction.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Item</span>
          <select name="itemId" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select item</option>
            {items.filter((item) => item.status === "active").map((item) => <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Quantity</span>
          <input name="quantity" type="number" min="1" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Supplier</span>
          <select name="supplierId" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">None</option>
            {suppliers.filter((row) => row.status === "active").map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Purchase / reference no.</span>
          <input name="reference" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Unit cost</span>
          <input name="unitCost" type="number" min="0" step="0.01" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Date</span>
          <input name="date" type="date" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Project</span>
          <select name="projectId" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">None</option>
            {projects.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Site</span>
          <select name="siteId" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">None</option>
            {sites.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Notes</span>
          <input name="notes" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Receive stock"}</button>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">Supplier</th>
              <th className="px-5 py-3 font-semibold">Ref</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-600">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-medium">{row.itemName}</td>
                <td className="px-5 py-3">{row.quantity}</td>
                <td className="px-5 py-3">{row.supplierName || "—"}</td>
                <td className="px-5 py-3 text-slate-500">{row.reference || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

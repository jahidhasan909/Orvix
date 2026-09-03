"use client";

import { useEffect, useMemo, useState } from "react";
import { ItemForm, StockBadge } from "@/Components/Inventory/InventoryForms";

export default function Page() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    if (stockStatus) params.set("stockStatus", stockStatus);
    Promise.all([
      fetch(`/api/ngo/inventory/items?${params}`).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load items.");
        return data.items ?? [];
      }),
      fetch("/api/ngo/inventory/categories").then(async (response) => (await response.json()).items ?? []),
      fetch("/api/ngo/assignments").then(async (response) => response.json()),
    ])
      .then(([list, cats, assignments]) => {
        setItems(list);
        setCategories(cats);
        setProjects(assignments.projects ?? []);
        setSites(assignments.sites ?? []);
      })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => {
    load();
  }, [q, categoryId, stockStatus]);

  const onSave = async (body) => {
    setSaving(true);
    setError("");
    const url = editing ? `/api/ngo/inventory/items/${editing.id}` : "/api/ngo/inventory/items";
    const response = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save the item.");
      return;
    }
    setCreating(false);
    setEditing(null);
    load();
  };

  const onArchive = async (item) => {
    if (!window.confirm("Archive or delete this item?")) return;
    const response = await fetch(`/api/ngo/inventory/items/${item.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error || "Could not remove the item.");
    load();
  };

  const formItem = useMemo(() => editing, [editing]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory Items</h2>
          <p className="mt-1 text-sm text-slate-500">Each item belongs only to this NGO.</p>
        </div>
        <button type="button" onClick={() => { setCreating(true); setEditing(null); }} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">
          Add item
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search name or SKU" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
        <select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All stock statuses</option>
          <option value="ok">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>
      {creating || editing ? (
        <ItemForm
          item={formItem}
          categories={categories}
          projects={projects}
          sites={sites}
          saving={saving}
          error={error}
          onSubmit={onSave}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">Min</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No items match.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.sku} · {item.unit}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{item.categoryName || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{item.quantity}</td>
                <td className="px-5 py-3 text-slate-600">{item.minLevel}</td>
                <td className="px-5 py-3"><StockBadge status={item.stockStatus} /></td>
                <td className="px-5 py-3 text-right">
                  <button type="button" onClick={() => { setEditing(item); setCreating(false); }} className="mr-3 text-sm font-semibold text-[#2075fe]">Edit</button>
                  <button type="button" onClick={() => onArchive(item)} className="text-sm text-slate-500">Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api("/ngo/inventory/categories")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load categories.");
        setItems(data.items ?? []);
      })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = { name: form.get("name"), description: form.get("description"), status: form.get("status") };
    const response = await api(editing ? `/ngo/inventory/categories/${editing.id}` : "/ngo/inventory/categories", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save the category.");
      return;
    }
    setEditing(null);
    event.currentTarget.reset();
    load();
  };

  const onDelete = async (row) => {
    if (!window.confirm("Delete this category? Categories in use will be archived.")) return;
    const response = await api(`/ngo/inventory/categories/${row.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error || "Could not delete.");
    else if (data.message) setError(data.message);
    load();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory Categories</h2>
        <p className="mt-1 text-sm text-slate-500">Used only for items in this NGO.</p>
      </div>
      {error ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div> : null}
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Name</span>
            <input name="name" required defaultValue={editing?.name ?? ""} key={editing?.id ?? "new"} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-800">Description</span>
            <input name="description" defaultValue={editing?.description ?? ""} key={`d-${editing?.id ?? "new"}`} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          {editing ? (
            <label>
              <span className="text-sm font-medium text-slate-800">Status</span>
              <select name="status" defaultValue={editing.status} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          ) : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {editing ? <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button> : null}
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : editing ? "Save" : "Create category"}</button>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Items</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-slate-900">{row.name}</td>
                <td className="px-5 py-3 text-slate-600">{row.itemCount}</td>
                <td className="px-5 py-3 text-slate-600">{row.status}</td>
                <td className="px-5 py-3 text-right">
                  <button type="button" onClick={() => setEditing(row)} className="mr-3 text-sm font-semibold text-[#2075fe]">Edit</button>
                  <button type="button" onClick={() => onDelete(row)} className="text-sm text-slate-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

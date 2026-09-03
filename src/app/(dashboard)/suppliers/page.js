"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    fetch("/api/ngo/inventory/suppliers")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load suppliers.");
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
    const body = {
      name: form.get("name"),
      contact: form.get("contact"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: form.get("address"),
      category: form.get("category"),
      status: form.get("status"),
    };
    const response = await fetch(editing ? `/api/ngo/inventory/suppliers/${editing.id}` : "/api/ngo/inventory/suppliers", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save supplier.");
      return;
    }
    setEditing(null);
    event.currentTarget.reset();
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Suppliers</h2>
        <p className="mt-1 text-sm text-slate-500">Vendors for this NGO. Receipts stay linked to the supplier record.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Name</span>
          <input name="name" required defaultValue={editing?.name ?? ""} key={editing?.id ?? "n"} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Contact</span>
          <input name="contact" defaultValue={editing?.contact ?? ""} key={`c-${editing?.id}`} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" defaultValue={editing?.email ?? ""} key={`e-${editing?.id}`} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Phone</span>
          <input name="phone" defaultValue={editing?.phone ?? ""} key={`p-${editing?.id}`} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Address</span>
          <input name="address" defaultValue={editing?.address ?? ""} key={`a-${editing?.id}`} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2 flex justify-end gap-2">
          {editing ? <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button> : null}
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : editing ? "Save" : "Add supplier"}</button>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{row.name}</td>
                <td className="px-5 py-3 text-slate-600">{row.email || row.phone || row.contact || "—"}</td>
                <td className="px-5 py-3">{row.status}</td>
                <td className="px-5 py-3 text-right">
                  <button type="button" onClick={() => setEditing(row)} className="text-sm font-semibold text-[#2075fe]">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

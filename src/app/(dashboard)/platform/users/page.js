"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");

  const load = () => {
    api("/platform/users")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load platform users.");
        setItems(data.items ?? []);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    const form = new FormData(event.currentTarget);
    const response = await api("/platform/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the admin.");
      return;
    }
    event.currentTarget.reset();
    setSaved("Platform admin created.");
    load();
  };

  const onUpdate = async (event, row) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await api(`/platform/users/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
        status: form.get("status"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not update the admin.");
      return;
    }
    setEditingId("");
    setSaved("Admin updated.");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Platform Users</h2>
        <p className="mt-1 text-sm text-slate-500">Main Platform Admins only. Role cannot be changed from the client.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {saved ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saved}</div> : null}

      <form onSubmit={onCreate} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label>
          <span className="text-sm font-medium">Name</span>
          <input name="name" required className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Phone</span>
          <input name="phone" className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Password</span>
          <input name="password" type="password" required minLength={8} className={inputClass} />
        </label>
        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : "Create Platform Admin"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-400">No platform admins found.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((row) => (
              <li key={row.id} className="px-5 py-4">
                {editingId === row.id ? (
                  <form onSubmit={(event) => onUpdate(event, row)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <input name="name" defaultValue={row.name} required className={inputClass} />
                    <input name="email" type="email" defaultValue={row.email} required className={inputClass} />
                    <input name="phone" defaultValue={row.phone} className={inputClass} />
                    <select name="status" defaultValue={row.status} className={inputClass}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <input name="password" type="password" minLength={8} placeholder="New password" className={inputClass} />
                    <div className="sm:col-span-2 lg:col-span-5 flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingId("")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Cancel</button>
                      <button type="submit" className="rounded-lg bg-[#2075fe] px-3 py-2 text-sm font-semibold text-white">Save</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{row.name}</p>
                      <p className="text-sm text-slate-500">{row.email}{row.phone ? ` · ${row.phone}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {row.status}
                      </span>
                      <button type="button" onClick={() => setEditingId(row.id)} className="text-sm font-semibold text-[#2075fe]">Edit</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

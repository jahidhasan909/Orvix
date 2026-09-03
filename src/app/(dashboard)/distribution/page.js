"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      fetch("/api/ngo/inventory/items").then(async (response) => (await response.json()).items ?? []),
      fetch("/api/ngo/workers").then(async (response) => response.ok ? (await response.json()).items ?? [] : []),
      fetch("/api/ngo/assignments").then(async (response) => response.ok ? response.json() : { projects: [], sites: [] }),
      fetch("/api/ngo/inventory/issue").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load issues.");
        return data.items ?? [];
      }),
    ])
      .then(([catalog, workerRows, assignments, rows]) => {
        setItems(catalog);
        setWorkers(workerRows);
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
    const response = await fetch("/api/ngo/inventory/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: form.get("itemId"),
        quantity: form.get("quantity"),
        workerId: form.get("workerId"),
        projectId: form.get("projectId"),
        siteId: form.get("siteId"),
        reason: form.get("reason"),
        notes: form.get("notes"),
        date: form.get("date"),
        type: "distribution",
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not issue stock.");
      return;
    }
    event.currentTarget.reset();
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Distribution / Stock Issue</h2>
        <p className="mt-1 text-sm text-slate-500">Issuing stock decreases on-hand quantity. More than available stock is blocked.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Item</span>
          <select name="itemId" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select item</option>
            {items.filter((item) => item.status === "active").map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Quantity</span>
          <input name="quantity" type="number" min="1" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Worker</span>
          <select name="workerId" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">None</option>
            {workers.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
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
          <span className="text-sm font-medium">Reason / purpose</span>
          <input name="reason" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Issue stock"}</button>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-medium">{row.itemName}</td>
                <td className="px-5 py-3">{row.quantity}</td>
                <td className="px-5 py-3 text-slate-500">{row.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { ROLES } from "@/lib/navigation";

export default function Page() {
  const { persona } = useAccess();
  const isAdmin = persona?.role === ROLES.NGO_ADMIN;
  const [items, setItems] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  const load = () => {
    Promise.all([
      api("/ngo/inventory/requests").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load requests.");
        return data.items ?? [];
      }),
      api("/ngo/inventory/items").then(async (response) => (await response.json()).items ?? []),
      api(isAdmin ? "/ngo/assignments" : "/assignments/me").then(async (response) => (
        response.ok ? response.json() : { projects: [], sites: [] }
      )),
    ])
      .then(([rows, items, assignments]) => {
        setItems(rows);
        setCatalog(items);
        setProjects(assignments.projects ?? []);
        setSites(assignments.sites ?? []);
      })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => { load(); }, [persona?.role]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await api("/ngo/inventory/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: form.get("itemId"),
        quantity: form.get("quantity"),
        projectId: form.get("projectId"),
        siteId: form.get("siteId"),
        reason: form.get("reason"),
        notes: form.get("notes"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the request.");
      return;
    }
    event.currentTarget.reset();
    load();
  };

  const act = async (id, action) => {
    const response = await api(`/ngo/inventory/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, decisionNote: note }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error || "Could not update the request.");
    load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Resource Requests</h2>
        <p className="mt-1 text-sm text-slate-500">Stock is deducted only when an approved request is issued.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Item</span>
          <select name="itemId" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select item</option>
            {catalog.filter((item) => item.status !== "inactive").map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Quantity</span>
          <input name="quantity" type="number" min="1" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Submit request"}</button>
        </div>
      </form>
      {isAdmin ? (
        <label className="block">
          <span className="text-sm font-medium">Approval / rejection note</span>
          <input value={note} onChange={(event) => setNote(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Qty</th>
              <th className="px-5 py-3 font-semibold">By</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{row.itemName}<span className="block text-xs text-slate-400">{row.projectName || row.siteName || ""}</span></td>
                <td className="px-5 py-3">{row.quantity}</td>
                <td className="px-5 py-3 text-slate-600">{row.requestedBy}</td>
                <td className="px-5 py-3">{row.status}</td>
                <td className="px-5 py-3 text-right">
                  {isAdmin && row.status === "pending" ? (
                    <>
                      <button type="button" onClick={() => act(row.id, "approve")} className="mr-2 text-sm font-semibold text-[#2075fe]">Approve</button>
                      <button type="button" onClick={() => act(row.id, "reject")} className="text-sm text-slate-500">Reject</button>
                    </>
                  ) : null}
                  {isAdmin && row.status === "approved" ? (
                    <button type="button" onClick={() => act(row.id, "issue")} className="text-sm font-semibold text-[#2075fe]">Issue</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

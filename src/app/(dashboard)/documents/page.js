"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { ROLES } from "@/lib/navigation";

const RELATED = [
  { id: "operational", label: "Operational" },
  { id: "ngo", label: "NGO" },
  { id: "project", label: "Project" },
  { id: "worker", label: "Worker" },
  { id: "supplier", label: "Supplier" },
];

export default function Page() {
  const { persona } = useAccess();
  const isAdmin = persona?.role === ROLES.NGO_ADMIN;
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [relatedType, setRelatedType] = useState("operational");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const extras = isAdmin
      ? [
          api("/ngo/projects").then(async (response) => (await response.json()).items ?? []),
          api("/ngo/workers").then(async (response) => (await response.json()).items ?? []),
          api("/ngo/inventory/suppliers").then(async (response) => (await response.json()).items ?? []),
        ]
      : [Promise.resolve([]), Promise.resolve([]), Promise.resolve([])];
    Promise.all([
      api("/ngo/documents").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load documents.");
        return data.items ?? [];
      }),
      ...extras,
    ])
      .then(([rows, projectRows, workerRows, supplierRows]) => {
        setItems(rows);
        setProjects(projectRows);
        setWorkers(workerRows);
        setSuppliers(supplierRows);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [isAdmin]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await api("/ngo/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        relatedType: form.get("relatedType"),
        relatedId: form.get("relatedId"),
        url: form.get("url"),
        notes: form.get("notes"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save the document.");
      return;
    }
    event.currentTarget.reset();
    setRelatedType("operational");
    load();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this document record?")) return;
    const response = await api(`/ngo/documents/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not delete the document.");
      return;
    }
    load();
  };

  const relatedOptions =
    relatedType === "project" ? projects
      : relatedType === "worker" ? workers
        : relatedType === "supplier" ? suppliers
          : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Documents</h2>
        <p className="mt-1 text-sm text-slate-500">Operational records for this NGO. Link a SharePoint or file URL — this is not a SharePoint site location.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {isAdmin ? (
        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <label>
            <span className="text-sm font-medium">Name</span>
            <input name="name" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label>
            <span className="text-sm font-medium">Related to</span>
            <select name="relatedType" value={relatedType} onChange={(event) => setRelatedType(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {RELATED.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}
            </select>
          </label>
          {relatedOptions.length ? (
            <label>
              <span className="text-sm font-medium">Record</span>
              <select name="relatedId" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">None</option>
                {relatedOptions.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
              </select>
            </label>
          ) : null}
          <label className={relatedOptions.length ? "" : "sm:col-span-2"}>
            <span className="text-sm font-medium">File / SharePoint URL</span>
            <input name="url" type="url" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <input name="notes" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Add document"}</button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Related</th>
              <th className="px-5 py-3 font-semibold">Link</th>
              {isAdmin ? <th className="px-5 py-3 font-semibold"></th> : null}
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr><td colSpan={isAdmin ? 4 : 3} className="px-5 py-16 text-center text-slate-400">No documents yet.</td></tr>
            ) : items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{row.name}<span className="block text-xs text-slate-400">{row.notes}</span></td>
                <td className="px-5 py-3 capitalize">{row.relatedType || "operational"}</td>
                <td className="px-5 py-3">
                  {row.url ? <a href={row.url} target="_blank" rel="noreferrer" className="text-[#2075fe]">Open</a> : "—"}
                </td>
                {isAdmin ? (
                  <td className="px-5 py-3 text-right">
                    <button type="button" onClick={() => onDelete(row.id)} className="text-sm text-slate-500">Delete</button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

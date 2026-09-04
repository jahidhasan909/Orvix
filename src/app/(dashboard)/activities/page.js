"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/Components/Procurement/forms";

const STATUSES = [
  { id: "planned", label: "Planned" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
];

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  const load = () => {
    fetch("/api/activities/me")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load activities.");
        setItems(data.items ?? []);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setSaving(id);
    const response = await fetch("/api/activities/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving("");
    if (!response.ok) {
      setError(data.error || "Could not update the activity.");
      return;
    }
    setItems((current) => current.map((row) => (row.id === id ? data.item : row)));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Assigned Activities</h2>
        <p className="mt-1 text-sm text-slate-500">Only activities assigned to you in this NGO.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p> : items.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-400">No activities assigned yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="text-sm text-slate-500">{row.projectName || "No project"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={row.status} labels={{ planned: "Planned", in_progress: "In progress", done: "Done" }} />
                  <select
                    value={row.status}
                    disabled={saving === row.id}
                    onChange={(event) => updateStatus(row.id, event.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  >
                    {STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/Components/Procurement/forms";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  const load = () => {
    api("/data-entry/me")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load forms.");
        setItems(data.items ?? []);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async (row, records, status) => {
    setSaving(row.id);
    const response = await api("/data-entry/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, records, status }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving("");
    if (!response.ok) {
      setError(data.error || "Could not update the form.");
      return;
    }
    setItems((current) => current.map((item) => (item.id === row.id ? data.item : item)));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Data Entry</h2>
        <p className="mt-1 text-sm text-slate-500">Forms assigned to you. Record counts persist for this NGO only.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p> : items.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-400">No forms assigned yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((row) => (
              <li key={row.id} className="flex flex-wrap items-end justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-slate-900">{row.form}</p>
                  <StatusBadge status={row.status} labels={{ open: "Open", submitted: "Submitted" }} />
                </div>
                <div className="flex items-end gap-2">
                  <label>
                    <span className="text-xs text-slate-500">Records</span>
                    <input
                      type="number"
                      min="0"
                      defaultValue={row.records}
                      className="mt-1 block w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      onBlur={(event) => save(row, event.target.value, row.status)}
                    />
                  </label>
                  {row.status !== "submitted" ? (
                    <button
                      type="button"
                      disabled={saving === row.id}
                      onClick={() => save(row, row.records, "submitted")}
                      className="rounded-lg bg-[#2075fe] px-3 py-2 text-sm font-semibold text-white"
                    >
                      Submit
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

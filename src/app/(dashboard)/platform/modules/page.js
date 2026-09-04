"use client";

import { useEffect, useState } from "react";
import { NGO_MODULE_OPTIONS, moduleOptionIdsFromEnabled } from "@/lib/ngo-catalog";

export default function Page() {
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    fetch("/api/platform/ngos")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load NGOs.");
        const rows = data.items ?? [];
        setItems(rows);
        setDrafts(Object.fromEntries(rows.map((row) => [row.id, moduleOptionIdsFromEnabled(row.enabledModules)])));
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (ngoId, optionId) => {
    setDrafts((current) => {
      const selected = current[ngoId] ?? [];
      return {
        ...current,
        [ngoId]: selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      };
    });
  };

  const save = async (ngo) => {
    setSaving(ngo.id);
    setError("");
    setSaved("");
    const response = await fetch(`/api/platform/ngos/${ngo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modulesOnly: true, moduleOptionIds: drafts[ngo.id] ?? [] }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving("");
    if (!response.ok) {
      setError(data.error || "Could not update modules.");
      return;
    }
    setSaved(`Modules updated for ${ngo.name}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Module Management</h2>
        <p className="mt-1 text-sm text-slate-500">Platform Admin controls which module groups each NGO can use. NGO Admins cannot enable modules from here.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {saved ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saved}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-400">Create an NGO first.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((ngo) => (
              <li key={ngo.id} className="px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{ngo.name}</p>
                    <p className="text-xs text-slate-400">{ngo.status}</p>
                  </div>
                  <button
                    type="button"
                    disabled={saving === ngo.id}
                    onClick={() => save(ngo)}
                    className="rounded-lg bg-[#2075fe] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving === ngo.id ? "Saving…" : "Save"}
                  </button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {NGO_MODULE_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(drafts[ngo.id] ?? []).includes(option.id)}
                        onChange={() => toggle(ngo.id, option.id)}
                        className="mt-0.5"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

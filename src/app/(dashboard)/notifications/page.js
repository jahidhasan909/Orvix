"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/notifications/me")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load notifications.");
        setItems(data.items ?? []);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const mark = async (id) => {
    const response = await fetch("/api/notifications/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { action: "readAll" }),
    });
    if (!response.ok) return;
    if (!id) {
      setItems((current) => current.map((row) => ({ ...row, unread: false })));
      return;
    }
    setItems((current) => current.map((row) => (row.id === id ? { ...row, unread: false } : row)));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Your alerts only. Leave and resource decisions appear here.</p>
        </div>
        {items.some((row) => row.unread) ? (
          <button type="button" onClick={() => mark()} className="text-sm font-semibold text-[#2075fe]">Mark all read</button>
        ) : null}
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p> : items.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-400">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((row) => (
              <li key={row.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm ${row.unread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>{row.title}</p>
                    {row.body ? <p className="mt-1 text-sm text-slate-500">{row.body}</p> : null}
                    <p className="mt-1 text-xs text-slate-400">{new Date(row.createdAt).toLocaleString()}</p>
                  </div>
                  {row.unread ? (
                    <button type="button" onClick={() => mark(row.id)} className="text-sm font-semibold text-[#2075fe]">Read</button>
                  ) : (
                    <span className="text-xs text-slate-400">Read</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

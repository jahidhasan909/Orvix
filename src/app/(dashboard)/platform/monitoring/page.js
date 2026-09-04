"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/monitoring")
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Could not load monitoring.");
        setData(payload);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Monitoring</h2>
        <p className="mt-1 text-sm text-slate-500">Inactive NGOs, pending requests, and recent platform activity.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {loading || !data ? (
        <p className="flex items-center gap-2 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">Pending resource requests</p>
            {(data.pendingRequests ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">None pending.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.pendingRequests.map((row) => (
                  <li key={row.ngoId} className="flex justify-between py-2 text-sm">
                    <span>{row.ngoName}</span>
                    <span className="font-semibold">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">Inactive NGOs</p>
            {(data.inactiveNgos ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">All NGOs are active.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.inactiveNgos.map((row) => (
                  <li key={row.id} className="py-2 text-sm">{row.name}</li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">Recently created NGOs</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {(data.recentNgos ?? []).map((row) => (
                <li key={row.id} className="flex justify-between py-2 text-sm">
                  <span>{row.name}</span>
                  <span className="text-slate-400">{row.status}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">Recent audit</p>
            {(data.recentAudit ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No audit events yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.recentAudit.map((row) => (
                  <li key={row.id} className="py-2 text-sm">
                    <p className="font-medium">{row.action}</p>
                    <p className="text-xs text-slate-400">{row.actor} · {row.target || "—"}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

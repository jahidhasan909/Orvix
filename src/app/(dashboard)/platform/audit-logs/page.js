"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api(`/platform/audit-logs?q=${encodeURIComponent(query)}`)
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "Could not load audit logs.");
          setItems(data.items ?? []);
          setError("");
        })
        .catch((loadError) => setError(loadError.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Audit Logs</h2>
        <p className="mt-1 text-sm text-slate-500">Platform-level NGO, admin, module, and settings changes. Passwords are never stored here.</p>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search actor, action, or target"
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20"
      />
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-16 text-center text-slate-400"><span className="inline-flex items-center gap-2"><span className="orvix-spinner" />Loading…</span></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-16 text-center text-slate-400">No audit events yet.</td></tr>
            ) : items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-500">{row.at ? new Date(row.at).toLocaleString() : "—"}</td>
                <td className="px-5 py-3">{row.actor}</td>
                <td className="px-5 py-3 font-medium">{row.action}</td>
                <td className="px-5 py-3 text-slate-600">{row.target || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

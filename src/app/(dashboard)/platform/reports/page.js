"use client";

import { useEffect, useState } from "react";

const KINDS = [
  { id: "ngos", label: "NGOs" },
  { id: "users", label: "Users" },
  { id: "operations", label: "Operations" },
  { id: "supply", label: "Supply" },
];

export default function Page() {
  const [kind, setKind] = useState("ngos");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/platform/reports?kind=${kind}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Could not load the report.");
        setData(payload);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [kind]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Platform Reports</h2>
        <p className="mt-1 text-sm text-slate-500">Cross-NGO totals from the live database.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setKind(item.id);
              setLoading(true);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm ${kind === item.id ? "bg-[#2075fe] text-white" : "border border-slate-200 text-slate-700"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading || !data || data.kind !== kind ? (
          <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p>
        ) : data.kind === "ngos" ? (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">NGO</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Users</th>
                <th className="px-5 py-3">Projects</th>
                <th className="px-5 py-3">Sites</th>
              </tr>
            </thead>
            <tbody>
              {(data.items ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-400">No NGOs.</td></tr>
              ) : data.items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium">{row.name}</td>
                  <td className="px-5 py-3">{row.status}</td>
                  <td className="px-5 py-3">{row.users}</td>
                  <td className="px-5 py-3">{row.projects}</td>
                  <td className="px-5 py-3">{row.sites}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data)
              .filter(([key, value]) => key !== "kind" && (typeof value === "string" || typeof value === "number"))
              .map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

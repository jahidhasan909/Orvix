"use client";

import { useEffect, useState } from "react";

function monthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Page() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = (start = from, end = to) => {
    fetch(`/api/ngo/reports?kind=attendance&from=${start}&to=${end}`)
      .then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Could not load report.");
        setData(json);
        setError("");
      })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance Report</h2>
        <p className="mt-1 text-sm text-slate-500">Attendance records for this NGO in the selected range.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <form onSubmit={(event) => { event.preventDefault(); load(); }} className="flex flex-wrap gap-3">
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Apply</button>
      </form>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase text-slate-500">Records</p>
        <p className="mt-2 text-2xl font-semibold">{data?.total ?? 0}</p>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">By status</p>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {(data?.byStatus ?? []).length === 0 ? <li className="py-3 text-slate-400">No attendance in this range.</li> : data.byStatus.map((row) => (
            <li key={row.id} className="flex justify-between py-2 capitalize"><span>{row.id}</span><span>{row.count}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

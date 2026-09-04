"use client";

import { useEffect, useState } from "react";
import { LEAVE_TYPES } from "@/lib/leave";
import { StatusBadge } from "@/Components/Procurement/forms";

export default function Page() {
  const [items, setItems] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = status ? `?status=${status}` : "";
    Promise.all([
      fetch(`/api/ngo/leave${params}`).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load leave.");
        return data.items ?? [];
      }),
      fetch("/api/ngo/workers").then(async (response) => (await response.json()).items ?? []),
    ])
      .then(([rows, workerRows]) => {
        setItems(rows);
        setWorkers(workerRows);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/ngo/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: form.get("userId"),
        type: form.get("type"),
        days: form.get("days"),
        startsOn: form.get("startsOn"),
        endsOn: form.get("endsOn"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the leave request.");
      return;
    }
    event.currentTarget.reset();
    load();
  };

  const act = async (id, action) => {
    const response = await fetch(`/api/ngo/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not update leave.");
      return;
    }
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Leave Management</h2>
        <p className="mt-1 text-sm text-slate-500">Approved leave is used in payroll. Create and approve requests for this NGO only.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <label>
          <span className="text-sm font-medium">Worker</span>
          <select name="userId" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select worker</option>
            {workers.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Type</span>
          <select name="type" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {LEAVE_TYPES.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Days</span>
          <input name="days" type="number" min="1" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Starts</span>
          <input name="startsOn" type="date" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label>
          <span className="text-sm font-medium">Ends</span>
          <input name="endsOn" type="date" required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : "Create leave request"}
          </button>
        </div>
      </form>

      <div className="flex gap-2">
        {["", "pending", "approved", "rejected"].map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-lg px-3 py-1.5 text-sm ${status === value ? "bg-[#2075fe] text-white" : "border border-slate-200 text-slate-700"}`}
          >
            {value ? value[0].toUpperCase() + value.slice(1) : "All"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Worker</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Days</th>
              <th className="px-5 py-3 font-semibold">Dates</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400">No leave requests.</td></tr>
            ) : items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{row.worker}</td>
                <td className="px-5 py-3">{row.typeLabel}{row.paid ? "" : " · unpaid"}</td>
                <td className="px-5 py-3">{row.days}</td>
                <td className="px-5 py-3 text-slate-600">
                  {row.startsOn ? new Date(row.startsOn).toLocaleDateString() : "—"} – {row.endsOn ? new Date(row.endsOn).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3"><StatusBadge status={row.status} labels={{ pending: "Pending", approved: "Approved", rejected: "Rejected" }} /></td>
                <td className="px-5 py-3 text-right">
                  {row.status === "pending" ? (
                    <>
                      <button type="button" onClick={() => act(row.id, "approve")} className="mr-2 text-sm font-semibold text-[#2075fe]">Approve</button>
                      <button type="button" onClick={() => act(row.id, "reject")} className="text-sm text-slate-500">Reject</button>
                    </>
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

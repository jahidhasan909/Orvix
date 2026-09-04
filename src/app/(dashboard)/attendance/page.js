"use client";

import { useEffect, useState } from "react";
import { ABSENCE_REASONS, resolveAbsencePolicy } from "@/lib/absence-policy";

const inputClass =
  "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";

const STATUSES = [
  { id: "present", label: "Present" },
  { id: "absent", label: "Absent" },
  { id: "leave", label: "Leave" },
  { id: "holiday", label: "Holiday" },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Page() {
  const [date, setDate] = useState(todayKey());
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [reasons, setReasons] = useState(ABSENCE_REASONS);

  const load = (day) => {
    setLoading(true);
    fetch(`/api/ngo/attendance?date=${day}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load attendance.");
        setItems(data.items ?? []);
        if (Array.isArray(data.reasons) && data.reasons.length) setReasons(data.reasons);
        setDrafts(
          Object.fromEntries(
            (data.items ?? []).map((item) => [
              item.id,
              {
                status: item.attendance?.status || "",
                leavePaid: Boolean(item.attendance?.leavePaid),
                reason: (() => {
                  const policy = resolveAbsencePolicy(item.attendance?.reason);
                  return policy.known ? policy.id : item.attendance?.reason || "";
                })(),
              },
            ])
          )
        );
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(date);
  }, [date]);

  const save = async (workerId) => {
    const draft = drafts[workerId];
    if (!draft?.status) return;
    setSavingId(workerId);
    setError("");
    const response = await fetch("/api/ngo/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: workerId,
        date,
        status: draft.status,
        leavePaid: draft.leavePaid,
        reason: draft.reason,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSavingId("");
    if (!response.ok) {
      setError(data.error || "Could not save attendance.");
      return;
    }
    load(date);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Mark each worker for the day. Unrecorded working days count as unpaid absences on salary.
          </p>
        </div>
        <label className="text-sm font-medium text-slate-800">
          Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={`${inputClass} mt-1.5 block`} />
        </label>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Worker</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Paid leave</th>
              <th className="px-5 py-3 font-semibold">Absence reason</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400"><span className="inline-flex items-center justify-center gap-2"><span className="orvix-spinner" />Loading…</span></td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">No workers in this NGO.</td>
              </tr>
            ) : (
              items.map((worker) => {
                const draft = drafts[worker.id] ?? { status: "", leavePaid: false, reason: "" };
                const beforeJoin = Boolean(worker.joiningDate && date < worker.joiningDate);
                return (
                  <tr key={worker.id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{worker.name}</p>
                      <p className="text-xs text-slate-400">{worker.employeeId || worker.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={draft.status}
                        className={inputClass}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [worker.id]: { ...draft, status: event.target.value },
                          }))
                        }
                      >
                        <option value="">Not recorded</option>
                        {STATUSES.map((item) => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          disabled={draft.status !== "leave"}
                          checked={Boolean(draft.leavePaid)}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [worker.id]: { ...draft, leavePaid: event.target.checked },
                            }))
                          }
                        />
                        Paid
                      </label>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        disabled={draft.status !== "absent"}
                        value={draft.reason || ""}
                        className={`${inputClass} w-44 disabled:bg-slate-50`}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [worker.id]: { ...draft, reason: event.target.value },
                          }))
                        }
                      >
                        <option value="">Select reason</option>
                        {reasons.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label} ({item.paid ? "Paid" : "Unpaid"})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={!draft.status || beforeJoin || savingId === worker.id || (draft.status === "absent" && !draft.reason)}
                        onClick={() => save(worker.id)}
                        className="rounded-lg bg-[#2075fe] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-50"
                      >
                        {savingId === worker.id ? "Saving…" : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

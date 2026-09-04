"use client";

import { useEffect, useState } from "react";
import WorkerAttendanceCalendar from "@/Components/Attendance/WorkerAttendanceCalendar";
import { ABSENCE_REASONS } from "@/lib/absence-policy";
import { monthCursor, shiftMonth } from "@/lib/attendance-day";
import { dateKey } from "@/lib/payroll";

function moneyLabel(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(Number(ms) / 1000) || 0);
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function Page() {
  const [cursor, setCursor] = useState(() => monthCursor());
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [absentOpen, setAbsentOpen] = useState(false);
  const [absentReason, setAbsentReason] = useState("");
  const [absentNote, setAbsentNote] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const load = (nextCursor = cursor) => {
    setLoading(true);
    fetch(`/api/attendance/me?from=${nextCursor.from}&to=${nextCursor.to}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Could not load attendance.");
        setData(payload);
        setSelected((current) => {
          const today = payload.date || dateKey(new Date());
          const joining = payload.joiningDate || "";
          const pick = (key) => {
            if (joining && key < joining) return joining <= today ? joining : today;
            return key > today ? today : key;
          };
          if (current >= nextCursor.from && current <= nextCursor.to) {
            return pick(current <= today ? current : today);
          }
          return pick(today >= nextCursor.from && today <= nextCursor.to ? today : nextCursor.from);
        });
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(cursor);
  }, [cursor.from, cursor.to]);

  const todayKey = data?.date || dateKey(new Date());
  const joiningKey = data?.joiningDate || "";
  const canMarkSelected =
    Boolean(selected) &&
    selected <= todayKey &&
    (!joiningKey || selected >= joiningKey);
  const selectedDay = (data?.calculation?.days ?? []).find((day) => day.date === selected);
  const checkedIn = Boolean(selectedDay?.checkInAt);
  const presentClosed = Boolean(selectedDay?.checkInAt && selectedDay?.checkOutAt);
  const timerRunning = checkedIn && !presentClosed;

  useEffect(() => {
    if (!timerRunning) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timerRunning, selectedDay?.checkInAt]);

  const elapsedMs = selectedDay?.checkInAt
    ? (selectedDay.checkOutAt ? new Date(selectedDay.checkOutAt).getTime() : now) -
      new Date(selectedDay.checkInAt).getTime()
    : 0;

  const saveDay = async (status, reason, note, day = selected, action) => {
    setSaving(action || status);
    setError("");
    const response = await fetch("/api/attendance/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason, note, date: day, action }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving("");
    if (!response.ok) {
      setError(payload.error || "Could not record attendance.");
      return;
    }
    setData({
      ...payload,
      date: payload.date || todayKey,
      joiningDate: payload.joiningDate || joiningKey,
    });
    setSelected(day);
    setAbsentOpen(false);
    setAbsentReason("");
    setAbsentNote("");
  };

  const punch = (action) => {
    if (!canMarkSelected) {
      setError(
        joiningKey && selected < joiningKey
          ? "You cannot mark attendance before your joining date."
          : "Select a valid date first."
      );
      return;
    }
    saveDay("present", undefined, undefined, selected, action);
  };

  const markAbsent = () => {
    if (!absentReason) {
      setError("Please select an absent category.");
      return;
    }
    if (!canMarkSelected) {
      setError("You cannot mark attendance before your joining date.");
      return;
    }
    saveDay("absent", absentReason, absentNote, selected);
  };

  const changeMonth = (delta) => {
    const next = shiftMonth(cursor.from, delta);
    setCursor(next);
  };

  const calc = data?.calculation;
  const unpaidDays = (calc?.absentDays ?? 0) + (calc?.unpaidLeaveDays ?? 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">My Attendance</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Review your own attendance by date. Unrecorded working days count as unpaid absences for salary.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-lg border px-3 py-2 font-mono text-sm font-semibold tabular-nums ${
              timerRunning
                ? "border-[#2075fe] bg-[#2075fe]/5 text-[#2075fe]"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {formatElapsed(elapsedMs)}
          </span>
          <button
            type="button"
            onClick={() => punch("check-in")}
            disabled={Boolean(saving) || !canMarkSelected || checkedIn}
            className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
          >
            {saving === "check-in" ? "Saving…" : "Check in"}
          </button>
          <button
            type="button"
            onClick={() => punch("check-out")}
            disabled={Boolean(saving) || !canMarkSelected || !checkedIn || presentClosed}
            className="rounded-lg border border-[#2075fe] bg-white px-4 py-2.5 text-sm font-semibold text-[#2075fe] hover:bg-[#2075fe]/5 disabled:opacity-60"
          >
            {saving === "check-out" ? "Saving…" : "Check out"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAbsentOpen((open) => !open);
              setError("");
            }}
            disabled={Boolean(saving) || !canMarkSelected}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            Mark Absent
          </button>
        </div>
      </div>

      {absentOpen ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Why are you absent today?</p>
          <p className="mt-1 text-sm text-slate-500">
            This applies to the selected date. Paid reasons (such as Sick) do not deduct salary; unpaid reasons do.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium text-slate-800">
              Absent reason
              <select
                value={absentReason}
                onChange={(event) => setAbsentReason(event.target.value)}
                className="mt-1.5 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20"
              >
                <option value="">Select a category</option>
                {(data?.reasons ?? ABSENCE_REASONS).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} ({item.paid ? "Paid" : "Unpaid"})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-800">
              Reason
              <input
                type="text"
                value={absentNote}
                onChange={(event) => setAbsentNote(event.target.value)}
                placeholder="Optional details"
                className="mt-1.5 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20"
              />
            </label>
            <button
              type="button"
              onClick={markAbsent}
              disabled={Boolean(saving)}
              className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
            >
              {saving === "absent" ? "Saving…" : "Save absent"}
            </button>
          </div>
        </section>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {calc && !calc.skipped ? (
        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <Stat label="Total unpaid absent days" value={unpaidDays} hint="Unpaid absences and unpaid leave" />
          <Stat label="Total salary deduction" value={moneyLabel(calc.totalDeduction)} />
          <Stat label="Remaining / payable salary" value={moneyLabel(calc.payableSalary)} />
        </section>
      ) : null}

      {loading && !data ? (
        <p className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading your attendance…</p>
      ) : (
        <WorkerAttendanceCalendar
          from={cursor.from}
          days={calc?.days ?? []}
          selected={selected}
          today={data?.date || cursor.from}
          joiningDate={data?.joiningDate}
          onSelect={setSelected}
          onPrev={() => changeMonth(-1)}
          onNext={() => changeMonth(1)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

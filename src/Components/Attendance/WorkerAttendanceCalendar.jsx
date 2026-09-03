"use client";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLE = {
  Present: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Absent: "bg-rose-50 text-rose-700 border-rose-200",
  Leave: "bg-amber-50 text-amber-800 border-amber-200",
  Holiday: "bg-slate-50 text-slate-600 border-slate-200",
};

function parseKey(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  return { year, month, day };
}

function monthLabel(from) {
  const { year, month } = parseKey(from);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function longDate(key) {
  const { year, month, day } = parseKey(key);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
  });
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function calendarCells(from, daysByDate) {
  const { year, month } = parseKey(from);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const pad = (first.getUTCDay() + 6) % 7;
  const cells = Array.from({ length: pad }, () => null);

  for (let day = 1; day <= last.getUTCDate(); day += 1) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key, day, item: daysByDate.get(key) ?? null });
  }

  return cells;
}

export default function WorkerAttendanceCalendar({
  from,
  days,
  selected,
  today,
  onSelect,
  onPrev,
  onNext,
}) {
  const daysByDate = new Map((days ?? []).map((item) => [item.date, item]));
  const cells = calendarCells(from, daysByDate);
  const selectedDay = daysByDate.get(selected) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Previous
          </button>
          <h3 className="text-base font-semibold text-slate-900">{monthLabel(from)}</h3>
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          {WEEKDAYS.map((label) => (
            <div key={label} className="py-2">{label}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell) return <div key={`pad-${index}`} />;
            const status = cell.item?.status;
            const isSelected = selected === cell.key;
            const isToday = today === cell.key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => onSelect(cell.key)}
                className={`min-h-16 rounded-xl border px-1.5 py-2 text-left transition ${
                  isSelected
                    ? "border-[#2075fe] bg-[#2075fe]/5 shadow-sm"
                    : "border-dashed border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className={`text-sm font-semibold ${isToday ? "text-[#2075fe]" : "text-slate-800"}`}>{cell.day}</p>
                {status ? (
                  <p className={`mt-1 truncate rounded-md border px-1 py-0.5 text-[10px] font-medium ${STATUS_STYLE[status] || STATUS_STYLE.Holiday}`}>
                    {status}
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-300">{cell.key > today ? "" : "—"}</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Selected date</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{longDate(selected)}</h3>

        {!selectedDay ? (
          <p className="mt-4 text-sm text-slate-500">
            {selected > today ? "This date has not been reached yet." : "No attendance applies on this date."}
          </p>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Attendance status</dt>
              <dd className="mt-1 font-medium text-slate-900">{selectedDay.status}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Check-in time</dt>
              <dd className="mt-1 font-medium text-slate-900">{formatTime(selectedDay.checkInAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Check-out time</dt>
              <dd className="mt-1 font-medium text-slate-900">{formatTime(selectedDay.checkOutAt)}</dd>
            </div>
            {selectedDay.status === "Absent" ? (
              <>
                <div>
                  <dt className="text-xs text-slate-400">Absence reason</dt>
                  <dd className="mt-1 font-medium text-slate-900">{selectedDay.reason || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Salary policy</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {selectedDay.paid ? "Paid — no deduction" : "Unpaid — daily salary deducted"}
                  </dd>
                </div>
              </>
            ) : null}
            {selectedDay.status === "Leave" && selectedDay.leave ? (
              <div>
                <dt className="text-xs text-slate-400">Leave information</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {selectedDay.leave.type}
                  {" · "}
                  {selectedDay.leave.paid ? "Paid" : "Unpaid"}
                  {selectedDay.leave.from && selectedDay.leave.to
                    ? ` · ${selectedDay.leave.from} to ${selectedDay.leave.to}`
                    : ""}
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </aside>
    </div>
  );
}

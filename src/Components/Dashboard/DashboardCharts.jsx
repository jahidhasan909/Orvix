"use client";

const COLORS = ["#2075fe", "#10b981", "#f59e0b", "#ef4444", "#64748b", "#8b5cf6"];

function toSlices(source = {}, labels = {}) {
  return Object.entries(source)
    .map(([key, value]) => ({
      name: labels[key] || key.replace(/_/g, " "),
      value: Number(value) || 0,
    }))
    .filter((item) => item.value > 0);
}

function polar(cx, cy, radius, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

function slicePath(cx, cy, radius, start, end) {
  const [x1, y1] = polar(cx, cy, radius, start);
  const [x2, y2] = polar(cx, cy, radius, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
}

function ChartCard({ title, children, empty }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-4 min-h-64">
        {empty ? <p className="flex h-64 items-center justify-center text-sm text-slate-400">No data yet.</p> : children}
      </div>
    </section>
  );
}

function PieBlock({ title, data }) {
  const slices = Array.isArray(data) ? data : toSlices(data);
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const paths = slices.map((item, index) => {
    const sweep = total ? (item.value / total) * 360 : 0;
    const start = cursor;
    const end = index === slices.length - 1 ? 360 : cursor + sweep;
    cursor = end;
    return { ...item, start, end, color: COLORS[index % COLORS.length] };
  });

  return (
    <ChartCard title={title} empty={!slices.length}>
      <div className="flex h-64 flex-col items-center justify-center gap-4 sm:flex-row">
        <svg viewBox="0 0 200 200" className="size-44 shrink-0">
          {paths.length === 1 ? (
            <circle cx="100" cy="100" r="80" fill={paths[0].color} />
          ) : (
            paths.map((item) => (
              <path key={item.name} d={slicePath(100, 100, 80, item.start, item.end)} fill={item.color} />
            ))
          )}
          <circle cx="100" cy="100" r="42" fill="white" />
          <text x="100" y="104" textAnchor="middle" className="fill-slate-800" fontSize="16" fontWeight="600">
            {total}
          </text>
        </svg>
        <ul className="w-full space-y-2 text-sm">
          {paths.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 capitalize text-slate-600">
                <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                {item.name}
              </span>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

function BarBlock({ title, data }) {
  const rows = Array.isArray(data) ? data : toSlices(data);
  const max = Math.max(...rows.map((item) => item.value), 1);

  return (
    <ChartCard title={title} empty={!rows.length}>
      <div className="flex h-64 items-end gap-3 px-1 pb-6">
        {rows.map((item, index) => (
          <div key={item.name} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">{item.value}</span>
            <div
              className="w-full max-w-14 rounded-t-md"
              style={{
                height: `${Math.max(8, (item.value / max) * 180)}px`,
                background: COLORS[index % COLORS.length],
              }}
            />
            <span className="w-full truncate text-center text-[11px] capitalize text-slate-500">{item.name}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

const ATTENDANCE_LABELS = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  holiday: "Holiday",
  unmarked: "Unmarked",
};

export function NgoDashboardCharts({ charts }) {
  if (!charts) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PieBlock title="Today's attendance" data={toSlices(charts.attendanceToday, ATTENDANCE_LABELS)} />
      <PieBlock title="Resource requests" data={charts.requests} />
      <PieBlock title="Projects by status" data={charts.projects} />
      <BarBlock title="Leave requests" data={charts.leave} />
    </div>
  );
}

const ROLE_LABELS = {
  worker: "Workers",
  ngo_admin: "NGO admins",
  platform_admin: "Platform admins",
};

export function PlatformDashboardCharts({ charts }) {
  if (!charts) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PieBlock title="NGO status" data={toSlices(charts.ngos, { active: "Active", inactive: "Inactive" })} />
      <PieBlock title="Users by role" data={toSlices(charts.users, ROLE_LABELS)} />
      <BarBlock title="Platform operations" data={charts.operations} />
    </div>
  );
}

export default function InternalCreateNotice({ title, description, items, actionLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          {items?.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => (
                <li
                  key={item.id ?? item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  {item.label ?? item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          disabled
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400"
        >
          {actionLabel} · coming next
        </button>
      </div>
    </div>
  );
}

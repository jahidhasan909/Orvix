"use client";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";
const labelClass = "text-sm font-medium text-slate-800";

export function StockBadge({ status, quantity }) {
  const map = {
    ok: "bg-emerald-50 text-emerald-700",
    low: "bg-amber-50 text-amber-700",
    out: "bg-red-50 text-red-700",
  };
  const label = status === "out" ? "Out of stock" : status === "low" ? "Low stock" : "In stock";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || map.ok}`}>
      {label}
      {quantity != null ? ` · ${quantity}` : ""}
    </span>
  );
}

export function ItemForm({ item, categories = [], projects = [], sites = [], onSubmit, saving, error, onCancel }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      sku: form.get("sku"),
      description: form.get("description"),
      categoryId: form.get("categoryId"),
      unit: form.get("unit"),
      minLevel: form.get("minLevel"),
      openingStock: form.get("openingStock"),
      status: form.get("status"),
      projectId: form.get("projectId"),
      siteId: form.get("siteId"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Item name</span>
          <input name="name" required defaultValue={item?.name ?? ""} className={inputClass} />
        </label>
        <label>
          <span className={labelClass}>SKU / item code</span>
          <input name="sku" required defaultValue={item?.sku ?? ""} className={inputClass} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Description</span>
          <textarea name="description" rows={3} defaultValue={item?.description ?? ""} className={inputClass} />
        </label>
        <label>
          <span className={labelClass}>Category</span>
          <select name="categoryId" defaultValue={item?.categoryId ?? ""} className={inputClass}>
            <option value="">Uncategorized</option>
            {categories.map((row) => (
              <option key={row.id} value={row.id}>{row.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Unit</span>
          <input name="unit" defaultValue={item?.unit ?? "pcs"} className={inputClass} />
        </label>
        <label>
          <span className={labelClass}>Reorder / minimum level</span>
          <input name="minLevel" type="number" min="0" defaultValue={item?.minLevel ?? 0} className={inputClass} />
        </label>
        {!item ? (
          <label>
            <span className={labelClass}>Opening stock</span>
            <input name="openingStock" type="number" min="0" defaultValue="0" className={inputClass} />
          </label>
        ) : null}
        <label>
          <span className={labelClass}>Status</span>
          <select name="status" defaultValue={item?.status ?? "active"} className={inputClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Project</span>
          <select name="projectId" defaultValue={item?.projectId ?? ""} className={inputClass}>
            <option value="">None</option>
            {projects.map((row) => (
              <option key={row.id} value={row.id}>{row.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Site</span>
          <select name="siteId" defaultValue={item?.siteId ?? ""} className={inputClass}>
            <option value="">None</option>
            {sites.map((row) => (
              <option key={row.id} value={row.id}>{row.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600">
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Saving…" : item ? "Save item" : "Create item"}
        </button>
      </div>
    </form>
  );
}

export { inputClass, labelClass };

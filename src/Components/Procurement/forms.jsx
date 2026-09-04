"use client";

import { PO_STATUS_LABELS } from "@/lib/procurement";

export const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20 disabled:bg-slate-50 disabled:text-slate-500";
export const labelClass = "text-sm font-medium text-slate-800";

export function StatusBadge({ status, labels = PO_STATUS_LABELS }) {
  const tone =
    status === "active" || status === "open" || status === "posted"
      ? "bg-emerald-50 text-emerald-700"
      : status === "received"
        ? "bg-sky-50 text-sky-700"
        : status === "partial"
          ? "bg-amber-50 text-amber-700"
          : status === "inactive" || status === "cancelled"
            ? "bg-slate-100 text-slate-500"
            : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {labels[status] || status}
    </span>
  );
}

export function SupplierForm({
  mode = "create",
  supplier = null,
  disabled = false,
  saving = false,
  error = "",
  onSubmit,
  onCancel,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      contact: form.get("contact"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: form.get("address"),
      category: form.get("category"),
      status: form.get("status"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Supplier details</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Name</span>
            <input name="name" required disabled={disabled} defaultValue={supplier?.name ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Contact person</span>
            <input name="contact" disabled={disabled} defaultValue={supplier?.contact ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Email</span>
            <input name="email" type="email" disabled={disabled} defaultValue={supplier?.email ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Phone</span>
            <input name="phone" disabled={disabled} defaultValue={supplier?.phone ?? ""} className={inputClass} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Address</span>
            <input name="address" disabled={disabled} defaultValue={supplier?.address ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Category</span>
            <input name="category" disabled={disabled} defaultValue={supplier?.category ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Status</span>
            <select name="status" disabled={disabled} defaultValue={supplier?.status ?? "active"} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </section>
      {!disabled ? (
        <div className="flex justify-end gap-2">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
              Cancel
            </button>
          ) : null}
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : mode === "edit" ? "Save supplier" : "Create supplier"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

export function PurchaseOrderForm({
  mode = "create",
  order = null,
  suppliers = [],
  items = [],
  lines,
  onLinesChange,
  disabled = false,
  saving = false,
  error = "",
  onSubmit,
  onCancel,
}) {
  const addLine = () => {
    onLinesChange([...lines, { key: crypto.randomUUID(), itemId: "", quantity: 1, unitPrice: 0 }]);
  };

  const updateLine = (index, patch) => {
    onLinesChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const removeLine = (index) => {
    onLinesChange(lines.length === 1 ? lines : lines.filter((_, i) => i !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      supplierId: form.get("supplierId"),
      date: form.get("date"),
      notes: form.get("notes"),
      lines: lines.map((line) => ({
        itemId: line.itemId,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      })),
    });
  };

  const subtotal = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Purchase order</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Supplier</span>
            <select name="supplierId" required disabled={disabled} defaultValue={order?.supplierId ?? ""} className={inputClass}>
              <option value="">Select supplier</option>
              {suppliers
                .filter((row) => row.status === "active" || row.id === order?.supplierId)
                .map((row) => (
                  <option key={row.id} value={row.id}>{row.name}</option>
                ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Date</span>
            <input
              name="date"
              type="date"
              disabled={disabled}
              defaultValue={order?.date ? String(order.date).slice(0, 10) : ""}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Notes</span>
            <textarea name="notes" rows={3} disabled={disabled} defaultValue={order?.notes ?? ""} className={inputClass} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Line items</p>
          {!disabled ? (
            <button type="button" onClick={addLine} className="text-sm font-semibold text-[#2075fe]">
              Add line
            </button>
          ) : null}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-3 py-2 font-semibold">Item</th>
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2 font-semibold">Unit price</th>
                <th className="px-3 py-2 font-semibold">Line total</th>
                {!disabled ? <th className="px-3 py-2 font-semibold"></th> : null}
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => {
                const total = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
                return (
                  <tr key={line.key || line.id || index} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <select
                        required
                        disabled={disabled}
                        value={line.itemId}
                        onChange={(event) => updateLine(index, { itemId: event.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select item</option>
                        {items
                          .filter((item) => item.status === "active" || item.id === line.itemId)
                          .map((item) => (
                            <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
                          ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 w-28">
                      <input
                        type="number"
                        min="1"
                        required
                        disabled={disabled}
                        value={line.quantity}
                        onChange={(event) => updateLine(index, { quantity: event.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-2 w-36">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        disabled={disabled}
                        value={line.unitPrice}
                        onChange={(event) => updateLine(index, { unitPrice: event.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{total.toFixed(2)}</td>
                    {!disabled ? (
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => removeLine(index)} className="text-sm text-slate-500 hover:text-red-600">
                          Remove
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end gap-8 text-sm">
          <p className="text-slate-500">Subtotal <span className="ml-2 font-semibold text-slate-900">{subtotal.toFixed(2)}</span></p>
          <p className="text-slate-500">Total <span className="ml-2 font-semibold text-slate-900">{subtotal.toFixed(2)}</span></p>
        </div>
      </section>

      {!disabled ? (
        <div className="flex justify-end gap-2">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
              Cancel
            </button>
          ) : null}
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : mode === "edit" ? "Save purchase order" : "Create purchase order"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

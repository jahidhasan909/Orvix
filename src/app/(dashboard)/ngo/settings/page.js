"use client";

import { useEffect, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";

export default function Page() {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/ngo/settings")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load NGO settings.");
        setItem(data.item);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/ngo/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactEmail: form.get("contactEmail"),
        contactPhone: form.get("contactPhone"),
        address: form.get("address"),
        description: form.get("description"),
        logoUrl: form.get("logoUrl"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not update NGO settings.");
      return;
    }
    setItem(data.item);
  };

  if (loading) return <p className="flex items-center gap-2 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading NGO settings…</p>;
  if (!item) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "NGO not found."}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{item.name}</h2>
        <p className="mt-1 text-sm text-slate-500">Organization profile for this NGO. Modules and MFA are managed by the platform admin.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt className="text-slate-500">Category</dt><dd className="mt-1 font-medium">{item.categoryOther || item.category}</dd></div>
          <div><dt className="text-slate-500">Registration</dt><dd className="mt-1 font-medium">{item.registrationNo || "—"}</dd></div>
          <div><dt className="text-slate-500">Status</dt><dd className="mt-1 font-medium capitalize">{item.status}</dd></div>
          <div><dt className="text-slate-500">Enabled modules</dt><dd className="mt-1 font-medium">{(item.enabledModules ?? []).join(", ") || "—"}</dd></div>
        </dl>
      </section>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Contact</p>
        <label>
          <span className="text-sm font-medium">Description</span>
          <textarea name="description" rows={3} defaultValue={item.description} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Contact email</span>
          <input name="contactEmail" type="email" required defaultValue={item.contactEmail} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Contact phone</span>
          <input name="contactPhone" required defaultValue={item.contactPhone} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Address</span>
          <textarea name="address" rows={2} required defaultValue={item.address} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Logo URL</span>
          <input name="logoUrl" type="url" defaultValue={item.logoUrl} className={inputClass} />
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Save settings"}</button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";

export default function Page() {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/platform/settings")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load settings.");
        setItem(data.item);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/platform/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName: form.get("orgName"),
        supportEmail: form.get("supportEmail"),
        sessionDays: item?.sessionDays ?? 7,
        mfaRequiredForAdmins: item?.mfaRequiredForAdmins ?? false,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save settings.");
      return;
    }
    setItem(data.item);
    setSaved("Settings saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Platform Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Organization name and support contact persist for the whole platform.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {saved ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saved}</div> : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label>
          <span className="text-sm font-medium">Organization name</span>
          <input name="orgName" required defaultValue={item?.orgName || "ORVIX"} key={item?.orgName} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Support email</span>
          <input name="supportEmail" type="email" defaultValue={item?.supportEmail || ""} key={item?.supportEmail} className={inputClass} />
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !item} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

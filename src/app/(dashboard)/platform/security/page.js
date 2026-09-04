"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";

export default function Page() {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/platform/settings")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load security settings.");
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
    const response = await api("/platform/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName: item?.orgName || "ORVIX",
        supportEmail: item?.supportEmail || "",
        sessionDays: form.get("sessionDays"),
        mfaRequiredForAdmins: form.get("mfaRequiredForAdmins") === "true",
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save security settings.");
      return;
    }
    setItem(data.item);
    setSaved("Security settings saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Security / MFA</h2>
        <p className="mt-1 text-sm text-slate-500">Platform policy for session length and whether admins should use Microsoft Authenticator. Per-NGO MFA is still configured on each NGO.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {saved ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saved}</div> : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label>
          <span className="text-sm font-medium">Session length (days)</span>
          <input name="sessionDays" type="number" min="1" max="90" required defaultValue={item?.sessionDays ?? 7} key={item?.sessionDays} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium">Require MFA for admins</span>
          <select name="mfaRequiredForAdmins" defaultValue={String(Boolean(item?.mfaRequiredForAdmins))} key={String(item?.mfaRequiredForAdmins)} className={inputClass}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !item} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save security settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

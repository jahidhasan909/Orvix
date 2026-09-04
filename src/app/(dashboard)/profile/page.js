"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { ROLES } from "@/lib/navigation";
import MicrosoftAuthenticatorCard from "@/Components/Account/MicrosoftAuthenticatorCard";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";

export default function Page() {
  const { persona } = useAccess();
  const canEdit =
    persona?.role === ROLES.WORKER ||
    persona?.role === ROLES.NGO_ADMIN ||
    persona?.role === ROLES.PLATFORM_ADMIN;
  const showMfa =
    (persona?.role === ROLES.NGO_ADMIN || persona?.role === ROLES.WORKER) &&
    persona.mfaEnabled;
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (!canEdit) return;
    api("/me")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load profile.");
        setProfile(data.item);
      })
      .catch((loadError) => setError(loadError.message));
  }, [canEdit]);

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    const form = new FormData(event.currentTarget);
    const response = await api("/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), phone: form.get("phone") }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not update profile.");
      return;
    }
    setProfile(data.item);
    setSaved("Profile saved.");
  };

  const onPassword = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setError("");
    setSaved("");
    const form = new FormData(event.currentTarget);
    const response = await api("/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPasswordSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not change password.");
      return;
    }
    event.currentTarget.reset();
    setSaved("Password changed.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Account</h2>
        <p className="mt-1 text-sm text-slate-500">Your profile for this organization.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {saved ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saved}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Profile</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Email</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{persona?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Role</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{persona?.roleLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Organization</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{persona?.orgName}</dd>
          </div>
          {persona?.designationLabel ? (
            <div>
              <dt className="text-xs text-slate-400">Designation</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{persona.designationLabel}</dd>
            </div>
          ) : null}
          {profile?.joiningDate ? (
            <div>
              <dt className="text-xs text-slate-400">Joining date</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {new Date(profile.joiningDate).toLocaleDateString()}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {canEdit ? (
        <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Edit profile</p>
          <label>
            <span className="text-sm font-medium">Name</span>
            <input name="name" required defaultValue={profile?.name || persona?.name || ""} key={profile?.name} className={inputClass} />
          </label>
          <label>
            <span className="text-sm font-medium">Phone</span>
            <input name="phone" defaultValue={profile?.phone || ""} key={profile?.phone} className={inputClass} />
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving…" : "Save profile"}</button>
          </div>
        </form>
      ) : null}

      {canEdit ? (
        <form onSubmit={onPassword} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Change password</p>
          <label>
            <span className="text-sm font-medium">Current password</span>
            <input name="currentPassword" type="password" required className={inputClass} />
          </label>
          <label>
            <span className="text-sm font-medium">New password</span>
            <input name="newPassword" type="password" required minLength={8} className={inputClass} />
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={passwordSaving} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">{passwordSaving ? "Saving…" : "Change password"}</button>
          </div>
        </form>
      ) : null}

      {showMfa ? <MicrosoftAuthenticatorCard twoFactorEnabled={persona.twoFactorEnabled} /> : null}
    </div>
  );
}

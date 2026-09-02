"use client";

import { useAccess } from "@/context/AccessContext";
import { ROLES } from "@/lib/navigation";
import MicrosoftAuthenticatorCard from "@/Components/Account/MicrosoftAuthenticatorCard";

export default function Page() {
  const { persona } = useAccess();
  const showMfa = persona?.role === ROLES.NGO_ADMIN && persona.mfaEnabled;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Account</h2>
        <p className="mt-1 text-sm text-slate-500">Your profile for this organization.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Profile</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Name</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{persona?.name}</dd>
          </div>
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
        </dl>
      </section>

      {showMfa ? <MicrosoftAuthenticatorCard twoFactorEnabled={persona.twoFactorEnabled} /> : null}
    </div>
  );
}

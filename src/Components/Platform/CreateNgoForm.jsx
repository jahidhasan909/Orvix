"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_NGO_MODULE_OPTION_IDS,
  NGO_CATEGORIES,
  NGO_MODULE_OPTIONS,
} from "@/lib/ngo-catalog";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";
const labelClass = "text-sm font-medium text-slate-800";

export default function CreateNgoForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("");
  const [moduleOptionIds, setModuleOptionIds] = useState(DEFAULT_NGO_MODULE_OPTION_IDS);

  const otherSelected = category === "other";
  const selectedCount = moduleOptionIds.length;

  const toggleModule = (id) => {
    setModuleOptionIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAllModules = () => setModuleOptionIds(DEFAULT_NGO_MODULE_OPTION_IDS);

  const payloadHint = useMemo(
    () => `${selectedCount} of ${NGO_MODULE_OPTIONS.length} module groups enabled`,
    [selectedCount]
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get("name"),
      category,
      categoryOther: form.get("categoryOther"),
      description: form.get("description"),
      logoUrl: form.get("logoUrl"),
      registrationNo: form.get("registrationNo"),
      contactEmail: form.get("contactEmail"),
      contactPhone: form.get("contactPhone"),
      address: form.get("address"),
      status: form.get("status"),
      mfaEnabled: form.get("mfaEnabled") === "true",
      sharePointEnabled: form.get("sharePointEnabled") === "true",
      moduleOptionIds,
      admin: {
        fullName: form.get("adminFullName"),
        email: form.get("adminEmail"),
        phone: form.get("adminPhone"),
        password: form.get("adminPassword"),
        status: form.get("adminStatus"),
      },
    };

    const response = await fetch("/api/platform/ngos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Could not create the NGO.");
      return;
    }

    router.push("/platform/ngos");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Create NGO</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Register the organization, enable its modules, and create the first NGO Admin. That admin can only access this NGO.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/platform/ngos")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">1. Basic information</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>NGO Name</span>
            <input name="name" required className={inputClass} placeholder="e.g. Relief Aid Bangladesh" />
          </label>
          <label>
            <span className={labelClass}>NGO Category</span>
            <select
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              <option value="">Select category</option>
              {NGO_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          {otherSelected ? (
            <label>
              <span className={labelClass}>Specify category</span>
              <input name="categoryOther" required className={inputClass} placeholder="Category name" />
            </label>
          ) : null}
          <label>
            <span className={labelClass}>Registration / reference number</span>
            <input name="registrationNo" className={inputClass} placeholder="Optional" />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea name="description" required rows={3} className={inputClass} placeholder="What this NGO does and where it operates." />
          </label>
          <label>
            <span className={labelClass}>Logo URL</span>
            <input name="logoUrl" type="url" className={inputClass} placeholder="Optional https://..." />
          </label>
          <label>
            <span className={labelClass}>Contact email</span>
            <input name="contactEmail" type="email" required className={inputClass} placeholder="ops@ngo.org" />
          </label>
          <label>
            <span className={labelClass}>Contact phone</span>
            <input name="contactPhone" required className={inputClass} placeholder="+880..." />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Address</span>
            <textarea name="address" required rows={2} className={inputClass} placeholder="Street, city, country" />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">2. Modules</p>
            <p className="mt-1 text-sm text-slate-500">{payloadHint}. Unselected modules stay hidden for this NGO.</p>
          </div>
          <button type="button" onClick={selectAllModules} className="text-xs font-semibold text-[#2075fe] hover:underline">
            Use default (all)
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {NGO_MODULE_OPTIONS.map((option) => {
            const checked = moduleOptionIds.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${
                  checked ? "border-[#2075fe]/40 bg-[#2075fe]/5" : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleModule(option.id)}
                  className="mt-1 size-4 accent-[#2075fe]"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">3. Initial NGO Admin</p>
        <p className="mt-1 text-sm text-slate-500">
          This account belongs only to the new NGO. Designations such as Field Worker are not roles and are assigned later by the NGO Admin.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Full name</span>
            <input name="adminFullName" required className={inputClass} placeholder="Admin name" />
          </label>
          <label>
            <span className={labelClass}>Email</span>
            <input name="adminEmail" type="email" required className={inputClass} placeholder="admin@ngo.org" />
          </label>
          <label>
            <span className={labelClass}>Phone</span>
            <input name="adminPhone" className={inputClass} placeholder="Optional" />
          </label>
          <label>
            <span className={labelClass}>Temporary password</span>
            <input name="adminPassword" type="password" required minLength={8} className={inputClass} placeholder="Min. 8 characters" />
          </label>
          <label>
            <span className={labelClass}>Account status</span>
            <select name="adminStatus" defaultValue="active" className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">4. NGO configuration</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className={labelClass}>NGO status</span>
            <select name="status" defaultValue="active" className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Microsoft Authenticator / MFA</span>
            <select name="mfaEnabled" defaultValue="false" className={inputClass}>
              <option value="false">False</option>
              <option value="true">True</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>SharePoint Enable</span>
            <select name="sharePointEnabled" defaultValue="false" className={inputClass}>
              <option value="false">False</option>
              <option value="true">True</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          If MFA is True, the NGO Admin sees Microsoft Authenticator on their account. If SharePoint is True, SharePoint appears for that NGO.
        </p>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/platform/ngos")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save NGO"}
        </button>
      </div>
    </form>
  );
}

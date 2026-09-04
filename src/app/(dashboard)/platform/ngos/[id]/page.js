"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  NGO_CATEGORIES,
  NGO_MODULE_OPTIONS,
  categoryLabel,
  moduleOptionIdsFromEnabled,
} from "@/lib/ngo-catalog";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20 disabled:bg-slate-50 disabled:text-slate-500";
const labelClass = "text-sm font-medium text-slate-800";

function yesNo(value) {
  return value ? "True" : "False";
}

export default function Page() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("");
  const [moduleOptionIds, setModuleOptionIds] = useState([]);

  const admin = ngo?.users?.[0];
  const otherSelected = category === "other";

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/platform/ngos/${id}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load NGO.");
        if (!cancelled) {
          setNgo(data.item);
          setStats(data.stats ?? null);
          setCategory(data.item.category ?? "");
          setModuleOptionIds(moduleOptionIdsFromEnabled(data.item.enabledModules));
        }
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const payloadHint = useMemo(
    () => `${moduleOptionIds.length} of ${NGO_MODULE_OPTIONS.length} module groups enabled`,
    [moduleOptionIds.length]
  );

  const startEdit = () => {
    setCategory(ngo.category ?? "");
    setModuleOptionIds(moduleOptionIdsFromEnabled(ngo.enabledModules));
    setEditing(true);
    setError("");
  };

  const cancelEdit = () => {
    setCategory(ngo.category ?? "");
    setModuleOptionIds(moduleOptionIdsFromEnabled(ngo.enabledModules));
    setEditing(false);
    setError("");
  };

  const toggleModule = (optionId) => {
    setModuleOptionIds((current) =>
      current.includes(optionId) ? current.filter((item) => item !== optionId) : [...current, optionId]
    );
  };

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
      admin: admin
        ? {
            fullName: form.get("adminFullName"),
            email: form.get("adminEmail"),
            phone: form.get("adminPhone"),
            password: form.get("adminPassword"),
            status: form.get("adminStatus"),
          }
        : null,
    };

    const response = await fetch(`/api/platform/ngos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Could not save NGO.");
      return;
    }

    setNgo(data.item);
    setCategory(data.item.category ?? "");
    setModuleOptionIds(moduleOptionIdsFromEnabled(data.item.enabledModules));
    setEditing(false);
  };

  if (loading) {
    return <p className="flex items-center gap-2 py-16 text-sm text-slate-500"><span className="orvix-spinner" />Loading NGO…</p>;
  }

  if (!ngo) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <p className="text-sm text-red-600">{error || "NGO not found."}</p>
        <Link href="/platform/ngos" className="text-sm font-medium text-[#2075fe]">Back to NGOs</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">NGO</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{ngo.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{ngo.code}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/platform/ngos" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Back
          </Link>
          {editing ? (
            <>
              <button type="button" onClick={cancelEdit} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-[#2075fe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : (
            <button type="button" onClick={startEdit} className="rounded-lg bg-[#2075fe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a63dc]">
              Edit
            </button>
          )}
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Workers", value: stats.workers },
            { label: "Projects", value: stats.projects },
            { label: "Sites", value: stats.sites },
            { label: "Pending requests", value: stats.pendingRequests },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Basic information</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>NGO Name</span>
            <input name="name" required disabled={!editing} defaultValue={ngo.name} key={`name-${ngo.updatedAt}-${editing}`} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>NGO Category</span>
            {editing ? (
              <select required value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                {NGO_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            ) : (
              <input disabled className={inputClass} value={categoryLabel(ngo.category, ngo.categoryOther)} />
            )}
          </label>
          {editing && otherSelected ? (
            <label>
              <span className={labelClass}>Specify category</span>
              <input name="categoryOther" required defaultValue={ngo.categoryOther ?? ""} className={inputClass} />
            </label>
          ) : null}
          <label>
            <span className={labelClass}>Registration / reference number</span>
            <input name="registrationNo" disabled={!editing} defaultValue={ngo.registrationNo ?? ""} key={`reg-${editing}`} className={inputClass} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea name="description" required disabled={!editing} rows={3} defaultValue={ngo.description ?? ""} key={`desc-${editing}`} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Logo URL</span>
            <input name="logoUrl" disabled={!editing} defaultValue={ngo.logoUrl ?? ""} key={`logo-${editing}`} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Contact email</span>
            <input name="contactEmail" type="email" required disabled={!editing} defaultValue={ngo.contactEmail} key={`cemail-${editing}`} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Contact phone</span>
            <input name="contactPhone" required disabled={!editing} defaultValue={ngo.contactPhone} key={`cphone-${editing}`} className={inputClass} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Address</span>
            <textarea name="address" required disabled={!editing} rows={2} defaultValue={ngo.address} key={`addr-${editing}`} className={inputClass} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Modules</p>
        <p className="mt-1 text-sm text-slate-500">{payloadHint}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {NGO_MODULE_OPTIONS.map((option) => {
            const checked = moduleOptionIds.includes(option.id);
            return (
              <label
                key={option.id}
                className={`flex gap-3 rounded-xl border p-3 ${checked ? "border-[#2075fe]/40 bg-[#2075fe]/5" : "border-slate-200"} ${editing ? "cursor-pointer" : "cursor-default"}`}
              >
                <input
                  type="checkbox"
                  disabled={!editing}
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

      {admin ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">NGO Admin</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Full name</span>
              <input name="adminFullName" required disabled={!editing} defaultValue={admin.name} key={`an-${editing}`} className={inputClass} />
            </label>
            <label>
              <span className={labelClass}>Email</span>
              <input name="adminEmail" type="email" required disabled={!editing} defaultValue={admin.email} key={`ae-${editing}`} className={inputClass} />
            </label>
            <label>
              <span className={labelClass}>Phone</span>
              <input name="adminPhone" disabled={!editing} defaultValue={admin.phone ?? ""} key={`ap-${editing}`} className={inputClass} />
            </label>
            <label>
              <span className={labelClass}>Account status</span>
              <select name="adminStatus" disabled={!editing} defaultValue={admin.status} key={`as-${editing}`} className={inputClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            {editing ? (
              <label className="sm:col-span-2">
                <span className={labelClass}>New password</span>
                <input name="adminPassword" type="password" minLength={8} className={inputClass} placeholder="Leave blank to keep current password" />
              </label>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Configuration</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className={labelClass}>NGO status</span>
            <select name="status" disabled={!editing} defaultValue={ngo.status} key={`st-${editing}`} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Microsoft Authenticator / MFA</span>
            {editing ? (
              <select name="mfaEnabled" defaultValue={String(Boolean(ngo.mfaEnabled))} key={`mfa-${editing}`} className={inputClass}>
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            ) : (
              <input disabled className={inputClass} value={yesNo(ngo.mfaEnabled)} />
            )}
          </label>
          <label>
            <span className={labelClass}>SharePoint Enable</span>
            {editing ? (
              <select name="sharePointEnabled" defaultValue={String(Boolean(ngo.sharePointEnabled))} key={`sp-${editing}`} className={inputClass}>
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            ) : (
              <input disabled className={inputClass} value={yesNo(ngo.sharePointEnabled)} />
            )}
          </label>
        </div>
      </section>
    </form>
  );
}

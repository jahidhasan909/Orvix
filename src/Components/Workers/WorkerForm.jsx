"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WORKER_DESIGNATIONS,
  WORKER_PERMISSIONS,
  defaultPermissionsFor,
} from "@/lib/worker-catalog";
import { DESIGNATIONS } from "@/lib/navigation";
import { dateInputValue } from "@/lib/worker-payload";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20 disabled:bg-slate-50 disabled:text-slate-500";
const labelClass = "text-sm font-medium text-slate-800";

export default function WorkerForm({
  mode = "create",
  worker = null,
  projects = [],
  sites = [],
  disabled = false,
  onSubmit,
  saving = false,
  error = "",
  onCancel,
}) {
  const router = useRouter();
  const [designation, setDesignation] = useState(worker?.designation ?? "");
  const [permissions, setPermissions] = useState(worker?.extraPermissions ?? []);
  const [projectIds, setProjectIds] = useState(worker?.assignedProjectIds ?? []);
  const [siteIds, setSiteIds] = useState(worker?.assignedSiteIds ?? []);

  const otherSelected = designation === DESIGNATIONS.OTHER;
  const visibleSites = useMemo(() => {
    if (!projectIds.length) return sites;
    return sites.filter((site) => !site.projectId || projectIds.includes(site.projectId));
  }, [projectIds, sites]);

  const toggle = (list, id, setter) => {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  };

  const changeDesignation = (value) => {
    setDesignation(value);
    setPermissions(defaultPermissionsFor(value));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone"),
      employeeId: form.get("employeeId"),
      designation,
      designationOther: form.get("designationOther"),
      image: form.get("image"),
      address: form.get("address"),
      joiningDate: form.get("joiningDate"),
      status: form.get("status"),
      password: form.get("password"),
      mfaEnabled: form.get("mfaEnabled") === "true",
      permissions,
      assignedProjectIds: projectIds,
      assignedSiteIds: siteIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">1. Worker information</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Full name</span>
            <input name="fullName" required disabled={disabled} defaultValue={worker?.name ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Email</span>
            <input name="email" type="email" required disabled={disabled} defaultValue={worker?.email ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Phone number</span>
            <input name="phone" required disabled={disabled} defaultValue={worker?.phone ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Employee ID</span>
            <input name="employeeId" required disabled={disabled} defaultValue={worker?.employeeId ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Profile photo URL</span>
            <input name="image" type="url" disabled={disabled} defaultValue={worker?.image ?? ""} className={inputClass} placeholder="Optional" />
          </label>
          <label>
            <span className={labelClass}>Joining date</span>
            <input
              name="joiningDate"
              type="date"
              required
              disabled={disabled}
              defaultValue={dateInputValue(worker?.joiningDate)}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Address</span>
            <textarea name="address" rows={2} disabled={disabled} defaultValue={worker?.address ?? ""} className={inputClass} placeholder="Optional" />
          </label>
          <label>
            <span className={labelClass}>Account status</span>
            <select name="status" disabled={disabled} defaultValue={worker?.status ?? "active"} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>{mode === "create" ? "Temporary password" : "Reset password"}</span>
            <input
              name="password"
              type="password"
              required={mode === "create"}
              minLength={mode === "create" ? 8 : undefined}
              disabled={disabled}
              className={inputClass}
              placeholder={mode === "create" ? "Min. 8 characters" : "Leave blank to keep current"}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">2. Designation</p>
        <p className="mt-2 text-sm text-slate-500">Designations are not system roles. Access is controlled by the permissions below.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Designation</span>
            <select
              required
              disabled={disabled}
              value={designation}
              onChange={(event) => changeDesignation(event.target.value)}
              className={inputClass}
            >
              <option value="">Select designation</option>
              {WORKER_DESIGNATIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          {otherSelected ? (
            <label>
              <span className={labelClass}>Other designation</span>
              <input name="designationOther" required disabled={disabled} defaultValue={worker?.designationOther ?? ""} className={inputClass} />
            </label>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">3. Project / site assignment</p>
        <p className="mt-2 text-sm text-slate-500">This worker can only use the projects and sites selected here.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <p className={labelClass}>Projects</p>
            {projects.length ? (
              <ul className="mt-2 space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <label className="flex items-center gap-2 text-sm text-slate-800">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={projectIds.includes(project.id)}
                        onChange={() => toggle(projectIds, project.id, setProjectIds)}
                      />
                      {project.name}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No projects in this NGO yet.</p>
            )}
          </div>
          <div>
            <p className={labelClass}>Operational sites</p>
            {visibleSites.length ? (
              <ul className="mt-2 space-y-2">
                {visibleSites.map((site) => (
                  <li key={site.id}>
                    <label className="flex items-center gap-2 text-sm text-slate-800">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={siteIds.includes(site.id)}
                        onChange={() => toggle(siteIds, site.id, setSiteIds)}
                      />
                      {site.name}{site.location ? ` · ${site.location}` : ""}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No sites match the selected projects.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">4. Permissions</p>
        <p className="mt-2 text-sm text-slate-500">Suggested from the designation. Add or remove access without changing the system role.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {WORKER_PERMISSIONS.map((item) => (
            <li key={item.id}>
              <label className="flex items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={permissions.includes(item.id)}
                  onChange={() => toggle(permissions, item.id, setPermissions)}
                />
                {item.label}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">5. Microsoft Authentication</p>
        <label className="mt-4 block max-w-sm">
          <span className={labelClass}>Microsoft Authentication</span>
          <select name="mfaEnabled" disabled={disabled} defaultValue={String(Boolean(worker?.mfaEnabled))} className={inputClass}>
            <option value="false">False / Disabled</option>
            <option value="true">True / Enabled</option>
          </select>
        </label>
        <p className="mt-3 text-xs text-slate-500">
          If True, this worker sees Microsoft Authenticator on their account. If False, that option is hidden.
        </p>
      </section>

      {!disabled ? (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel ?? (() => router.push("/workers"))}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Create account" : "Save worker"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

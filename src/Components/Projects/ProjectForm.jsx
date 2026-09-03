"use client";

import { PROJECT_STATUSES, SITE_STATUSES, STATUS_LABELS } from "@/lib/project-site";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20 disabled:bg-slate-50 disabled:text-slate-500";
const labelClass = "text-sm font-medium text-slate-800";

export default function ProjectForm({
  mode = "create",
  project = null,
  workers = [],
  selectedWorkerIds = [],
  onWorkerIdsChange,
  disabled = false,
  onSubmit,
  saving = false,
  error = "",
  onCancel,
}) {
  const statuses = PROJECT_STATUSES;

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      description: form.get("description"),
      manager: form.get("manager"),
      status: form.get("status"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      workerIds: selectedWorkerIds,
    });
  };

  const toggleWorker = (id) => {
    if (!onWorkerIdsChange) return;
    onWorkerIdsChange(
      selectedWorkerIds.includes(id)
        ? selectedWorkerIds.filter((item) => item !== id)
        : [...selectedWorkerIds, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Project details</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Project name</span>
            <input name="name" required disabled={disabled} defaultValue={project?.name ?? ""} className={inputClass} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea
              name="description"
              rows={4}
              disabled={disabled}
              defaultValue={project?.description ?? ""}
              className={inputClass}
            />
          </label>
          <label>
            <span className={labelClass}>Project manager</span>
            <input name="manager" disabled={disabled} defaultValue={project?.manager ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Status</span>
            <select name="status" disabled={disabled} defaultValue={project?.status ?? "active"} className={inputClass}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Start date</span>
            <input name="startDate" type="date" disabled={disabled} defaultValue={project?.startDate ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>End date</span>
            <input name="endDate" type="date" disabled={disabled} defaultValue={project?.endDate ?? ""} className={inputClass} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Assigned workers</p>
        <p className="mt-2 text-sm text-slate-500">Only workers from this NGO can be assigned.</p>
        {workers.length ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {workers.map((worker) => (
              <li key={worker.id}>
                <label className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selectedWorkerIds.includes(worker.id)}
                    onChange={() => toggleWorker(worker.id)}
                  />
                  {worker.name}
                  {worker.employeeId ? ` · ${worker.employeeId}` : ""}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No workers in this NGO yet.</p>
        )}
      </section>

      {!disabled ? (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Create project" : "Save project"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

export function SiteForm({
  mode = "create",
  site = null,
  projects = [],
  workers = [],
  selectedWorkerIds = [],
  onWorkerIdsChange,
  disabled = false,
  onSubmit,
  saving = false,
  error = "",
  onCancel,
  defaultProjectId = "",
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      projectId: form.get("projectId"),
      location: form.get("location"),
      description: form.get("description"),
      status: form.get("status"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      workerIds: selectedWorkerIds,
    });
  };

  const toggleWorker = (id) => {
    if (!onWorkerIdsChange) return;
    onWorkerIdsChange(
      selectedWorkerIds.includes(id)
        ? selectedWorkerIds.filter((item) => item !== id)
        : [...selectedWorkerIds, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Site details</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Site name</span>
            <input name="name" required disabled={disabled} defaultValue={site?.name ?? ""} className={inputClass} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Project</span>
            <select
              name="projectId"
              required
              disabled={disabled}
              key={`project-${projects.length}-${site?.projectId || defaultProjectId}`}
              defaultValue={site?.projectId || defaultProjectId}
              className={inputClass}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Location / address</span>
            <input name="location" disabled={disabled} defaultValue={site?.location ?? ""} className={inputClass} />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea
              name="description"
              rows={4}
              disabled={disabled}
              defaultValue={site?.description ?? ""}
              className={inputClass}
            />
          </label>
          <label>
            <span className={labelClass}>Status</span>
            <select name="status" disabled={disabled} defaultValue={site?.status ?? "active"} className={inputClass}>
              {SITE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Start date</span>
            <input name="startDate" type="date" disabled={disabled} defaultValue={site?.startDate ?? ""} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>End date</span>
            <input name="endDate" type="date" disabled={disabled} defaultValue={site?.endDate ?? ""} className={inputClass} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Assigned workers</p>
        <p className="mt-2 text-sm text-slate-500">Assigning a site also assigns the parent project.</p>
        {workers.length ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {workers.map((worker) => (
              <li key={worker.id}>
                <label className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selectedWorkerIds.includes(worker.id)}
                    onChange={() => toggleWorker(worker.id)}
                  />
                  {worker.name}
                  {worker.employeeId ? ` · ${worker.employeeId}` : ""}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No workers in this NGO yet.</p>
        )}
      </section>

      {!disabled ? (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Create site" : "Save site"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

export function StatusBadge({ status }) {
  const active = status === "active";
  const archived = status === "archived";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : archived
            ? "bg-slate-100 text-slate-500"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

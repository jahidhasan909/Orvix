"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkerForm from "@/Components/Workers/WorkerForm";

function yesNo(value) {
  return value ? "True" : "False";
}

export default function Page() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      fetch(`/api/ngo/workers/${id}`).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load worker.");
        return data.item;
      }),
      fetch("/api/ngo/assignments").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load assignments.");
        return data;
      }),
    ])
      .then(([item, assignments]) => {
        setWorker(item);
        setProjects(assignments.projects ?? []);
        setSites(assignments.sites ?? []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const onSubmit = async (body) => {
    setError("");
    setSaving(true);
    const response = await fetch(`/api/ngo/workers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not update the worker.");
      return;
    }
    setWorker(data.item);
    setEditing(false);
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading worker…</p>;
  }

  if (!worker) {
    return <p className="text-sm text-red-600">{error || "Worker not found."}</p>;
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Edit worker</h2>
          <p className="mt-1 text-sm text-slate-500">{worker.email}</p>
        </div>
        <WorkerForm
          key={`edit-${worker.updatedAt ?? worker.id}`}
          mode="edit"
          worker={worker}
          projects={projects}
          sites={sites}
          error={error}
          saving={saving}
          onSubmit={onSubmit}
          onCancel={() => {
            setEditing(false);
            setError("");
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{worker.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{worker.employeeId} · {worker.designationLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]"
        >
          Edit
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Email</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Phone</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Address</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Joining date</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {worker.joiningDate ? new Date(worker.joiningDate).toLocaleDateString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Projects</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.assignedProjects.join(", ") || "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Sites</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.assignedSites.join(", ") || "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Microsoft Authentication</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{yesNo(worker.mfaEnabled)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Status</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.status === "active" ? "Active" : "Inactive"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-400">Permissions</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {worker.extraPermissions.length ? worker.extraPermissions.join(", ") : "None"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

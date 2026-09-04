"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ProjectForm, { StatusBadge } from "@/Components/Projects/ProjectForm";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [workerIds, setWorkerIds] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    Promise.all([
      fetch(`/api/ngo/projects/${id}`).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load project.");
        return data.item;
      }),
      fetch("/api/ngo/workers").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load workers.");
        return data.items ?? [];
      }),
    ])
      .then(([item, allWorkers]) => {
        setProject(item);
        setWorkers(allWorkers);
        setWorkerIds((item.workers ?? []).map((worker) => worker.id));
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
    const response = await fetch(`/api/ngo/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not update the project.");
      return;
    }
    setProject(data.item);
    setWorkerIds((data.item.workers ?? []).map((worker) => worker.id));
    setEditing(false);
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this project? If it has sites or activities it will be archived instead.")) return;
    setDeleting(true);
    const response = await fetch(`/api/ngo/projects/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) {
      setError(data.error || "Could not delete the project.");
      return;
    }
    if (data.archived) {
      setProject(data.item);
      setError(data.message || "Project was archived.");
      return;
    }
    router.push("/projects");
  };

  if (loading) return <p className="flex items-center gap-2 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading project…</p>;
  if (!project) return <p className="text-sm text-red-600">{error || "Project not found."}</p>;

  if (editing) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Edit Project</h2>
          <p className="mt-1 text-sm text-slate-500">{project.name}</p>
        </div>
        <ProjectForm
          mode="edit"
          project={project}
          workers={workers}
          selectedWorkerIds={workerIds}
          onWorkerIdsChange={setWorkerIds}
          error={error}
          saving={saving}
          onSubmit={onSubmit}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{project.name}</h2>
          <p className="mt-1 text-sm text-slate-500">Belongs to this NGO only.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {deleting ? "Working…" : project.status === "archived" ? "Already archived" : "Delete / Archive"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={project.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Manager</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{project.manager || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Start date</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{project.startDate || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">End date</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{project.endDate || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{project.description || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-800">Sites</p>
          <Link href={`/sites/new?projectId=${project.id}`} className="text-sm font-semibold text-[#2075fe] hover:underline">
            Add site
          </Link>
        </div>
        {project.sites?.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {project.sites.map((site) => (
              <li key={site.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{site.name}</p>
                  <p className="text-xs text-slate-400">{site.location || "No location"}</p>
                </div>
                <Link href={`/sites/${site.id}`} className="text-sm font-semibold text-[#2075fe] hover:underline">
                  View
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No sites under this project yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-800">Assigned workers</p>
        {project.workers?.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {project.workers.map((worker) => (
              <li key={worker.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{worker.name}</p>
                  <p className="text-xs text-slate-400">{worker.email}</p>
                </div>
                <Link href={`/workers/${worker.id}`} className="text-sm font-semibold text-[#2075fe] hover:underline">
                  View
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No workers assigned to this project.</p>
        )}
      </section>
    </div>
  );
}

"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/Components/Projects/ProjectForm";

export default function Page() {
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/assignments/me")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load assignments.");
        setProjects(data.projects ?? []);
        setSites(data.sites ?? []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">My Projects / Sites</h2>
        <p className="mt-1 text-sm text-slate-500">
          You only see work assigned to you in your own NGO.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Assigned projects</p>
        </div>
        {loading ? (
          <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p>
        ) : projects.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400">No projects assigned yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {projects.map((project) => (
              <li key={project.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{project.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{project.description || "No description"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {project.startDate || project.endDate
                        ? `${project.startDate || "—"} → ${project.endDate || "—"}`
                        : "Dates not set"}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Assigned sites</p>
        </div>
        {loading ? (
          <p className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading…</p>
        ) : sites.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400">No sites assigned yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sites.map((site) => (
              <li key={site.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{site.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {site.projectName ? `Project: ${site.projectName}` : "No project"}
                      {site.location ? ` · ${site.location}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{site.description || "No description"}</p>
                  </div>
                  <StatusBadge status={site.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

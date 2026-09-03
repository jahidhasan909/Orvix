"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteForm } from "@/Components/Projects/ProjectForm";

function NewSiteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProjectId = searchParams.get("projectId") || "";
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [workerIds, setWorkerIds] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/ngo/projects").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load projects.");
        return data.items ?? [];
      }),
      fetch("/api/ngo/workers").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load workers.");
        return data.items ?? [];
      }),
    ])
      .then(([projectItems, workerItems]) => {
        setProjects(projectItems);
        setWorkers(workerItems);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const onSubmit = async (body) => {
    setError("");
    setSaving(true);
    const response = await fetch("/api/ngo/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the site.");
      return;
    }
    router.push(`/sites/${data.item.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Add Site</h2>
        <p className="mt-1 text-sm text-slate-500">Each site belongs to one project in this NGO.</p>
      </div>
      <SiteForm
        mode="create"
        projects={projects}
        workers={workers}
        selectedWorkerIds={workerIds}
        onWorkerIdsChange={setWorkerIds}
        defaultProjectId={defaultProjectId}
        error={error}
        saving={saving}
        onSubmit={onSubmit}
        onCancel={() => router.push("/sites")}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
      <NewSiteForm />
    </Suspense>
  );
}

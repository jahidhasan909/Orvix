"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectForm from "@/Components/Projects/ProjectForm";

export default function Page() {
  const router = useRouter();
  const [workers, setWorkers] = useState([]);
  const [workerIds, setWorkerIds] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/ngo/workers")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load workers.");
        setWorkers(data.items ?? []);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const onSubmit = async (body) => {
    setError("");
    setSaving(true);
    const response = await api("/ngo/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the project.");
      return;
    }
    router.push(`/projects/${data.item.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Add Project</h2>
        <p className="mt-1 text-sm text-slate-500">This project belongs only to your NGO.</p>
      </div>
      <ProjectForm
        mode="create"
        workers={workers}
        selectedWorkerIds={workerIds}
        onWorkerIdsChange={setWorkerIds}
        error={error}
        saving={saving}
        onSubmit={onSubmit}
        onCancel={() => router.push("/projects")}
      />
    </div>
  );
}

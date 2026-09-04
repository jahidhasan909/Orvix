"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WorkerForm from "@/Components/Workers/WorkerForm";

export default function Page() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/ngo/assignments")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load assignments.");
        setProjects(data.projects ?? []);
        setSites(data.sites ?? []);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const onSubmit = async (body) => {
    setError("");
    setSaving(true);
    const response = await api("/ngo/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the worker.");
      return;
    }
    router.push(`/workers/${data.item.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Add Worker</h2>
        <p className="mt-1 text-sm text-slate-500">This account belongs only to your NGO.</p>
      </div>
      <WorkerForm
        mode="create"
        projects={projects}
        sites={sites}
        error={error}
        saving={saving}
        onSubmit={onSubmit}
      />
    </div>
  );
}

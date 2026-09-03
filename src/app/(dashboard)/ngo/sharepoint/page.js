"use client";

import { useEffect, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20";
const labelClass = "text-sm font-medium text-slate-800";

export default function Page() {
  const { persona, isPending } = useAccess();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isPending && !persona?.sharePointEnabled) {
      router.replace("/dashboard");
    }
  }, [isPending, persona, router]);

  useEffect(() => {
    if (!persona?.sharePointEnabled) return;
    fetch("/api/ngo/sharepoint")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "SharePoint is not available.");
        setItem(data.item);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [persona?.sharePointEnabled]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/ngo/sharepoint", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteUrl: form.get("siteUrl"),
        library: form.get("library"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save SharePoint settings.");
      return;
    }
    setItem(data.item);
  };

  if (!persona?.sharePointEnabled) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">SharePoint</h2>
        <p className="mt-1 text-sm text-slate-500">
          SharePoint is enabled for {persona.orgName}. Configuration is stored for this NGO only.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-800">Status</p>
        <p className="mt-2 text-sm text-slate-600">
          {item?.enabled ? "Enabled — this NGO can use SharePoint." : loading ? "Loading…" : "Unavailable"}
        </p>
      </section>

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Connection</p>
        <div className="mt-4 grid gap-4">
          <label>
            <span className={labelClass}>SharePoint site URL</span>
            <input
              name="siteUrl"
              type="url"
              placeholder="https://contoso.sharepoint.com/sites/ngo"
              defaultValue={item?.siteUrl ?? ""}
              key={item?.siteUrl ?? "url"}
              className={inputClass}
            />
          </label>
          <label>
            <span className={labelClass}>Document library</span>
            <input
              name="library"
              placeholder="Documents"
              defaultValue={item?.library ?? ""}
              key={item?.library ?? "lib"}
              className={inputClass}
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useAccess } from "@/context/AccessContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { persona, isPending } = useAccess();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !persona?.sharePointEnabled) {
      router.replace("/dashboard");
    }
  }, [isPending, persona, router]);

  if (!persona?.sharePointEnabled) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">SharePoint</h2>
        <p className="mt-1 text-sm text-slate-500">
          SharePoint is enabled for {persona.orgName}. Libraries and file workflows for this NGO will appear here.
        </p>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-800">SharePoint connection</p>
        <p className="mt-2 text-sm text-slate-500">
          This NGO can use SharePoint. Site mapping and document sync can be added next.
        </p>
      </section>
    </div>
  );
}

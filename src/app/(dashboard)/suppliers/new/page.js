"use client";

import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SupplierForm } from "@/Components/Procurement/forms";

export default function Page() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (body) => {
    setError("");
    setSaving(true);
    const response = await api("/ngo/inventory/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not create the supplier.");
      return;
    }
    router.push(`/suppliers/${data.item.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/suppliers" className="text-sm font-medium text-[#2075fe]">← Suppliers</Link>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">New supplier</h2>
      </div>
      <SupplierForm mode="create" saving={saving} error={error} onSubmit={onSubmit} onCancel={() => router.push("/suppliers")} />
    </div>
  );
}

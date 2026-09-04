"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge, SupplierForm } from "@/Components/Procurement/forms";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api(`/ngo/inventory/suppliers/${id}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load supplier.");
        setItem(data.item);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const onSubmit = async (body) => {
    setSaving(true);
    setError("");
    const response = await api(`/ngo/inventory/suppliers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not update the supplier.");
      return;
    }
    setItem({ ...item, ...data.item });
    setEditing(false);
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this supplier? If it is used on orders or receipts it will be archived instead.")) return;
    setDeleting(true);
    const response = await api(`/ngo/inventory/suppliers/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) {
      setError(data.error || "Could not delete the supplier.");
      return;
    }
    if (data.archived) {
      setItem({ ...item, ...data.item });
      setError(data.message || "Supplier was archived.");
      return;
    }
    router.push("/suppliers");
  };

  if (loading) return <p className="flex items-center gap-2 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading supplier…</p>;
  if (!item) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href="/suppliers" className="text-sm font-medium text-[#2075fe]">← Suppliers</Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Supplier not found."}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/suppliers" className="text-sm font-medium text-[#2075fe]">← Suppliers</Link>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{item.name}</h2>
            <StatusBadge status={item.status} labels={{ active: "Active", inactive: "Inactive" }} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {item.orderCount ?? 0} orders · {item.purchaseCount ?? 0} purchases · {item.receiptCount ?? 0} receipts
          </p>
        </div>
        {!editing ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white">Edit</button>
            <button type="button" onClick={onDelete} disabled={deleting} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
              {deleting ? "Working…" : "Delete"}
            </button>
          </div>
        ) : null}
      </div>

      {error && !editing ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {editing ? (
        <SupplierForm
          mode="edit"
          supplier={item}
          saving={saving}
          error={error}
          onSubmit={onSubmit}
          onCancel={() => { setEditing(false); setError(""); }}
        />
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div><dt className="text-slate-500">Contact</dt><dd className="mt-1 font-medium">{item.contact || "—"}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd className="mt-1 font-medium">{item.email || "—"}</dd></div>
            <div><dt className="text-slate-500">Phone</dt><dd className="mt-1 font-medium">{item.phone || "—"}</dd></div>
            <div><dt className="text-slate-500">Category</dt><dd className="mt-1 font-medium">{item.category || "—"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-slate-500">Address</dt><dd className="mt-1 font-medium">{item.address || "—"}</dd></div>
          </dl>
        </section>
      )}
    </div>
  );
}

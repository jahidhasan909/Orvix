"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/Components/Procurement/forms";

export default function Page() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = (search = q) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    fetch(`/api/ngo/inventory/suppliers${params.toString() ? `?${params}` : ""}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load suppliers.");
        setItems(data.items ?? []);
        setError("");
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(""); }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Suppliers</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Vendors for this NGO only. Used on purchase orders and receiving.</p>
        </div>
        <Link href="/suppliers/new" className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]">
          Add supplier
        </Link>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <form
        onSubmit={(event) => { event.preventDefault(); load(q); }}
        className="flex flex-wrap gap-3"
      >
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search name, contact, email…"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2075fe] focus:ring-2 focus:ring-[#2075fe]/20"
        />
        <button type="submit" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Search</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Suppliers in this NGO</p>
          <p className="text-xs text-slate-400">{loading ? <span className="inline-flex items-center gap-2"><span className="orvix-spinner" />Loading…</span> : `${items.length} total`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-slate-400">
                    No suppliers yet. Add the first vendor for this organization.
                  </td>
                </tr>
              ) : items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <Link href={`/suppliers/${row.id}`} className="font-medium text-slate-900 hover:text-[#2075fe]">{row.name}</Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{row.email || row.phone || row.contact || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{row.category || "—"}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.status} labels={{ active: "Active", inactive: "Inactive" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

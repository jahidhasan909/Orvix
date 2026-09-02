"use client";

import { usePathname } from "next/navigation";
import { PAGE_META } from "@/lib/navigation";
import { usePreviewAccess } from "@/context/PreviewAccessContext";

export default function PlaceholderPage({ title, description, columns }) {
  const pathname = usePathname();
  const { persona } = usePreviewAccess();
  const meta = PAGE_META[pathname] ?? {};
  const heading = title ?? meta.title ?? "Page";
  const copy = description ?? meta.description ?? "This workspace is ready for future module functionality.";
  const headers = columns ?? ["Name", "Status", "Updated", "Owner"];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{heading}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{copy}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
          {persona.roleLabel}
          {persona.designationLabel ? ` · ${persona.designationLabel}` : ""}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Records</p>
          <p className="text-xs text-slate-400">Frontend placeholder</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-5 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={headers.length} className="px-5 py-16 text-center text-sm text-slate-400">
                  No live data yet. This route is in place for navigation and layout review.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

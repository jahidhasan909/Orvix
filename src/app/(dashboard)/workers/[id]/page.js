"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkerForm from "@/Components/Workers/WorkerForm";

function yesNo(value) {
  return value ? "True" : "False";
}

export default function Page() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      api(`/ngo/workers/${id}`).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load worker.");
        return data.item;
      }),
      api("/ngo/assignments").then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load assignments.");
        return data;
      }),
      api(`/ngo/workers/${id}/payroll`).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return null;
        return data;
      }),
    ])
      .then(([item, assignments, pay]) => {
        setWorker(item);
        setProjects(assignments.projects ?? []);
        setSites(assignments.sites ?? []);
        setPayroll(pay);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const onSubmit = async (body) => {
    setError("");
    setSaving(true);
    const response = await api(`/ngo/workers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not update the worker.");
      return;
    }
    setWorker(data.item);
    setEditing(false);
  };

  if (loading) {
    return <p className="flex items-center gap-2 py-16 text-sm text-slate-400"><span className="orvix-spinner" />Loading worker…</p>;
  }

  if (!worker) {
    return <p className="text-sm text-red-600">{error || "Worker not found."}</p>;
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Edit worker</h2>
          <p className="mt-1 text-sm text-slate-500">{worker.email}</p>
        </div>
        <WorkerForm
          key={`edit-${worker.updatedAt ?? worker.id}`}
          mode="edit"
          worker={worker}
          projects={projects}
          sites={sites}
          error={error}
          saving={saving}
          onSubmit={onSubmit}
          onCancel={() => {
            setEditing(false);
            setError("");
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{worker.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{worker.employeeId} · {worker.designationLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]"
        >
          Edit
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Email</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Phone</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Address</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Joining date</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {worker.joiningDate ? new Date(worker.joiningDate).toLocaleDateString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Projects</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.assignedProjects.join(", ") || "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Sites</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.assignedSites.join(", ") || "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Basic salary</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.salary?.basicSalary ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Salary type</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {worker.salary?.salaryType === "daily" ? "Daily" : worker.salary ? "Monthly" : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Salary status</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {worker.salary?.status === "inactive" ? "Inactive" : worker.salary ? "Active" : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Microsoft Authentication</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{yesNo(worker.mfaEnabled)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Status</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{worker.status === "active" ? "Active" : "Inactive"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-400">Permissions</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {worker.extraPermissions.length ? worker.extraPermissions.join(", ") : "None"}
            </dd>
          </div>
        </dl>
      </section>

      {payroll?.calculation && !payroll.calculation.skipped ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">This month salary</p>
          <p className="mt-1 text-sm text-slate-500">
            {payroll.period?.from} to {payroll.period?.to}. Unrecorded working days count as absent.
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-4">
            <PayStat label="Working days" value={payroll.calculation.workingDays} />
            <PayStat label="Present" value={payroll.calculation.presentDays} />
            <PayStat label="Absent" value={payroll.calculation.absentDays} />
            <PayStat label="Paid leave" value={payroll.calculation.paidLeaveDays} />
            <PayStat label="Unpaid leave" value={payroll.calculation.unpaidLeaveDays} />
            <PayStat label="Total salary" value={payroll.calculation.totalSalary} />
            <PayStat label="Deduction" value={payroll.calculation.totalDeduction} />
            <PayStat label="Payable" value={payroll.calculation.payableSalary} />
          </dl>
        </section>
      ) : null}
    </div>
  );
}

function PayStat({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
